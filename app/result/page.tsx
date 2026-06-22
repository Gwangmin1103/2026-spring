"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BodySilhouetteViewer from "@/app/components/BodySilhouetteViewer";
import ClothingMeasurementSilhouette from "@/app/components/ClothingMeasurementSilhouette";
import FinalRecommendationCard from "@/app/components/FinalRecommendationCard";
import SizeSummaryTabs from "@/app/components/SizeSummaryTabs";
import { loadAnalyzeResult } from "@/app/lib/storage";
import { AnalyzeResult } from "@/app/lib/types";

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<AnalyzeResult | null>(null);

  useEffect(() => {
    const loaded = loadAnalyzeResult<AnalyzeResult>();
    if (!loaded) {
      router.replace("/body");
      return;
    }
    setResult(loaded);
  }, [router]);

  const recommended = useMemo(
    () => result?.analyses.find((x) => x.size === result.recommendedSize) ?? result?.analyses[0],
    [result]
  );

  if (!result || !recommended) return null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-5 px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold">핏 분석 결과</h1>
        <p className="mt-1 text-sm text-slate-600">부위별 오버레이, 사이즈 요약, 최종 추천을 확인하세요.</p>
      </header>

      <ClothingMeasurementSilhouette />

      <section className="grid gap-4 lg:grid-cols-2">
        <BodySilhouetteViewer parts={recommended.parts} />
        <div className="space-y-4">
          <SizeSummaryTabs analyses={result.analyses} />
          <FinalRecommendationCard result={result} />
        </div>
      </section>
    </main>
  );
}
