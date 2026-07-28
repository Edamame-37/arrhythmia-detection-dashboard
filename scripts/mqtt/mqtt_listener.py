#!/usr/bin/env python3
import os
import ssl
import json
import csv
import asyncio
import threading
from datetime import datetime, timezone, timedelta
import paho.mqtt.client as mqtt
import websockets

# Configuration
BROKER_HOST = "93d81a02c1f743b6ab4ea22d7ad9c3e0.s1.eu.hivemq.cloud"
BROKER_PORT = 8883
USERNAME = "ecg-undip"
PASSWORD = "undipjaya"
TOPIC = "ecgrhythmia/device01/"
QOS = 1

# Setup dataset directories relative to the script location
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
RAW_DIR = os.path.join(DATASET_DIR, "raw")
CSV_DIR = os.path.join(DATASET_DIR, "csv")
PACKET_LOSS_LOG = os.path.join(DATASET_DIR, "packet_loss_log.txt")

# Create directories
os.makedirs(RAW_DIR, exist_ok=True)
os.makedirs(CSV_DIR, exist_ok=True)

# In-memory tracking for packet loss checks
state = {
    "last_frame_counter": None,
    "last_created_at": None,
    "last_frame_id": None
}

# WebSocket client set and event loop reference
ws_clients = set()
main_loop = None

def sanitize_filename(filename):
    """Replaces characters that might be invalid in file systems."""
    return filename.replace(":", "-").replace("+", "_plus").replace(".", "_")

