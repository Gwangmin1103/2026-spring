import { FitVerdict } from "@/app/lib/sizeMatch";

const VERDICT_STYLES: Record<FitVerdict, string> = {
  TIGHT: "bg-rose-100 text-rose-700 ring-rose-200",
  FIT: "bg-yellow-100 text-yellow-800 ring-yellow-200",
  REGULAR: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  LOOSE: "bg-slate-100 text-slate-600 ring-slate-200"
};

const VERDICT_LABELS: Record<FitVerdict, string> = {
  TIGHT: "TIGHT",
  FIT: "FIT",
  REGULAR: "REGULAR",
  LOOSE: "LOOSE"
};

type Props = {
  verdict: FitVerdict;
};

export default function FitVerdictBadge({ verdict }: Props) {
  return (
    <span
      className={`inline-flex min-w-[4.5rem] items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${VERDICT_STYLES[verdict]}`}
    >
      {VERDICT_LABELS[verdict]}
    </span>
  );
}
