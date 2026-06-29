import { Fragment } from "react";
import FitVerdictBadge from "@/app/components/FitVerdictBadge";
import { ComparisonVerdict, FitVerdict, isHemPosition } from "@/app/lib/sizeMatch";
import { HemPosition } from "@/app/lib/types";

const HEM_POSITIONS: HemPosition[] = [
  "허리 위",
  "허리~골반",
  "골반",
  "엉덩이 중간",
  "엉덩이 아래"
];

function HemPositionLadder({ selected }: { selected: HemPosition }) {
  return (
    <div className="flex flex-col gap-0.5 text-xs leading-tight">
      {HEM_POSITIONS.map((position) => (
        <span
          key={position}
          className={
            position === selected
              ? "rounded bg-yellow-200 px-1 font-bold text-slate-800"
              : "text-gray-400"
          }
        >
          {position}
        </span>
      ))}
    </div>
  );
}

export type SizeComparisonCell = {
  garmentCm: number;
  differenceCm: number;
  verdict: ComparisonVerdict;
};

export type SizeComparisonRow = {
  part: string;
  bodyCm: number;
  cells: Record<string, SizeComparisonCell>;
};

type Props = {
  sizeLabels: string[];
  rows: SizeComparisonRow[];
  description?: string;
  hemPosition?: HemPosition;
};

function formatCm(value: number) {
  return `${value.toFixed(1)}cm`;
}

function formatDifference(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}`;
}

export default function SizeComparisonTable({
  sizeLabels,
  rows,
  description = "부위별 핏 판정",
  hemPosition
}: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-900">사이즈 비교 결과</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left">
              <th rowSpan={2} className="px-5 py-3 font-semibold text-slate-600">
                부위
              </th>
              <th rowSpan={2} className="px-4 py-3 font-semibold text-slate-600">
                내 신체 치수
              </th>
              {sizeLabels.map((size) => (
                <th key={size} colSpan={3} className="border-l border-slate-200 px-4 py-3 text-center font-semibold text-slate-600">
                  {size}
                </th>
              ))}
            </tr>
            <tr className="border-b border-slate-100 bg-slate-50 text-left">
              {sizeLabels.map((size) => (
                <Fragment key={`${size}-subheaders`}>
                  <th className="border-l border-slate-200 px-3 py-2 text-center text-xs font-semibold text-slate-500">
                    실측
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-slate-500">
                    차이
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-slate-500">
                    판정
                  </th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.part} className="border-b border-slate-50 last:border-0">
                <td className="px-5 py-3.5 font-medium text-slate-800">{row.part}</td>
                <td className="px-4 py-3.5 text-slate-700">{formatCm(row.bodyCm)}</td>
                {sizeLabels.map((size) => {
                  const cell = row.cells[size];
                  if (!cell) {
                    return (
                      <Fragment key={`${row.part}-${size}-empty`}>
                        <td className="border-l border-slate-100 px-3 py-3.5 text-center text-slate-400">—</td>
                        <td className="px-3 py-3.5 text-center text-slate-400">—</td>
                        <td className="px-3 py-3.5 text-center text-slate-400">—</td>
                      </Fragment>
                    );
                  }

                  const diffClass =
                    cell.differenceCm < 0
                      ? "text-rose-600"
                      : cell.differenceCm <= 3
                        ? "text-yellow-600"
                        : cell.differenceCm <= 6
                          ? "text-emerald-600"
                          : "text-blue-600";

                  return (
                    <Fragment key={`${row.part}-${size}`}>
                      <td className="border-l border-slate-100 px-3 py-3.5 text-center text-slate-700">
                        {formatCm(cell.garmentCm)}
                      </td>
                      <td className={`px-3 py-3.5 text-center font-semibold ${diffClass}`}>
                        {formatDifference(cell.differenceCm)}
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        {row.part === "총장" && (isHemPosition(cell.verdict) || hemPosition) ? (
                          <HemPositionLadder
                            selected={isHemPosition(cell.verdict) ? cell.verdict : hemPosition!}
                          />
                        ) : (
                          <FitVerdictBadge verdict={cell.verdict as FitVerdict} />
                        )}
                      </td>
                    </Fragment>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
