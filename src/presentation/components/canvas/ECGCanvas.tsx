import React, { useRef, useState } from "react";
import type { ECGPaths, RPeakMarker } from "../../../core/types/ecgTypes";
import {
  SUPPORTED_LEADS,
  LEAD_HEIGHT,
  CALIBRATION_DURATION,
  timeToX,
} from "../../../core/algorithms/ecgCoordinates";
interface ECGCanvasProps {
  paths: ECGPaths;
  rPeaks: RPeakMarker[];
  isAnomaly?: boolean;
  classResult?: string;
  speed?: number;
  paperSpeed?: number;
  gain?: number;
  scale?: number;
  timeOffset?: number;
  pixelsPerMm?: number;
  showCalibrationPulse?: boolean;
  durationSeconds?: number;
}
const markerKeys = {
  I: "yI",
  II: "yII",
  III: "yIII",
  aVR: "yaVR",
  aVL: "yaVL",
  aVF: "yaVF",
} as const;
export const ECGCanvas: React.FC<ECGCanvasProps> = ({
  paths,
  rPeaks,
  paperSpeed = 25,
  gain = 10,
  scale = 1,
  timeOffset = 0,
  pixelsPerMm = 3.7795,
  showCalibrationPulse = true,
  durationSeconds = 10,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const xScale = paperSpeed / 25;
  const yScale = gain / 10;
  const pulseWidth = timeToX(CALIBRATION_DURATION) * xScale;
  const dataOffset = showCalibrationPulse ? pulseWidth + 16 : 16;
  const logicalWidth = dataOffset + timeToX(durationSeconds) * xScale + 16;
  const physicalWidth = (logicalWidth / 8) * pixelsPerMm;
  const physicalHeight =
    ((SUPPORTED_LEADS.length * LEAD_HEIGHT) / 8) * pixelsPerMm;
  const movePointer = (event: React.PointerEvent<SVGSVGElement>) => {
    const rectangle = svgRef.current?.getBoundingClientRect();
    if (!rectangle?.width) return;
    setPointer({
      x: ((event.clientX - rectangle.left) / rectangle.width) * logicalWidth,
      y:
        ((event.clientY - rectangle.top) / rectangle.height) *
        SUPPORTED_LEADS.length *
        LEAD_HEIGHT,
    });
  };
  const pointerTime = pointer
    ? Math.max(
        0,
        Math.min(durationSeconds, (pointer.x - dataOffset) / (200 * xScale)),
      ) + timeOffset
    : 0;
  return (
    <div
      id="ecg-scroll-container"
      className="w-full h-full overflow-auto relative bg-white custom-scrollbar"
    >
      <div
        style={{
          width: physicalWidth + 52,
          minWidth: physicalWidth + 52,
          zoom: scale,
        }}
        className="relative"
      >
        {showCalibrationPulse && (
          <div
            aria-hidden="true"
            className="absolute left-0 top-0 w-12 font-mono text-[9px] text-clinical-red"
            style={{ height: physicalHeight }}
          >
            {SUPPORTED_LEADS.flatMap((lead, row) =>
              [3, 2, 1, 0, -1, -2, -3]
                .map((voltage) => ({ voltage, y: 240 - voltage * 80 * yScale }))
                .filter((tick) => tick.y >= 0 && tick.y <= LEAD_HEIGHT)
                .map((tick) => (
                  <span
                    key={lead + ":" + tick.voltage}
                    className="absolute left-1 -translate-y-1/2 whitespace-nowrap"
                    style={{
                      top: ((row * LEAD_HEIGHT + tick.y) / 8) * pixelsPerMm,
                    }}
                  >
                    {tick.voltage === 0
                      ? "0"
                      : (tick.voltage > 0 ? "+" : "") +
                        tick.voltage.toFixed(1) +
                        "mV"}
                  </span>
                )),
            )}
          </div>
        )}
        <svg
          ref={svgRef}
          data-testid="ecg-svg"
          data-paper-speed={paperSpeed}
          data-gain={gain}
          data-pixels-per-mm={pixelsPerMm}
          data-grid-small-logical="8"
          data-grid-large-logical="40"
          data-calibration-pulse-width-logical={pulseWidth}
          data-calibration-pulse-height-logical={80 * yScale}
          width={logicalWidth}
          height={SUPPORTED_LEADS.length * LEAD_HEIGHT}
          viewBox={
            "0 0 " + logicalWidth + " " + SUPPORTED_LEADS.length * LEAD_HEIGHT
          }
          style={{
            width: physicalWidth,
            marginLeft: 52,
            height: physicalHeight,
            touchAction: "pan-x pan-y",
          }}
          onPointerMove={movePointer}
          onPointerLeave={() => setPointer(null)}
          role="img"
          aria-label="Enam limb lead ECG"
        >
          <defs>
            <pattern
              id="ecg-small-grid"
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M8 0H0V8"
                fill="none"
                stroke="#ffd1dc"
                strokeWidth="0.5"
              />
            </pattern>
            <pattern
              id="ecg-large-grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <rect width="40" height="40" fill="url(#ecg-small-grid)" />
              <path d="M40 0H0V40" fill="none" stroke="#ffa6c9" />
            </pattern>
          </defs>
          <rect
            width={logicalWidth}
            height={SUPPORTED_LEADS.length * LEAD_HEIGHT}
            fill="url(#ecg-large-grid)"
          />
          {SUPPORTED_LEADS.map((lead, row) => (
            <g key={lead} transform={"translate(0," + row * LEAD_HEIGHT + ")"}>
              <line
                x1="0"
                y1={LEAD_HEIGHT}
                x2={logicalWidth}
                y2={LEAD_HEIGHT}
                stroke="#ffa6c9"
              />
              <rect
                x={dataOffset + 8}
                y="8"
                width={lead.startsWith("a") ? 176 : 44}
                height="30"
                rx="5"
                fill="white"
                stroke="#dbe5f2"
              />
              <text
                x={dataOffset + 16}
                y="30"
                fontSize="22"
                fontWeight="700"
                fill="#001f54"
              >
                {lead}
                {lead.startsWith("a") ? " (Calculated)" : ""}
              </text>
              {showCalibrationPulse && (
                <path
                  data-testid={"calibration-pulse-" + lead}
                  d="M0 240H20V160H60V240H80"
                  transform={
                    "translate(0,240) scale(" +
                    xScale +
                    "," +
                    yScale +
                    ") translate(0,-240)"
                  }
                  fill="none"
                  stroke="#001f54"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                />
              )}
              <g
                data-testid={"ecg-transform-" + lead}
                transform={
                  "translate(" +
                  dataOffset +
                  ",240) scale(" +
                  xScale +
                  "," +
                  yScale +
                  ") translate(0,-240)"
                }
              >
                <path
                  data-testid={"ecg-path-" + lead}
                  d={paths[lead].length ? "M" + paths[lead].join(" L") : ""}
                  fill="none"
                  stroke="#001f54"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
                {rPeaks.map((peak, index) =>
                  peak[markerKeys[lead]] === undefined ? null : (
                    <circle
                      key={index}
                      data-testid={"ecg-marker-" + lead}
                      cx={peak.x}
                      cy={peak[markerKeys[lead]]}
                      r="2.5"
                      fill="#176bce"
                    />
                  ),
                )}
              </g>
              {lead === "II" &&
                rPeaks
                  .filter((peak) => peak.prevX !== undefined)
                  .map((peak, index) => (
                    <text
                      key={index}
                      x={dataOffset + ((peak.prevX! + peak.x) / 2) * xScale}
                      y="42"
                      textAnchor="middle"
                      fontSize="12"
                      fill="#176bce"
                    >
                      {peak.bpm} BPM
                    </text>
                  ))}
            </g>
          ))}
          {pointer && (
            <line
              x1={pointer.x}
              x2={pointer.x}
              y1="0"
              y2={SUPPORTED_LEADS.length * LEAD_HEIGHT}
              stroke="#176bce"
              strokeDasharray="4,4"
            />
          )}
        </svg>
        {pointer && (
          <output className="sticky bottom-0 left-0 bg-white px-3 py-1 text-xs">
            {pointerTime.toFixed(3)} s
          </output>
        )}
      </div>
    </div>
  );
};
