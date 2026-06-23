"use client";

import { PartFit } from "@/app/lib/types";

const fitColors: Record<PartFit["status"], string> = {
  타이트: "#ef4444",
  "딱 맞음": "#22c55e",
  여유있음: "#3b82f6",
  헐렁: "#1d4ed8"
};

export type GarmentSilhouetteMeasurement = {
  part: "어깨" | "총장" | "소매";
  bodyCm: number;
  garmentCm: number;
  easeCm: number;
  status: PartFit["status"];
};

type Props = {
  measurements: GarmentSilhouetteMeasurement[];
  title?: string;
};

const ANATOMY = {
  neck: { x: 150, y: 90 },
  leftShoulder: { x: 110, y: 95 },
  rightShoulder: { x: 190, y: 95 },
  sleeveLineY: 145,
  shoulderArrowY: 78
} as const;

const LENGTH_PX_PER_CM = 1.85;
const SLEEVE_PX_PER_CM = 1.35;

function formatEase(easeCm: number) {
  const sign = easeCm > 0 ? "+" : "";
  return `${sign}${easeCm.toFixed(1)}cm`;
}

function findMeasurement(measurements: GarmentSilhouetteMeasurement[], part: GarmentSilhouetteMeasurement["part"]) {
  return measurements.find((item) => item.part === part);
}

function ArrowMarker({ id, color }: { id: string; color: string }) {
  return (
    <marker id={id} markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto-start-reverse">
      <path d="M0,0 L8,4 L0,8 Z" fill={color} />
    </marker>
  );
}

function MeasurementLabel({
  x,
  y,
  anchor,
  color,
  title,
  value
}: {
  x: number;
  y: number;
  anchor: "start" | "middle" | "end";
  color: string;
  title: string;
  value: string;
}) {
  const boxWidth = 92;
  const boxX = anchor === "start" ? x : anchor === "end" ? x - boxWidth : x - boxWidth / 2;

  return (
    <g>
      <rect
        x={boxX}
        y={y - 14}
        width={boxWidth}
        height={28}
        rx={6}
        fill="white"
        stroke={color}
        strokeWidth="1.5"
        opacity={0.95}
      />
      <text x={boxX + boxWidth / 2} y={y - 1} textAnchor="middle" fill="#475569" fontSize="9" fontWeight="600">
        {title}
      </text>
      <text x={boxX + boxWidth / 2} y={y + 10} textAnchor="middle" fill={color} fontSize="10" fontWeight="700">
        {value}
      </text>
    </g>
  );
}

export default function ClothingMeasurementSilhouette({
  measurements,
  title = "옷 치수 실루엣 시각화"
}: Props) {
  const shoulder = findMeasurement(measurements, "어깨");
  const length = findMeasurement(measurements, "총장");
  const sleeve = findMeasurement(measurements, "소매");

  const lengthEndY = length
    ? ANATOMY.neck.y + length.garmentCm * LENGTH_PX_PER_CM
    : ANATOMY.neck.y + 69 * LENGTH_PX_PER_CM;
  const sleeveEndX = sleeve
    ? ANATOMY.rightShoulder.x + sleeve.garmentCm * SLEEVE_PX_PER_CM
    : ANATOMY.rightShoulder.x + 60 * SLEEVE_PX_PER_CM;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-base font-semibold">{title}</h3>
      <div className="relative mx-auto h-[500px] w-[300px] rounded-xl bg-slate-50">
        <svg viewBox="0 0 300 500" className="absolute inset-0 h-full w-full">
          <defs>
            {shoulder ? <ArrowMarker id="shoulder-arrow" color={fitColors[shoulder.status]} /> : null}
          </defs>

          <g fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2">
            <circle cx="150" cy="50" r="30" />
            <rect x="140" y="75" width="20" height="15" />
            <path d="M110 90 L190 90 L185 220 L115 220 Z" />
            <path d="M110 95 L80 100 L75 200 L95 200 L100 110 Z" />
            <path d="M190 95 L220 100 L225 200 L205 200 L200 110 Z" />
            <path d="M115 220 L110 400 L135 400 L145 230 Z" />
            <path d="M185 220 L190 400 L165 400 L155 230 Z" />
          </g>

          {shoulder ? (
            <g>
              <line
                x1={ANATOMY.leftShoulder.x}
                y1={ANATOMY.shoulderArrowY}
                x2={ANATOMY.rightShoulder.x}
                y2={ANATOMY.shoulderArrowY}
                stroke={fitColors[shoulder.status]}
                strokeWidth="2.5"
                markerStart="url(#shoulder-arrow)"
                markerEnd="url(#shoulder-arrow)"
              />
              <MeasurementLabel
                x={8}
                y={ANATOMY.shoulderArrowY + 4}
                anchor="start"
                color={fitColors[shoulder.status]}
                title={`어깨 ${shoulder.garmentCm.toFixed(1)}cm`}
                value={formatEase(shoulder.easeCm)}
              />
            </g>
          ) : null}

          {length ? (
            <g>
              <line
                x1={ANATOMY.neck.x}
                y1={ANATOMY.neck.y}
                x2={ANATOMY.neck.x}
                y2={lengthEndY}
                stroke={fitColors[length.status]}
                strokeWidth="2.5"
                strokeDasharray="8 4"
              />
              <circle cx={ANATOMY.neck.x} cy={lengthEndY} r="5" fill={fitColors[length.status]} />
              <MeasurementLabel
                x={168}
                y={lengthEndY + 4}
                anchor="start"
                color={fitColors[length.status]}
                title={`총장 ${length.garmentCm.toFixed(1)}cm`}
                value={formatEase(length.easeCm)}
              />
            </g>
          ) : null}

          {sleeve ? (
            <g>
              <line
                x1={ANATOMY.rightShoulder.x}
                y1={ANATOMY.sleeveLineY}
                x2={Math.min(sleeveEndX, 292)}
                y2={ANATOMY.sleeveLineY}
                stroke={fitColors[sleeve.status]}
                strokeWidth="2.5"
              />
              <circle cx={Math.min(sleeveEndX, 292)} cy={ANATOMY.sleeveLineY} r="5" fill={fitColors[sleeve.status]} />
              <MeasurementLabel
                x={292}
                y={ANATOMY.sleeveLineY - 18}
                anchor="end"
                color={fitColors[sleeve.status]}
                title={`소매 ${sleeve.garmentCm.toFixed(1)}cm`}
                value={formatEase(sleeve.easeCm)}
              />
            </g>
          ) : null}

          <g transform="translate(10, 460)">
            <rect x="0" y="0" width="12" height="12" fill="#ef4444" rx="2" />
            <text x="16" y="10" fontSize="10" fill="#64748b">
              타이트
            </text>
            <rect x="60" y="0" width="12" height="12" fill="#22c55e" rx="2" />
            <text x="76" y="10" fontSize="10" fill="#64748b">
              딱 맞음
            </text>
            <rect x="130" y="0" width="12" height="12" fill="#3b82f6" rx="2" />
            <text x="146" y="10" fontSize="10" fill="#64748b">
              여유있음
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
