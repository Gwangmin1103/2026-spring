"use client";

import { PartFit } from "@/app/lib/types";

const fitColors: Record<PartFit["status"], string> = {
  타이트: "#ef4444", // red
  "딱 맞음": "#22c55e", // green
  여유있음: "#3b82f6", // blue
  헐렁: "#1d4ed8", // dark blue
};

type MeasurementData = {
  topLength: {
    value: number;
    label: string;
    status: PartFit["status"];
  };
  sleeveLength: {
    value: number;
    label: string;
    status: PartFit["status"];
  };
  pantsLength: {
    value: number;
    label: string;
    status: PartFit["status"];
  };
};

// Dummy data for now
const dummyMeasurements: MeasurementData = {
  topLength: {
    value: 68,
    label: "총장 68cm — 엉덩이 중간",
    status: "딱 맞음",
  },
  sleeveLength: {
    value: 55,
    label: "소매 55cm — 손목",
    status: "딱 맞음",
  },
  pantsLength: {
    value: 92,
    label: "바지 92cm — 발목",
    status: "여유있음",
  },
};

export default function ClothingMeasurementSilhouette() {
  const measurements = dummyMeasurements;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-base font-semibold">옷 치수 실루엣 시각화</h3>
      <div className="relative mx-auto h-[500px] w-[300px] rounded-xl bg-slate-50">
        <svg viewBox="0 0 300 500" className="absolute inset-0 h-full w-full">
          {/* Male body silhouette - simple outline */}
          <g fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2">
            {/* Head */}
            <circle cx="150" cy="50" r="30" />
            {/* Neck */}
            <rect x="140" y="75" width="20" height="15" />
            {/* Torso */}
            <path d="M110 90 L190 90 L185 220 L115 220 Z" rx="10" />
            {/* Left arm */}
            <path d="M110 95 L80 100 L75 200 L95 200 L100 110 Z" />
            {/* Right arm */}
            <path d="M190 95 L220 100 L225 200 L205 200 L200 110 Z" />
            {/* Left leg */}
            <path d="M115 220 L110 400 L135 400 L145 230 Z" />
            {/* Right leg */}
            <path d="M185 220 L190 400 L165 400 L155 230 Z" />
          </g>

          {/* Top total length - from neck point downward */}
          <g>
            <line
              x1="150"
              y1="90"
              x2="150"
              y2="200"
              stroke={fitColors[measurements.topLength.status]}
              strokeWidth="3"
              strokeDasharray="8 4"
            />
            <circle cx="150" cy="200" r="6" fill={fitColors[measurements.topLength.status]} />
            <text
              x="160"
              y="200"
              fill={fitColors[measurements.topLength.status]}
              fontSize="11"
              fontWeight="bold"
            >
              {measurements.topLength.label}
            </text>
          </g>

          {/* Sleeve length - from shoulder to end */}
          <g>
            {/* Left sleeve */}
            <line
              x1="110"
              y1="95"
              x2="80"
              y2="180"
              stroke={fitColors[measurements.sleeveLength.status]}
              strokeWidth="3"
              strokeDasharray="8 4"
            />
            <circle cx="80" cy="180" r="5" fill={fitColors[measurements.sleeveLength.status]} />
            {/* Right sleeve */}
            <line
              x1="190"
              y1="95"
              x2="220"
              y2="180"
              stroke={fitColors[measurements.sleeveLength.status]}
              strokeWidth="3"
              strokeDasharray="8 4"
            />
            <circle cx="220" cy="180" r="5" fill={fitColors[measurements.sleeveLength.status]} />
            <text
              x="150"
              y="140"
              textAnchor="middle"
              fill={fitColors[measurements.sleeveLength.status]}
              fontSize="11"
              fontWeight="bold"
            >
              {measurements.sleeveLength.label}
            </text>
          </g>

          {/* Pants total length - from waist downward */}
          <g>
            {/* Left pants */}
            <line
              x1="130"
              y1="220"
              x2="120"
              y2="400"
              stroke={fitColors[measurements.pantsLength.status]}
              strokeWidth="3"
              strokeDasharray="8 4"
            />
            <circle cx="120" cy="400" r="5" fill={fitColors[measurements.pantsLength.status]} />
            {/* Right pants */}
            <line
              x1="170"
              y1="220"
              x2="180"
              y2="400"
              stroke={fitColors[measurements.pantsLength.status]}
              strokeWidth="3"
              strokeDasharray="8 4"
            />
            <circle cx="180" cy="400" r="5" fill={fitColors[measurements.pantsLength.status]} />
            <text
              x="150"
              y="320"
              textAnchor="middle"
              fill={fitColors[measurements.pantsLength.status]}
              fontSize="11"
              fontWeight="bold"
            >
              {measurements.pantsLength.label}
            </text>
          </g>

          {/* Legend */}
          <g transform="translate(10, 460)">
            <rect x="0" y="0" width="12" height="12" fill="#ef4444" rx="2" />
            <text x="16" y="10" fontSize="10" fill="#64748b">타이트</text>
            
            <rect x="60" y="0" width="12" height="12" fill="#22c55e" rx="2" />
            <text x="76" y="10" fontSize="10" fill="#64748b">딱 맞음</text>
            
            <rect x="130" y="0" width="12" height="12" fill="#3b82f6" rx="2" />
            <text x="146" y="10" fontSize="10" fill="#64748b">여유있음</text>
          </g>
        </svg>
      </div>
    </div>
  );
}
