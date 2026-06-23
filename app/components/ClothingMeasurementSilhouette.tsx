"use client";

import { GarmentCategory } from "@/app/lib/types";
import { PartFit } from "@/app/lib/types";

const fitColors: Record<PartFit["status"], string> = {
  타이트: "#ef4444",
  "딱 맞음": "#22c55e",
  여유있음: "#3b82f6",
  헐렁: "#1d4ed8"
};

export type GarmentSilhouetteMeasurement = {
  part: "어깨" | "가슴" | "소매" | "총장" | "허리" | "허벅지" | "밑단";
  bodyCm: number;
  garmentFlatCm: number;
  garmentCompareCm: number;
  easeCm: number;
  status: PartFit["status"];
};

type Props = {
  category: GarmentCategory;
  measurements: GarmentSilhouetteMeasurement[];
  title?: string;
};

const ANATOMY = {
  neck: { x: 150, y: 90 },
  leftShoulder: { x: 110, y: 95 },
  rightShoulder: { x: 190, y: 95 },
  chestY: 135,
  sleeveLineY: 145,
  rightArmEnd: { x: 225, y: 195 },
  leftHip: { x: 115, y: 220 },
  leftWaist: { x: 112, y: 228 },
  rightThigh: { x: 178, y: 315 },
  leftAnkle: { x: 120, y: 395 },
  rightAnkle: { x: 170, y: 395 },
  shoulderArrowY: 78
} as const;

const TOP_LABEL_POSITIONS: Record<
  Extract<GarmentSilhouetteMeasurement["part"], "어깨" | "가슴" | "소매" | "총장">,
  { x: number; y: number; anchor: "start" | "end" }
> = {
  어깨: { x: 72, y: 72, anchor: "end" },
  가슴: { x: 208, y: 135, anchor: "start" },
  소매: { x: 238, y: 195, anchor: "start" },
  총장: { x: 98, y: 218, anchor: "end" }
};

const BOTTOM_LABEL_POSITIONS: Record<
  Extract<GarmentSilhouetteMeasurement["part"], "허리" | "허벅지" | "총장" | "밑단">,
  { x: number; y: number; anchor: "start" | "end" }
> = {
  허리: { x: 98, y: 228, anchor: "end" },
  허벅지: { x: 178, y: 315, anchor: "start" },
  총장: { x: 108, y: 395, anchor: "end" },
  밑단: { x: 192, y: 395, anchor: "start" }
};

const LENGTH_PX_PER_CM = 1.85;
const SLEEVE_PX_PER_CM = 1.35;

function formatEase(easeCm: number) {
  const sign = easeCm > 0 ? "+" : "";
  return `${sign}${easeCm.toFixed(1)}cm`;
}

function formatGarmentLabel(part: GarmentSilhouetteMeasurement) {
  const usesDouble = part.garmentCompareCm !== part.garmentFlatCm;
  if (usesDouble) {
    return `${part.part} ${part.garmentFlatCm.toFixed(1)}→${part.garmentCompareCm.toFixed(1)}cm`;
  }
  return `${part.part} ${part.garmentFlatCm.toFixed(1)}cm`;
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
  anchor: "start" | "end";
  color: string;
  title: string;
  value: string;
}) {
  const boxWidth = 98;
  const boxX = anchor === "start" ? x : x - boxWidth;

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
      <text x={boxX + boxWidth / 2} y={y - 1} textAnchor="middle" fill="#475569" fontSize="8.5" fontWeight="600">
        {title}
      </text>
      <text x={boxX + boxWidth / 2} y={y + 10} textAnchor="middle" fill={color} fontSize="10" fontWeight="700">
        {value}
      </text>
    </g>
  );
}

function renderMeasurementLabel(part: GarmentSilhouetteMeasurement, category: GarmentCategory) {
  const position =
    category === "top"
      ? TOP_LABEL_POSITIONS[part.part as keyof typeof TOP_LABEL_POSITIONS]
      : BOTTOM_LABEL_POSITIONS[part.part as keyof typeof BOTTOM_LABEL_POSITIONS];

  if (!position) return null;

  return (
    <MeasurementLabel
      key={part.part}
      x={position.x}
      y={position.y}
      anchor={position.anchor}
      color={fitColors[part.status]}
      title={formatGarmentLabel(part)}
      value={formatEase(part.easeCm)}
    />
  );
}

