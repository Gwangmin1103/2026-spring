import FitVerdictBadge from "@/app/components/FitVerdictBadge";
import { FitVerdict } from "@/app/lib/sizeMatch";

export type SizeComparisonRow = {
  part: string;
  verdicts: Record<string, FitVerdict>;
};

type Props = {
  sizeLabels: string[];
  rows: SizeComparisonRow[];
  description?: string;
};

export default function SizeComparisonTable({
  sizeLabels,
  rows,
  description = "부위별 핏 판정"
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
              <th className="px-5 py-3 font-semibold text-slate-600">부위</th>
              {sizeLabels.map((size) => (
                <th key={size} className="px-4 py-3 text-center font-semibold text-slate-600">
                  {size}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.part} className="border-b border-slate-50 last:border-0">
                <td className="px-5 py-3.5 font-medium text-slate-800">{row.part}</td>
                {sizeLabels.map((size) => (
                  <td key={size} className="px-4 py-3.5 text-center">
                    <FitVerdictBadge verdict={row.verdicts[size]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
