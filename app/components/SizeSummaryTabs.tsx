"use client";

import { useState } from "react";
import { SizeAnalysis } from "@/app/lib/types";

type Props = {
  analyses: SizeAnalysis[];
};

export default function SizeSummaryTabs({ analyses }: Props) {
  const sizeLabels = analyses.map((a) => a.size);
  const [activeSize, setActiveSize] = useState(sizeLabels[0] ?? "M");
  const selected = analyses.find((a) => a.size === activeSize) ?? analyses[0];

  if (!selected) return null;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-base font-semibold">사이즈별 요약 카드</h3>
      <div className="mb-4 flex flex-wrap gap-2">
        {sizeLabels.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => setActiveSize(size)}
            className={`rounded-md border px-3 py-2 text-sm ${
              activeSize === size ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300"
            }`}
          >
            {size}
          </button>
        ))}
      </div>
      <ul className="space-y-2 text-sm text-slate-700">
        {selected.highlights.map((line) => (
          <li key={line} className="rounded-md bg-slate-50 px-3 py-2">
            {selected.size}: {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
