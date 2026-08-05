#!/usr/bin/env python3
import os
import glob
import json
import argparse
from datetime import datetime, timezone, timedelta
import pandas as pd
import numpy as np
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
                battery = system_data.get("battery")
            
            records.append({
                "filepath": filepath,
                "timestamp": dt,
                "timestamp_str": created_at_str,
                "frame_id": data.get("frame_id"),
                "frame_counter": stress_test.get("frame_counter"),
                "cpu_usage": system_data.get("cpu_usage_percent"),
                "memory_usage": system_data.get("memory_usage_percent"),
                "memory_usage_mb": system_data.get("memory_usage_mb"),
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
    if df.empty:
        print(f"[ERROR] No valid records could be parsed.")
        return
        
    df["timestamp"] = pd.to_datetime(df["timestamp"], utc=True).dt.tz_convert(datetime.now().astimezone().tzinfo)
    df = df.sort_values(by="timestamp").reset_index(drop=True)

    # 3. Filter by time range if specified
    total_scanned = len(df)
    tz_info = df["timestamp"].iloc[0].tzinfo if not df.empty else None

    if start_time:
        start_dt = parse_iso_datetime(start_time)
        if start_dt:
            if start_dt.tzinfo is None and tz_info is not None:
                start_dt = start_dt.replace(tzinfo=tz_info)
            elif tz_info is not None:
                start_dt = start_dt.astimezone(tz_info)
            df = df[df["timestamp"] >= start_dt]
        
    if end_time:
        end_dt = parse_iso_datetime(end_time)
        if end_dt:
            if end_dt.tzinfo is None and tz_info is not None:
                end_dt = end_dt.replace(tzinfo=tz_info)
            elif tz_info is not None:
                end_dt = end_dt.astimezone(tz_info)
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

    # 4. Check Packet Loss / Frame Gaps
    frame_counters = df["frame_counter"].dropna().astype(int).tolist()
    packet_loss_msg = "N/A"
    loss_rate = 0.0

    if len(frame_counters) > 1:
        min_counter = min(frame_counters)
        max_counter = max(frame_counters)
        expected_frames = max_counter - min_counter + 1
        received_frames = len(set(frame_counters))
        missing_frames = expected_frames - received_frames
        loss_rate = (missing_frames / expected_frames) * 100 if expected_frames > 0 else 0.0
        
        missing_set = all_expected = set(range(min_counter, max_counter + 1))
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
    avg_mem_pct = df["memory_usage"].mean()
    max_mem_pct = df["memory_usage"].max()
    
    has_mem_mb = df["memory_usage_mb"].notna().sum() > 0
    avg_mem_mb = df["memory_usage_mb"].mean() if has_mem_mb else 0.0
    max_mem_mb = df["memory_usage_mb"].max() if has_mem_mb else 0.0
    
    avg_pub_latency = df["latency"].mean()
    max_pub_latency = df["latency"].max()
    avg_wifi_rssi = df["wifi_rssi"].mean()
    avg_pred_latency = df["prediction_latency"].mean()
    max_pred_latency = df["prediction_latency"].max()

    print(f"CPU Usage:       Avg {avg_cpu:.1f}%, Max {max_cpu:.1f}%")
    print(f"Memory Usage:    Avg {avg_mem_pct:.1f}% ({avg_mem_mb:.0f} MB), Max {max_mem_pct:.1f}% ({max_mem_mb:.0f} MB)")
    print(f"CPU Temperature: Avg {avg_temp:.1f}°C, Max {max_temp:.1f}°C")
    print(f"MQTT Latency:    Avg {avg_pub_latency:.1f} ms, Max {max_pub_latency:.1f} ms")
    print(f"WiFi RSSI:       Avg {avg_wifi_rssi:.1f} dBm")
    print(f"AI Latency:      Avg {avg_pred_latency:.1f} ms, Max {max_pred_latency:.1f} ms")

    # 6. Battery Analysis
    has_battery = df["battery"].notna().sum() > 0
    battery_drop = 0.0
    drain_msg = ""
    depletion_est = "N/A"

    if has_battery:
        battery_series = df["battery"].dropna()
        first_battery = battery_series.iloc[0]
        last_battery = battery_series.iloc[-1]
        battery_drop = first_battery - last_battery
        
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

    print("==================================================")

    # 7. Generate Combined Plots (3x2 Premium Dark Theme Grid)
    # Set plot aesthetic overrides
    plt.rcParams['text.color'] = '#f8fafc'
    plt.rcParams['axes.labelcolor'] = '#94a3b8'
    plt.rcParams['xtick.color'] = '#64748b'
    plt.rcParams['ytick.color'] = '#64748b'
    plt.rcParams['grid.color'] = '#334155'
    
    fig, axes = plt.subplots(nrows=3, ncols=2, figsize=(16, 12), facecolor='#0f172a')
    fig.patch.set_facecolor('#0f172a')
    
    df['time_only'] = df['timestamp'].dt.strftime('%H:%M:%S')
    
    # Calculate ticks indices to prevent crowding
    max_ticks = 10
    if len(df) > max_ticks:
        tick_indices = [int(i) for i in np.linspace(0, len(df) - 1, max_ticks)]
    else:
        tick_indices = range(len(df))

    # --- Plot 1: Battery Drain Graph ---
    ax_bat = axes[0, 0]
    ax_bat.set_facecolor('#1e293b')
    ax_bat.grid(True, linestyle='--', color='#334155', alpha=0.5)
    
    if has_battery:
        ax_bat.plot(df['time_only'], df['battery'], color='#10b981', marker='o', markersize=4, linewidth=2, label="Battery %")
        ax_bat.fill_between(df['time_only'], df['battery'], color='#10b981', alpha=0.15)
        ax_bat.set_ylabel("Battery Level (%)", color='#10b981', fontweight='bold')
        ax_bat.set_ylim(-5, 105)
        if depletion_est != "N/A":
            last_idx_label = df['time_only'].iloc[-1]
            last_bat_val = df['battery'].iloc[-1]
            ax_bat.annotate(f"Est. Empty: {depletion_est.split(' ')[1]}", 
                            xy=(last_idx_label, last_bat_val),
                            xytext=(len(df) * 0.4, last_bat_val + 20 if last_bat_val < 80 else last_bat_val - 20),
                            color='#f8fafc', fontweight='bold',
                            bbox=dict(boxstyle="round,pad=0.3", fc="#10b981", alpha=0.8),
                            arrowprops=dict(facecolor='#10b981', shrink=0.08, width=1, headwidth=6))
    else:
        ax_bat.text(0.5, 0.5, "No Battery Telemetry\n(Device running on AC Power)", 
                    color='#64748b', fontsize=12, ha='center', va='center')
        ax_bat.set_ylim(-5, 105)
    ax_bat.set_title("Battery Profile / Charge Level", fontsize=11, fontweight='bold', color='#f8fafc')

    # --- Plot 2: RAM Usage with Peak Annotation ---
    ax_mem = axes[0, 1]
    ax_mem.set_facecolor('#1e293b')
    ax_mem.grid(True, linestyle='--', color='#334155', alpha=0.5)
    
    if has_mem_mb:
        ax_mem.plot(df['time_only'], df['memory_usage_mb'], color='#8b5cf6', marker='o', markersize=4, linewidth=2, label="RAM (MB)")
        ax_mem.fill_between(df['time_only'], df['memory_usage_mb'], color='#8b5cf6', alpha=0.15)
        ax_mem.set_ylabel("RAM Usage (MB)", color='#8b5cf6', fontweight='bold')
        ax_mem.tick_params(axis='y', labelcolor='#8b5cf6')
        
        # Highlight and annotate Peak RAM
        peak_idx = df['memory_usage_mb'].idxmax()
        peak_time = df['time_only'].iloc[peak_idx]
        peak_val = df['memory_usage_mb'].iloc[peak_idx]
        peak_pct = df['memory_usage'].iloc[peak_idx]
        
        ax_mem.plot(peak_time, peak_val, color='#ef4444', marker='*', markersize=10, linestyle='None', label="Peak RAM")
        ax_mem.annotate(f"Peak RAM: {peak_val} MB ({peak_pct}%)", 
                        xy=(peak_time, peak_val),
                        xytext=(len(df) * 0.35, peak_val - (max_mem_mb * 0.15) if peak_idx > len(df) * 0.5 else peak_val + (max_mem_mb * 0.05)),
                        color='#f8fafc', fontweight='bold',
                        bbox=dict(boxstyle="round,pad=0.3", fc="#ef4444", alpha=0.9),
                        arrowprops=dict(facecolor='#ef4444', shrink=0.08, width=1, headwidth=6))
        
        # Twin axis for percent
        ax_mem_pct = ax_mem.twinx()
        ax_mem_pct.plot(df['time_only'], df['memory_usage'], color='#c084fc', linestyle=':', linewidth=1.5, alpha=0.7)
        ax_mem_pct.set_ylabel("RAM Usage (%)", color='#c084fc', fontweight='bold')
        ax_mem_pct.tick_params(axis='y', labelcolor='#c084fc')
        ax_mem_pct.set_ylim(-5, 105)
    else:
        ax_mem.plot(df['time_only'], df['memory_usage'], color='#8b5cf6', marker='o', markersize=4, linewidth=2)
        ax_mem.set_ylabel("RAM Usage (%)", color='#8b5cf6', fontweight='bold')
        ax_mem.set_ylim(-5, 105)
        
    ax_mem.set_title("RAM / Memory Usage Profile", fontsize=11, fontweight='bold', color='#f8fafc')

    # --- Plot 3: CPU Usage & Temperature ---
    ax_cpu = axes[1, 0]
    ax_cpu.set_facecolor('#1e293b')
    ax_cpu.grid(True, linestyle='--', color='#334155', alpha=0.5)
    
    ax_cpu.plot(df['time_only'], df['cpu_usage'], color='#3b82f6', marker='s', markersize=4, linewidth=2, label="CPU Usage")
    ax_cpu.fill_between(df['time_only'], df['cpu_usage'], color='#3b82f6', alpha=0.1)
    ax_cpu.set_ylabel("CPU Usage (%)", color='#3b82f6', fontweight='bold')
    ax_cpu.tick_params(axis='y', labelcolor='#3b82f6')
    ax_cpu.set_ylim(-5, 105)
    
    ax_temp = ax_cpu.twinx()
    ax_temp.plot(df['time_only'], df['cpu_temp'], color='#f97316', marker='^', markersize=4, linewidth=2, label="CPU Temp")
    ax_temp.set_ylabel("CPU Temp (°C)", color='#f97316', fontweight='bold')
    ax_temp.tick_params(axis='y', labelcolor='#f97316')
    
    # Highlight max temp
    max_temp_idx = df['cpu_temp'].idxmax()
    max_temp_time = df['time_only'].iloc[max_temp_idx]
    max_temp_val = df['cpu_temp'].iloc[max_temp_idx]
    ax_temp.plot(max_temp_time, max_temp_val, color='#ef4444', marker='X', markersize=8, linestyle='None')
    
    ax_cpu.set_title("CPU Load & Temperature Profile", fontsize=11, fontweight='bold', color='#f8fafc')

    # --- Plot 4: MQTT Latency ---
    ax_lat = axes[1, 1]
    ax_lat.set_facecolor('#1e293b')
    ax_lat.grid(True, linestyle='--', color='#334155', alpha=0.5)
    
    ax_lat.plot(df['time_only'], df['latency'], color='#ec4899', marker='d', markersize=4, linewidth=2)
    ax_lat.fill_between(df['time_only'], df['latency'], color='#ec4899', alpha=0.15)
    ax_lat.set_ylabel("MQTT Publish Latency (ms)", color='#ec4899', fontweight='bold')
    ax_lat.set_title("MQTT Publish Transmission Latency", fontsize=11, fontweight='bold', color='#f8fafc')

    # --- Plot 5: WiFi Signal Strength (RSSI) ---
    ax_rssi = axes[2, 0]
    ax_rssi.set_facecolor('#1e293b')
    ax_rssi.grid(True, linestyle='--', color='#334155', alpha=0.5)
    
    ax_rssi.plot(df['time_only'], df['wifi_rssi'], color='#06b6d4', marker='v', markersize=4, linewidth=2)
    ax_rssi.fill_between(df['time_only'], df['wifi_rssi'], color='#06b6d4', alpha=0.15)
    ax_rssi.set_ylabel("WiFi RSSI (dBm)", color='#06b6d4', fontweight='bold')
    ax_rssi.set_xlabel("Time (HH:MM:SS)", color='#94a3b8')
    ax_rssi.set_title("WiFi Signal Strength (RSSI)", fontsize=11, fontweight='bold', color='#f8fafc')

    # --- Plot 6: Edge AI Latency ---
    ax_pred = axes[2, 1]
    ax_pred.set_facecolor('#1e293b')
    ax_pred.grid(True, linestyle='--', color='#334155', alpha=0.5)
    
    ax_pred.plot(df['time_only'], df['prediction_latency'], color='#eab308', marker='p', markersize=4, linewidth=2)
    ax_pred.fill_between(df['time_only'], df['prediction_latency'], color='#eab308', alpha=0.15)
    ax_pred.set_ylabel("AI Prediction Latency (ms)", color='#eab308', fontweight='bold')
    ax_pred.set_xlabel("Time (HH:MM:SS)", color='#94a3b8')
    ax_pred.set_title("Edge AI Prediction Latency (ai-edge-litert)", fontsize=11, fontweight='bold', color='#f8fafc')

    # --- Format all axes ---
    for ax in axes.flat:
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.spines['left'].set_color('#475569')
        ax.spines['bottom'].set_color('#475569')
        
        ax.set_xticks(tick_indices)
        ax.set_xticklabels(df['time_only'].iloc[tick_indices], rotation=30, ha='right', fontsize=9)

    # Format twinx spines
    if has_mem_mb:
        ax_mem_pct.spines['top'].set_visible(False)
        ax_mem_pct.spines['left'].set_visible(False)
        ax_mem_pct.spines['right'].set_color('#475569')
    ax_temp.spines['top'].set_visible(False)
    ax_temp.spines['left'].set_visible(False)
    ax_temp.spines['right'].set_color('#475569')

    # --- Subplot spacing and summary metadata card ---
    plt.subplots_adjust(bottom=0.18, hspace=0.4, wspace=0.25)
    
    summary_txt = (
        f"📋 STRESS TEST DIAGNOSTICS REPORT\n"
        f"• Total Data Frames: {len(df)}\n"
        f"• CPU Temperature: Max {max_temp:.1f}°C (Avg {avg_temp:.1f}°C)\n"
        f"• CPU Load Usage:  Max {max_cpu:.1f}% (Avg {avg_cpu:.1f}%)\n"
        f"• RAM Memory Usage: Peak {max_mem_mb:.0f} MB ({max_mem_pct:.1f}%) | Avg {avg_mem_mb:.0f} MB ({avg_mem_pct:.1f}%)\n"
        f"• Packet Loss Rate: {loss_rate:.2f}%\n"
        f"• WiFi RSSI Signal: Avg {avg_wifi_rssi:.1f} dBm\n"
        f"• Edge AI Latency:  Avg {avg_pred_latency:.1f} ms | Max {max_pred_latency:.1f} ms"
    )
    if has_battery:
        summary_txt += f"\n• Battery Drain Rate: {drain_msg}"
        
    fig.text(0.08, 0.015, summary_txt, fontsize=10, color='#f1f5f9', fontweight='medium',
             bbox=dict(facecolor='#1e293b', edgecolor='#475569', alpha=0.95, boxstyle='round,pad=0.8'))
             
    plt.suptitle(f"Device Stress Test Telemetry Report ({df['timestamp'].min().strftime('%Y-%m-%d')})", fontsize=14, fontweight='bold', color='#f8fafc')
    
    # Save the plot
    plot_filepath = os.path.join(PLOTS_DIR, output_filename)
    plt.savefig(plot_filepath, dpi=150, bbox_inches='tight', facecolor='#0f172a')
    plt.close()
    
    print(f"\n[SUCCESS] Generated premium chart saved to: {os.path.relpath(plot_filepath, BASE_DIR)}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Analyze ECG stress test data and plot graphs.")
    parser.add_argument("--start", type=str, default=None, help="Start timestamp in ISO format (e.g. 2026-07-28T15:00:00+07:00)")
    parser.add_argument("--end", type=str, default=None, help="End timestamp in ISO format")
    parser.add_argument("--out", type=str, default="stress_test_analysis.png", help="Filename of the output chart image")
    args = parser.parse_args()

    analyze_dataset(start_time=args.start, end_time=args.end, output_filename=args.out)
