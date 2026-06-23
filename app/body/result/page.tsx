"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BodyMeasurementSummaryCard from "@/app/components/BodyMeasurementSummaryCard";
import BodySilhouetteViewer from "@/app/components/BodySilhouetteViewer";
import RecommendedSizeHero from "@/app/components/RecommendedSizeHero";
import SizeComparisonTable from "@/app/components/SizeComparisonTable";
import {
  analyzeWithDemoChart,
  buildDemoComparisonRows,
  formatBodyMeasurementItems,
  formatProfileSubtitle,
  getDemoSizeLabels
} from "@/app/lib/demoSizeChart";
import { FitVerdict } from "@/app/lib/sizeMatch";
import { loadBodyEstimation, loadBodyProfile } from "@/app/lib/storage";
import { BodyEstimationResult } from "@/app/lib/types";

const LEGEND: { verdict: FitVerdict; description: string }[] = [
  { verdict: "TIGHT", description: "신체 > 옷 실측" },
  { verdict: "FIT", description: "차이 0~3cm" },
  { verdict: "REGULAR", description: "차이 3~6cm" },
  { verdict: "LOOSE", description: "차이 6cm 초과" }
];

export default function BodyResultPage() {
  const router = useRouter();
  const [estimation, setEstimation] = useState<BodyEstimationResult | null>(null);
  const [subtitle, setSubtitle] = useState("키·몸무게·성별 기반 추정 결과");

  useEffect(() => {
    const profile = loadBodyProfile();
    const loaded = loadBodyEstimation();
    if (!profile || !loaded) {
      router.replace("/body");
      return;
    }
    setEstimation(loaded);
    setSubtitle(formatProfileSubtitle(profile));
  }, [router]);

  const analysis = useMemo(() => (estimation ? analyzeWithDemoChart(estimation) : null), [estimation]);

  const comparisonRows = useMemo(
    () => (estimation ? buildDemoComparisonRows(estimation.estimated) : []),
    [estimation]
  );

  const silhouetteParts = useMemo(() => {
    if (!analysis) return [];
    const recommended =
      analysis.analyses.find((item) => item.size === analysis.recommendedSize) ?? analysis.analyses[0];
    return recommended?.parts ?? [];
  }, [analysis]);

  if (!estimation || !analysis) return null;

  const measurements = formatBodyMeasurementItems(estimation.estimated);
  const sizeLabels = getDemoSizeLabels();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">STEP 2</p>
          <h1 className="text-2xl font-bold text-slate-900">신체 치수 · 사이즈 비교 결과</h1>
          <p className="mt-1 text-sm text-slate-600">
            추정된 신체 치수와 표준 상의 사이즈표 비교 결과입니다.
          </p>
        </div>
        <Link
          href="/product"
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          다음: 상품 입력 →
        </Link>
      </header>

      <BodyMeasurementSummaryCard subtitle={subtitle} measurements={measurements} />

      <section className="grid gap-4 lg:grid-cols-2">
        <BodySilhouetteViewer parts={silhouetteParts} />
        <RecommendedSizeHero
          sizeLabel={analysis.recommendedSize}
          description={`표준 사이즈표 기준 ${analysis.recommendedSize} 사이즈가 가장 균형 잡힙니다. ${estimation.note}`}
        />
      </section>

      <SizeComparisonTable
        sizeLabels={sizeLabels}
        rows={comparisonRows}
        description="부위별 핏 판정 (표준 상의 사이즈표)"
      />

      <section className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">판정 기준</p>
        <div className="flex flex-wrap gap-3">
          {LEGEND.map((item) => (
            <div key={item.verdict} className="flex items-center gap-2 text-sm text-slate-600">
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                {item.verdict}
              </span>
              <span>{item.description}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