function TopOverlays({ measurements }: { measurements: GarmentSilhouetteMeasurement[] }) {
  const shoulder = findMeasurement(measurements, "어깨");
  const chest = findMeasurement(measurements, "가슴");
  const length = findMeasurement(measurements, "총장");
  const sleeve = findMeasurement(measurements, "소매");

  const lengthEndY = length
    ? ANATOMY.neck.y + length.garmentFlatCm * LENGTH_PX_PER_CM
    : ANATOMY.leftHip.y;
  const sleeveEndX = sleeve
    ? ANATOMY.rightShoulder.x + sleeve.garmentFlatCm * SLEEVE_PX_PER_CM
    : ANATOMY.rightArmEnd.x;

  return (
    <>
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
          {renderMeasurementLabel(shoulder, "top")}
        </g>
      ) : null}

      {chest ? (
        <g>
          <line
            x1={125}
            y1={ANATOMY.chestY}
            x2={175}
            y2={ANATOMY.chestY}
            stroke={fitColors[chest.status]}
            strokeWidth="2.5"
            strokeDasharray="6 4"
          />
          {renderMeasurementLabel(chest, "top")}
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
          {renderMeasurementLabel(length, "top")}
        </g>
      ) : null}

      {sleeve ? (
        <g>
          <line
            x1={ANATOMY.rightShoulder.x}
            y1={ANATOMY.sleeveLineY}
            x2={Math.min(sleeveEndX, 230)}
            y2={ANATOMY.sleeveLineY}
            stroke={fitColors[sleeve.status]}
            strokeWidth="2.5"
          />
          <circle cx={Math.min(sleeveEndX, 230)} cy={ANATOMY.sleeveLineY} r="5" fill={fitColors[sleeve.status]} />
          {renderMeasurementLabel(sleeve, "top")}
        </g>
      ) : null}
    </>
  );
}

function BottomOverlays({ measurements }: { measurements: GarmentSilhouetteMeasurement[] }) {
  const waist = findMeasurement(measurements, "허리");
  const thigh = findMeasurement(measurements, "허벅지");
  const length = findMeasurement(measurements, "총장");
  const hem = findMeasurement(measurements, "밑단");

  const outseamEndY = length
    ? ANATOMY.leftWaist.y + length.garmentFlatCm * LENGTH_PX_PER_CM
    : ANATOMY.leftAnkle.y;

  return (
    <>
      {waist ? (
        <g>
          <line
            x1={118}
            y1={ANATOMY.leftWaist.y}
            x2={182}
            y2={ANATOMY.leftWaist.y}
            stroke={fitColors[waist.status]}
            strokeWidth="2.5"
            strokeDasharray="6 4"
          />
          {renderMeasurementLabel(waist, "bottom")}
        </g>
      ) : null}

      {thigh ? (
        <g>
          <line
            x1={145}
            y1={ANATOMY.rightThigh.y}
            x2={185}
            y2={ANATOMY.rightThigh.y}
            stroke={fitColors[thigh.status]}
            strokeWidth="2.5"
          />
          {renderMeasurementLabel(thigh, "bottom")}
        </g>
      ) : null}

      {length ? (
        <g>
          <line
            x1={ANATOMY.leftAnkle.x}
            y1={ANATOMY.leftWaist.y}
            x2={ANATOMY.leftAnkle.x}
            y2={Math.min(outseamEndY, 420)}
            stroke={fitColors[length.status]}
            strokeWidth="2.5"
            strokeDasharray="8 4"
          />
          <circle cx={ANATOMY.leftAnkle.x} cy={Math.min(outseamEndY, 420)} r="5" fill={fitColors[length.status]} />
          {renderMeasurementLabel(length, "bottom")}
        </g>
      ) : null}

      {hem ? (
        <g>
          <line
            x1={145}
            y1={ANATOMY.rightAnkle.y}
            x2={195}
            y2={ANATOMY.rightAnkle.y}
            stroke={fitColors[hem.status]}
            strokeWidth="2.5"
          />
          {renderMeasurementLabel(hem, "bottom")}
        </g>
      ) : null}
    </>
  );
}

export default function ClothingMeasurementSilhouette({
  category,
  measurements,
  title = "옷 치수 실루엣 시각화"
}: Props) {
  const shoulder = category === "top" ? findMeasurement(measurements, "어깨") : null;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <h3 className="mb-1 text-base font-semibold">{title}</h3>
      <p className="mb-3 text-xs text-slate-500">
        {category === "top" ? "상의" : "하의"} · 모드맨 단면 실측 (둘레 항목은 ×2 적용)
      </p>
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

          {category === "top" ? (
            <TopOverlays measurements={measurements} />
          ) : (
            <BottomOverlays measurements={measurements} />
          )}

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