def log_packet_loss(message):
    """Logs packet loss warnings to console and a text file."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    formatted_msg = f"[{timestamp}] {message}\n"
    print(f"\033[93m{formatted_msg.strip()}\033[0m")  # Yellow text in terminal
    try:
        with open(PACKET_LOSS_LOG, "a") as f:
            f.write(formatted_msg)
    except Exception as e:
        print(f"Failed to write to packet loss log file: {e}")

async def register_client(websocket):
    """Registers connected WebSocket clients."""
    ws_clients.add(websocket)
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] [WebSocket] Client connected: {websocket.remote_address}")
    try:
        await websocket.wait_closed()
    finally:
        ws_clients.remove(websocket)
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] [WebSocket] Client disconnected")

async def broadcast_to_clients(message_dict):
    """Broadcasts a JSON string to all connected WebSocket clients."""
    if not ws_clients:
        return
    message_str = json.dumps(message_dict)
    # Gather tasks to send concurrently, ignore individual failures
    await asyncio.gather(*[client.send(message_str) for client in ws_clients], return_exceptions=True)

def forward_to_web(server_message):
    """Schedules the broadcast coroutine in the main event loop from the MQTT thread."""
    if main_loop and main_loop.is_running():
        asyncio.run_coroutine_threadsafe(broadcast_to_clients(server_message), main_loop)

def process_payload(payload_str):
    try:
        data = json.loads(payload_str)
    except json.JSONDecodeError as e:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] [ERROR] Failed to parse JSON payload: {e}")
        return

    # Extract critical metadata
    device_id = data.get("device_id", "unknown_device")
    frame_id = data.get("frame_id", "unknown_frame")
    created_at_str = data.get("created_at")
    
    # Extract stress test details
    stress_test = data.get("stress_test", {})
    frame_counter = stress_test.get("frame_counter")
    
    # Log receive status
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] [INFO] Received frame {frame_id} (Counter: {frame_counter}) from {device_id}")

    # Parse timestamp
    try:
        current_created_at = datetime.fromisoformat(created_at_str)
    except Exception as e:
        print(f"Error parsing created_at timestamp: {e}")
        current_created_at = None

    # Check for Packet Loss
    check_packet_loss(frame_id, frame_counter, current_created_at, data.get("duration_s", 10.0))

    # Update state
    state["last_frame_id"] = frame_id
    state["last_frame_counter"] = frame_counter
    state["last_created_at"] = current_created_at

    # Create safe base filename
    safe_time = sanitize_filename(created_at_str or datetime.now().isoformat())
    file_basename = f"{device_id}_frame_{frame_id}_{safe_time}"

    # 1. Save raw JSON
    json_path = os.path.join(RAW_DIR, f"{file_basename}.json")
    try:
        with open(json_path, "w") as f:
            json.dump(data, f, indent=2)
        print(f"  -> Saved raw JSON to: {os.path.relpath(json_path, BASE_DIR)}")
    except Exception as e:
        print(f"  -> [ERROR] Failed to save JSON: {e}")

    # 2. Parse ECG samples and save to CSV
    ecg_data = data.get("ecg", {})
    samples = ecg_data.get("samples", [])
    sampling_rate = data.get("sampling_rate_hz", 250.0)
    
    if not samples:
        print("  -> [WARNING] No ECG samples found in this frame.")
        return

    csv_path = os.path.join(CSV_DIR, f"samples_{file_basename}.csv")
    try:
        # Write CSV
        with open(csv_path, "w", newline="") as f:
            writer = csv.writer(f)
            # CSV Headers
            writer.writerow(["created_at", "lead_1", "lead_2", "lead_3"])
            
            # Interpolate timestamps for each sample
            time_step = 1.0 / sampling_rate
            
            for idx, sample in enumerate(samples):
                if current_created_at:
                    sample_time = current_created_at + timedelta(seconds=idx * time_step)
                    sample_time_str = sample_time.isoformat()
                else:
                    sample_time_str = ""

                l1 = sample[0] if len(sample) > 0 else 0.0
                l2 = sample[1] if len(sample) > 1 else 0.0
                l3 = sample[2] if len(sample) > 2 else 0.0
                
                writer.writerow([sample_time_str, l1, l2, l3])

        print(f"  -> Saved {len(samples)} samples to CSV: {os.path.relpath(csv_path, BASE_DIR)}")
    except Exception as e:
        print(f"  -> [ERROR] Failed to export CSV: {e}")

    # 3. Construct frontend message and forward to active WebSocket clients
    prediction = data.get("prediction", {})
    
    # Format according to React's expected ServerMessage/ECGDataPayload types
    server_message = {
        "type": "live_data",
        "device_id": device_id,
        "session_id": data.get("session_id", "default"),
        "timestamp": created_at_str,
        "data_payload": {
            "raw": {
                "time": [idx * time_step for idx in range(len(samples))],
                "ch1": [s[0] for s in samples] if len(samples) > 0 and len(samples[0]) > 0 else [],
                "ch2": [s[1] for s in samples] if len(samples) > 0 and len(samples[0]) > 1 else [],
                "ch3": [s[2] for s in samples] if len(samples) > 0 and len(samples[0]) > 2 else []
            },
            "classification_result": prediction.get("label", "Normal"),
            "confidence": f"{prediction.get('confidence_percent', 0.0):.2f}%",
            "anomaly_indices": [],
            "probabilities": prediction.get("probabilities", {}),
            "latency_ms": prediction.get("latency_ms", 0.0),
            "runtime": prediction.get("runtime", "ai-edge-litert")
        },
        "sha256_checksum": "development-mode-bypass"
    }
    
    forward_to_web(server_message)
    print(f"  -> Broadcasted live_data to {len(ws_clients)} active dashboard connection(s)")

def check_packet_loss(frame_id, frame_counter, current_created_at, duration_s):
    # Check gap via frame_counter (from stress test metadata)
    if state["last_frame_counter"] is not None and frame_counter is not None:
        counter_diff = frame_counter - state["last_frame_counter"]
        if counter_diff > 1:
            lost_count = counter_diff - 1
            log_packet_loss(
                f"[WARNING] Packet loss detected by frame_counter! "
                f"Missed {lost_count} frame(s) between frame {state['last_frame_counter']} and {frame_counter}."
            )
        elif counter_diff < 1:
            log_packet_loss(
                f"[INFO] Out-of-order or duplicate frame counter received! "
                f"Expected counter > {state['last_frame_counter']}, received {frame_counter}."
            )
            
    # Check gap via frame_id string (if counter is missing but ID is sequential numbers)
    elif state["last_frame_id"] is not None and frame_id is not None:
        try:
            curr_id_val = int(frame_id)
            prev_id_val = int(state["last_frame_id"])
            id_diff = curr_id_val - prev_id_val
            if id_diff > 1:
                lost_count = id_diff - 1
                log_packet_loss(
                    f"[WARNING] Packet loss detected by frame_id! "
                    f"Missed {lost_count} frame(s) between frame_id {state['last_frame_id']} and {frame_id}."
                )
        except ValueError:
            pass

    # Check gap via created_at timestamps (representing time gaps)
    if state["last_created_at"] is not None and current_created_at is not None:
        time_diff = (current_created_at - state["last_created_at"]).total_seconds()
        expected_gap = duration_s
        tolerance = 2.0
        
        if time_diff > (expected_gap + tolerance):
            estimated_lost = max(1, int((time_diff - tolerance) // expected_gap))
            log_packet_loss(
                f"[WARNING] Time gap anomaly detected! "
                f"Time difference between frames is {time_diff:.2f} seconds (Expected ~{expected_gap}s). "
                f"Estimated missed frames: {estimated_lost} frame(s)."
            )

# MQTT Callback functions
def on_connect(client, userdata, flags, rc, properties=None):
    if rc == 0:
        print(f"Successfully connected to MQTT Broker: {BROKER_HOST}")
        client.subscribe(TOPIC, qos=QOS)
        print(f"Subscribed to topic: {TOPIC} with QoS {QOS}")
    else:
        print(f"Connection failed with result code: {rc}")

def on_message(client, userdata, msg):
    try:
        payload_str = msg.payload.decode("utf-8")
        process_payload(payload_str)
    except Exception as e:
        print(f"Error handling message: {e}")

async def run_websocket_server():
    """Starts the WebSocket server listening on port 8080."""
    async with websockets.serve(register_client, "127.0.0.1", 8080):
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] [WebSocket] Server started on ws://127.0.0.1:8080")
        await asyncio.Future()  # Run forever

def main():
    global main_loop
    print("==================================================")
    print("      Arrhythmia ECG Dashboard MQTT Listener      ")
    print("      (with Live WebSocket Bridge - Port 8080)    ")
    print("==================================================")
    print(f"Raw Dataset Dir: {os.path.relpath(RAW_DIR, BASE_DIR)}")
    print(f"CSV Dataset Dir: {os.path.relpath(CSV_DIR, BASE_DIR)}")
    print(f"Packet Loss Log: {os.path.relpath(PACKET_LOSS_LOG, BASE_DIR)}")
    print("--------------------------------------------------")

    # Initialize MQTT client
    try:
        from paho.mqtt.enums import CallbackAPIVersion
        client = mqtt.Client(callback_api_version=CallbackAPIVersion.VERSION2)
    except ImportError:
        client = mqtt.Client()

    client.username_pw_set(USERNAME, PASSWORD)
    
    # Configure TLS
    context = ssl.create_default_context()
    client.tls_set_context(context)

    # Set callbacks
    client.on_connect = on_connect
    client.on_message = on_message

    print(f"Connecting to MQTT Broker {BROKER_HOST}:{BROKER_PORT}...")
    client.connect(BROKER_HOST, BROKER_PORT, keepalive=60)
    
    # Run MQTT loop in a background thread
    client.loop_start()

    # Get and set asyncio loop for the main thread
    main_loop = asyncio.new_event_loop()
    asyncio.set_event_loop(main_loop)

    try:
        # Run WebSocket server (blocking in main thread)
        main_loop.run_until_complete(run_websocket_server())
    except KeyboardInterrupt:
        print("\nShutting down servers...")
    finally:
        client.loop_stop()
        client.disconnect()
        print("MQTT Listener and WebSocket Bridge stopped.")

if __name__ == "__main__":
    main()
