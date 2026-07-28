#!/usr/bin/env python3
import os
import glob
import json
import argparse
from datetime import datetime, timezone, timedelta
import pandas as pd
import matplotlib.pyplot as plt
from dateutil import parser as date_parser

# Setup dataset directories relative to the script location
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
RAW_DIR = os.path.join(DATASET_DIR, "raw")
PLOTS_DIR = os.path.join(DATASET_DIR, "plots")

os.makedirs(PLOTS_DIR, exist_ok=True)

def parse_iso_datetime(dt_str):
    """Robustly parse ISO datetime with timezone offsets."""
    try:
        return date_parser.parse(dt_str)
    except Exception:
        # Fallback to simple parsing
        try:
            return datetime.fromisoformat(dt_str.split('+')[0])
        except Exception:
            return None

def analyze_dataset(start_time=None, end_time=None, output_filename="stress_test_analysis.png"):
    # 1. Scan and read all raw JSON files
    json_files = glob.glob(os.path.join(RAW_DIR, "*.json"))
    
    if not json_files:
        print(f"[ERROR] No raw JSON files found in {os.path.relpath(RAW_DIR, BASE_DIR)}.")
        print("Please run the mqtt_listener.py first to collect some data.")
        return

    records = []
    for filepath in json_files:
        try:
            with open(filepath, "r") as f:
                data = json.load(f)
                
            created_at_str = data.get("created_at")
            if not created_at_str:
                continue

            dt = parse_iso_datetime(created_at_str)
            if not dt:
                continue

            system_data = data.get("system", {})
            stress_test = data.get("stress_test", {})
            network = data.get("network", {})
            prediction = data.get("prediction", {})

            # Handle potentially missing battery field gracefully
            battery = system_data.get("battery_percent")
            if battery is None:
                # Try to search for other possible battery fields or leave as None
                battery = system_data.get("battery")
            
            records.append({
                "filepath": filepath,
                "timestamp": dt,
                "timestamp_str": created_at_str,
                "frame_id": data.get("frame_id"),
                "frame_counter": stress_test.get("frame_counter"),
                "cpu_usage": system_data.get("cpu_usage_percent"),
                "memory_usage": system_data.get("memory_usage_percent"),
                "cpu_temp": system_data.get("cpu_temperature_c"),
                "uptime": system_data.get("uptime_s"),
                "battery": battery,
                "wifi_rssi": network.get("wifi_rssi_dbm"),
                "latency": network.get("mqtt_publish_latency_ms"),
                "prediction_latency": prediction.get("latency_ms")
            })
        except Exception as e:
            print(f"[WARNING] Error reading file {os.path.basename(filepath)}: {e}")

    # 2. Load into Pandas and sort by timestamp
    df = pd.DataFrame(records)
    df = df.sort_values(by="timestamp").reset_index(drop=True)

    # 3. Filter by time range if specified
    total_scanned = len(df)
    
    # Ensure start_time and end_time are datetime objects with timezones
    # We will make the filter timestamps timezone-aware to match parsed datetimes
    tz_info = df["timestamp"].iloc[0].tzinfo if not df.empty else None

    if start_time:
        start_dt = parse_iso_datetime(start_time)
        if start_dt and start_dt.tzinfo is None and tz_info is not None:
            start_dt = start_dt.replace(tzinfo=tz_info)
        df = df[df["timestamp"] >= start_dt]
        
    if end_time:
        end_dt = parse_iso_datetime(end_time)
        if end_dt and end_dt.tzinfo is None and tz_info is not None:
            end_dt = end_dt.replace(tzinfo=tz_info)
        df = df[df["timestamp"] <= end_dt]

    if df.empty:
        print(f"[ERROR] No data fits within the specified time range.")
        print(f"Scanned {total_scanned} files. Available timestamp range: "
              f"[{df['timestamp'].min()}] to [{df['timestamp'].max()}]")
        return

    print("==================================================")
    print("           STRESS TEST ANALYSIS REPORT            ")
    print("==================================================")
    print(f"Total files scanned: {total_scanned}")
    print(f"Frames in filter range: {len(df)}")
    print(f"Analysis range: {df['timestamp'].min().strftime('%Y-%m-%d %H:%M:%S %z')} to {df['timestamp'].max().strftime('%Y-%m-%d %H:%M:%S %z')}")
    print("--------------------------------------------------")

    # 4. Check Packet Loss / Frame Gaps in selection
    # If we have frame_counter, check sequential completeness
    frame_counters = df["frame_counter"].dropna().astype(int).tolist()
    packet_loss_msg = "N/A"
    loss_rate = 0.0

    if len(frame_counters) > 1:
        min_counter = min(frame_counters)
        max_counter = max(frame_counters)
        expected_frames = max_counter - min_counter + 1
        received_frames = len(set(frame_counters)) # Unique counters
        missing_frames = expected_frames - received_frames
        loss_rate = (missing_frames / expected_frames) * 100 if expected_frames > 0 else 0.0
        
        # Identify missing frame counters
        all_expected = set(range(min_counter, max_counter + 1))
        missing_set = all_expected - set(frame_counters)
        missing_list_str = ", ".join(map(str, sorted(list(missing_set))[:10]))
        if len(missing_set) > 10:
            missing_list_str += "..."

        packet_loss_msg = f"{missing_frames} frames missed (Loss rate: {loss_rate:.2f}%)"
        print(f"Frame Range: {min_counter} to {max_counter}")
        print(f"Expected Frames: {expected_frames}")
        print(f"Received Frames: {received_frames}")
        print(f"Missing Frames:  {missing_frames} (Loss rate: {loss_rate:.2f}%)")
        if missing_frames > 0:
            print(f"Missing Frame IDs: [{missing_list_str}]")
    else:
        print("Packet loss check: Insufficient sequential frames in range.")

    print("--------------------------------------------------")

    # 5. Extract statistics
    avg_cpu = df["cpu_usage"].mean()
    max_cpu = df["cpu_usage"].max()
    avg_temp = df["cpu_temp"].mean()
    max_temp = df["cpu_temp"].max()
    avg_mem = df["memory_usage"].mean()

    print(f"CPU Usage:       Avg {avg_cpu:.1f}%, Max {max_cpu:.1f}%")
    print(f"Memory Usage:    Avg {avg_mem:.1f}%")
    print(f"CPU Temperature: Avg {avg_temp:.1f}°C, Max {max_temp:.1f}°C")

    # 6. Battery Analysis
    has_battery = df["battery"].notna().sum() > 0
    battery_drop = 0.0
    drain_msg = ""
    depletion_est = "N/A"

    if has_battery:
        # Sort and get first and last battery readings in the filtered range
        battery_series = df["battery"].dropna()
        first_battery = battery_series.iloc[0]
        last_battery = battery_series.iloc[-1]
        battery_drop = first_battery - last_battery
        
        # Calculate time delta in hours
        time_delta_sec = (df["timestamp"].max() - df["timestamp"].min()).total_seconds()
        time_delta_hr = time_delta_sec / 3600.0

        print("--------------------------------------------------")
        print(f"Battery Start:   {first_battery:.1f}%")
        print(f"Battery End:     {last_battery:.1f}%")
        print(f"Battery Drop:    {battery_drop:.1f}% over {time_delta_hr:.2f} hours")
        
        if time_delta_hr > 0 and battery_drop > 0:
            drain_rate_per_hr = battery_drop / time_delta_hr
            drain_msg = f"{drain_rate_per_hr:.2f}% per hour"
            print(f"Drain Rate:      {drain_msg}")
            
            # Estimate remaining time to 0%
            remaining_hrs = last_battery / drain_rate_per_hr
            remaining_delta = timedelta(hours=remaining_hrs)
            depletion_time = df["timestamp"].max() + remaining_delta
            depletion_est = depletion_time.strftime('%Y-%m-%d %H:%M:%S')
            print(f"Est. Empty Time: {depletion_est} (in {remaining_hrs:.2f} hours)")
        elif battery_drop <= 0:
            drain_msg = "Stable / Charging"
            print(f"Drain Rate:      {drain_msg}")
    else:
        print("--------------------------------------------------")
        print("Battery Level:   No battery data found in the payload.")
        print("                 (Note: Simulation payload has battery_percent under system)")

    print("==================================================")

    # 7. Generate combined plots
    # Create subplots
    fig, axes = plt.subplots(nrows=3 if has_battery else 2, ncols=1, figsize=(10, 8 if has_battery else 6), sharex=True)
    
    # Adjust for single axes array output shape
    if not has_battery:
        ax_cpu, ax_temp = axes
        ax_bat = None
    else:
        ax_bat, ax_cpu, ax_temp = axes

    # Format x-axis timestamps
    df['time_only'] = df['timestamp'].dt.strftime('%H:%M:%S')
    
    # Plot 1: Battery Drain Graph
    if has_battery:
        ax_bat.plot(df['time_only'], df['battery'], color='#e74c3c', marker='o', linewidth=2)
        ax_bat.set_title("Battery Drain Profile", fontsize=12, fontweight='bold', color='#2c3e50')
        ax_bat.set_ylabel("Battery Level (%)", fontsize=10)
        ax_bat.grid(True, linestyle='--', alpha=0.5)
        ax_bat.set_ylim(-5, 105)
        # Annotation for battery depletion
        if depletion_est != "N/A":
            ax_bat.annotate(f"Est. depletion at: {depletion_est.split(' ')[1]}", 
                            xy=(df['time_only'].iloc[-1], df['battery'].iloc[-1]),
                            xytext=(len(df)*0.5, last_battery + 10),
                            arrowprops=dict(facecolor='black', shrink=0.05, width=1, headwidth=6))

    # Plot 2: CPU Usage Graph
    ax_cpu.plot(df['time_only'], df['cpu_usage'], color='#3498db', marker='s', linewidth=2)
    ax_cpu.set_title("CPU Usage over Time", fontsize=12, fontweight='bold', color='#2c3e50')
    ax_cpu.set_ylabel("CPU Usage (%)", fontsize=10)
    ax_cpu.grid(True, linestyle='--', alpha=0.5)
    ax_cpu.set_ylim(-5, max(105, max_cpu + 15))

    # Plot 3: CPU Temperature Graph
    ax_temp.plot(df['time_only'], df['cpu_temp'], color='#e67e22', marker='^', linewidth=2)
    ax_temp.set_title("CPU Temperature Profile", fontsize=12, fontweight='bold', color='#2c3e50')
    ax_temp.set_ylabel("Temperature (°C)", fontsize=10)
    ax_temp.set_xlabel("Time (HH:MM:SS)", fontsize=10)
    ax_temp.grid(True, linestyle='--', alpha=0.5)

    # Adjust layout
    plt.xticks(rotation=45, ha='right')
    
    # Add title and general stats box
    summary_txt = (
        f"Stress Test Diagnostics\n"
        f"Total Samples: {len(df)}\n"
        f"Avg CPU: {avg_cpu:.1f}% | Avg Temp: {avg_temp:.1f}°C\n"
        f"Packet Loss Rate: {loss_rate:.2f}%\n"
        f"Battery Drain Rate: {drain_msg}"
    )
    fig.text(0.02, 0.02, summary_txt, fontsize=9, bbox=dict(facecolor='white', alpha=0.8, boxstyle='round,pad=0.5'))
    
    plt.suptitle(f"Device Stress Test Report ({df['timestamp'].min().strftime('%Y-%m-%d')})", fontsize=14, fontweight='bold')
    plt.tight_layout()
    
    # Save the plot
    plot_filepath = os.path.join(PLOTS_DIR, output_filename)
    plt.savefig(plot_filepath, dpi=150, bbox_inches='tight')
    plt.close()
    
    print(f"\n[SUCCESS] Generated chart saved to: {os.path.relpath(plot_filepath, BASE_DIR)}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Analyze ECG stress test data and plot graphs.")
    parser.add_argument("--start", type=str, default=None, help="Start timestamp in ISO format (e.g. 2026-07-28T15:00:00+07:00)")
    parser.add_argument("--end", type=str, default=None, help="End timestamp in ISO format")
    parser.add_argument("--out", type=str, default="stress_test_analysis.png", help="Filename of the output chart image")
    args = parser.parse_args()

    analyze_dataset(start_time=args.start, end_time=args.end, output_filename=args.out)
