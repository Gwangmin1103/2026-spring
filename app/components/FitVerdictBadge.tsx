import { FitVerdict } from "@/app/lib/sizeMatch";

const VERDICT_STYLES: Record<FitVerdict, string> = {
  TIGHT: "bg-rose-100 text-rose-700 ring-rose-200",
  FIT: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  REGULAR: "bg-blue-100 text-blue-700 ring-blue-200",
  LOOSE: "bg-violet-100 text-violet-700 ring-violet-200"
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
