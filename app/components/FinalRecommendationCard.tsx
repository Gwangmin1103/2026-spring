import { AnalyzeResult } from "@/app/lib/types";

type Props = {
  result: AnalyzeResult;
};

export default function FinalRecommendationCard({ result }: Props) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-base font-semibold">AI 최종 추천</h3>
      <div className="mb-3 inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white">
        추천 사이즈: {result.recommendedSize}
      </div>
      <p className="rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">{result.aiComment}</p>
    </div>
  );
}
