"use client";

import { PartFit } from "@/app/lib/types";

const bubbleClass: Record<PartFit["status"], string> = {
  타이트: "bg-rose-500",
  "딱 맞음": "bg-emerald-500",
  여유있음: "bg-blue-500",
  헐렁: "bg-blue-700"
};

const points: Record<string, { x: number; y: number }> = {
  어깨: { x: 50, y: 18 },
  가슴: { x: 50, y: 30 },
  허리: { x: 50, y: 42 },
  힙: { x: 50, y: 54 },
  허벅지: { x: 50, y: 66 }
};

type Props = {
  parts: PartFit[];
};

export default function BodySilhouetteViewer({ parts }: Props) {
  const lengthPart = parts.find((part) => part.part === "총장");

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-base font-semibold">인체 실루엣 핏 오버레이</h3>
      <div className="relative mx-auto h-[480px] w-[280px] rounded-xl bg-slate-50">
        <svg viewBox="0 0 280 480" className="absolute inset-0 h-full w-full">
          <circle cx="140" cy="70" r="34" fill="#cbd5e1" />
          <rect x="100" y="110" width="80" height="200" rx="34" fill="#cbd5e1" />
          <rect x="72" y="120" width="26" height="170" rx="12" fill="#cbd5e1" />
          <rect x="182" y="120" width="26" height="170" rx="12" fill="#cbd5e1" />
          <rect x="106" y="305" width="26" height="150" rx="12" fill="#cbd5e1" />
          <rect x="148" y="305" width="26" height="150" rx="12" fill="#cbd5e1" />

          {lengthPart ? (
            <>
              <line x1="60" y1="350" x2="220" y2="350" stroke="#0f172a" strokeWidth="2" strokeDasharray="6 6" />
              <text x="140" y="340" textAnchor="middle" fill="#0f172a" fontSize="12">
                이 선까지 옵니다 ({lengthPart.comment})
              </text>
            </>
          ) : null}
        </svg>

        {parts
          .filter((part) => part.part !== "총장")
          .map((part) => {
            const p = points[part.part];
            return (
              <div key={part.part} className="absolute left-0 top-0 w-full" style={{ transform: `translate(${p.x}%, ${p.y}%)` }}>
                <div className="relative -translate-x-1/2">
                  <div className={`inline-block rounded-full px-2 py-1 text-xs text-white ${bubbleClass[part.status]}`}>
                    {part.part}: {part.status}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
