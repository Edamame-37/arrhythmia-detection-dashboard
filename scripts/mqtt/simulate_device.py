#!/usr/bin/env python3
import ssl
import time
import json
import math
import random
import argparse
from datetime import datetime, timezone, timedelta
import paho.mqtt.client as mqtt

# Configuration
BROKER_HOST = "93d81a02c1f743b6ab4ea22d7ad9c3e0.s1.eu.hivemq.cloud"
BROKER_PORT = 8883
USERNAME = "ecg-undip"
PASSWORD = "undipjaya"
TOPIC = "ecgrhythmia/device01/frame"

def generate_ecg_samples(sampling_rate, duration, heartbeat_bpm=75):
    """
    Generates a realistic simulated 3-lead ECG signal.
    Uses Einthoven's Law: Lead II = Lead I + Lead III
    """
    num_samples = int(sampling_rate * duration)
    samples = []
    
    # Heartbeat parameters
    rr_interval = 60.0 / heartbeat_bpm  # duration of one heart beat in seconds
    rr_samples = int(rr_interval * sampling_rate)
    
    for i in range(num_samples):
        # Time in seconds
        t = i / sampling_rate
        
        # 1. Base breathing artifact (low frequency baseline wander)
        baseline = 0.05 * math.sin(2 * math.pi * 0.15 * t)
        
        # 2. Find position within the heartbeat cycle
        beat_sample = i % rr_samples
        t_beat = beat_sample / sampling_rate
        
        # ECG wave components relative to heartbeat start
        p_wave = 0.08 * math.exp(-((t_beat - 0.15) / 0.02) ** 2)
        q_wave = -0.05 * math.exp(-((t_beat - 0.22) / 0.005) ** 2)
        r_wave = 1.0 * math.exp(-((t_beat - 0.25) / 0.01) ** 2)
        s_wave = -0.25 * math.exp(-((t_beat - 0.28) / 0.015) ** 2)
        t_wave = 0.20 * math.exp(-((t_beat - 0.45) / 0.04) ** 2)
        
        # Noise
        noise = random.normalvariate(0, 0.02)
        
        # Lead I: standard wave
        lead_i = baseline + 0.6 * p_wave + 0.7 * q_wave + 0.8 * r_wave + 0.6 * s_wave + 0.5 * t_wave + noise
        
        # Lead II: stronger QRS complex
        lead_ii = baseline + 0.8 * p_wave + 0.8 * q_wave + 1.2 * r_wave + 0.7 * s_wave + 0.6 * t_wave + noise * 0.9
        
        # Lead III: Einthoven's law: Lead III = Lead II - Lead I
        lead_iii = lead_ii - lead_i
        
        # Store scaled in mV (rounded to 3 decimal places)
        samples.append([
            round(lead_i, 3),
            round(lead_ii, 3),
            round(lead_iii, 3)
        ])
        
    return samples

def main():
    parser = argparse.ArgumentParser(description="Simulate ECG device and publish frames to MQTT.")
    parser.add_argument("--interval", type=float, default=10.0, help="Interval between messages in seconds")
    parser.add_argument("--count", type=int, default=0, help="Number of frames to send (0 for infinite)")
    parser.add_argument("--battery-start", type=float, default=100.0, help="Starting battery percentage")
    parser.add_argument("--battery-drain", type=float, default=1.5, help="Battery drain percentage per frame")
    args = parser.parse_args()

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

    print(f"Connecting to MQTT Broker {BROKER_HOST}:{BROKER_PORT}...")
    client.connect(BROKER_HOST, BROKER_PORT, keepalive=60)
    client.loop_start()
    
    frame_counter = 1
    battery_level = args.battery_start
    sampling_rate = 250.0
    duration = 10.0
    
    # Base datetime (current time in local timezone offset)
    current_time = datetime.now(timezone(timedelta(hours=7)))

    try:
        while True:
            # Check if count limit reached
            if args.count > 0 and frame_counter > args.count:
                print("Requested frame count sent. Exiting simulation.")
                break

            # Calculate timestamp for this frame
            # Each frame represents 'duration' seconds of data
            # For simulation realism, we increment time by 10s per frame
            frame_time = current_time + timedelta(seconds=(frame_counter - 1) * 10)
            timestamp_str = frame_time.isoformat()

            # Randomize system properties
            cpu_usage = round(random.uniform(8.0, 22.0), 1)
            mem_usage_pct = round(random.uniform(62.0, 71.0), 1)
            mem_usage_mb = int(random.uniform(2500, 2900))
            cpu_temp = round(random.uniform(26.5, 38.5), 1)
            uptime = int((frame_counter - 1) * 10) + 100

            # Drain battery
            battery_level = max(0.0, round(battery_level - args.battery_drain, 2))

            # Simulate network latency
            pub_latency = round(random.uniform(5.0, 15.0), 1)
            wifi_rssi = int(random.uniform(-70, -50))

            # Generate ECG samples
            samples = generate_ecg_samples(sampling_rate, duration)

            # Construct Payload
            payload = {
                "schema_version": 1,
                "message_id": f"device01-default-frame_{frame_counter:06d}",
                "device_id": "device01",
                "session_id": "default",
                "frame_id": f"{frame_counter:06d}",
                "created_at": timestamp_str,

                "sampling_rate_hz": sampling_rate,
                "duration_s": duration,
                "unit": "mV",
                "shape": [len(samples), 3],
                "channel_order": ["Lead I", "Lead II", "Lead III"],

                "validation": {
                    "status": "PASS",
                    "warnings": []
                },

                "ecg": {
                    "format": "samples_by_time",
                    "samples": samples
                },

                "prediction": {
                    "status": "PASS",
                    "label": "Normal" if random.random() > 0.15 else "AF",
                    "confidence_percent": round(random.uniform(85.0, 99.5), 2),
                    "probabilities": {
                        "Normal": 95.0,
                        "AF": 3.0,
                        "Takikardia": 1.0,
                        "Bradikardia": 1.0
                    },
                    "threshold": 0.5,
                    "latency_ms": round(random.uniform(10.0, 15.0), 1),
                    "runtime": "ai-edge-litert"
                },

                "system": {
                    "cpu_usage_percent": cpu_usage,
                    "memory_usage_percent": mem_usage_pct,
                    "memory_usage_mb": mem_usage_mb,
                    "cpu_temperature_c": cpu_temp,
                    "uptime_s": uptime,
                    "battery_percent": battery_level  # Add simulated battery level
                },

                "stress_test": {
                    "enabled": True,
                    "frame_counter": frame_counter
                },

                "network": {
                    "mqtt_publish_latency_ms": pub_latency,
                    "wifi_rssi_dbm": wifi_rssi,
                    "mqtt_connected": True
                }
            }

            # Publish message
            payload_str = json.dumps(payload)
            result = client.publish(TOPIC, payload_str, qos=1)
            status = result[0]
            if status == 0:
                print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Frame {frame_counter} published. Timestamp: {timestamp_str}, Battery: {battery_level}%, CPU Temp: {cpu_temp}°C")
            else:
                print(f"Failed to publish Frame {frame_counter}")

            frame_counter += 1
            time.sleep(args.interval)

    except KeyboardInterrupt:
        print("\nStopping simulator...")
    finally:
        client.loop_stop()
        client.disconnect()
        print("Simulator stopped.")

if __name__ == "__main__":
    main()
