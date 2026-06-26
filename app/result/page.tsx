"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BodyMeasurementSummaryCard from "@/app/components/BodyMeasurementSummaryCard";
import BodySilhouetteViewer from "@/app/components/BodySilhouetteViewer";
import ProductImageGallery from "@/app/components/ProductImageGallery";
import OutfitShotLinks from "@/app/components/OutfitShotLinks";
import RecommendedSizeHero from "@/app/components/RecommendedSizeHero";
import SizeComparisonTable from "@/app/components/SizeComparisonTable";
import { estimateBodyFromProfile } from "@/app/lib/bodyEstimate";
import { FitVerdict } from "@/app/lib/sizeMatch";
import {
  buildComparisonRows,
  buildSilhouetteMeasurements,
  detectProductCategory,
  formatBodyMeasurementItems,
  formatProfileSubtitle,
  getSizeLabels,
  recommendSizeFromChart
} from "@/app/lib/resultBuilder";
import { loadSession, updateSessionManualSizeText } from "@/app/lib/storage";
import { BodyEstimationResult, ProductInfo } from "@/app/lib/types";

const LEGEND: { verdict: FitVerdict; description: string }[] = [
  { verdict: "TIGHT", description: "신체 > 옷 (둘레 환산 후)" },
  { verdict: "FIT", description: "차이 0~3cm" },
  { verdict: "REGULAR", description: "차이 3~6cm" },
  { verdict: "LOOSE", description: "차이 6cm 초과" }
];

const DEMO_BODY_ESTIMATION: BodyEstimationResult = {
  estimated: {
    shoulderWidthCm: 44,
    chestCircumferenceCm: 97,
    waistCircumferenceCm: 80,
    thighCircumferenceCm: 55,
    hipCircumferenceCm: 92,
    totalLengthCm: 67,
    sleeveLengthCm: 58
  },
  confidence: "high",
  note: "데모 데이터 (실제 측정값 기반)"
};

export default function ResultPage() {
  const router = useRouter();
  const [estimation, setEstimation] = useState<BodyEstimationResult | null>(null);
  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [subtitle, setSubtitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [parseError, setParseError] = useState<string | null>(null);
  const [manualSizeText, setManualSizeText] = useState("");
  const [retrying, setRetrying] = useState(false);
  const [heightCm, setHeightCm] = useState<number | undefined>(undefined);

  const fetchProduct = useCallback(async (url: string, manual?: string) => {
    const res = await fetch("/api/crawl", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, manualSizeText: manual })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error ?? "사이즈표 파싱 실패");
    }
    return json.data as ProductInfo;
  }, []);

  useEffect(() => {
    const session = loadSession();
    if (!session) {
      router.replace("/body");
      return;
    }

    setSubtitle(formatProfileSubtitle(session.profile));
    setHeightCm(session.profile.heightCm);
    setManualSizeText(session.manualSizeText ?? "");

    const resolveBodyEstimation = async (): Promise<BodyEstimationResult> => {
      if (session.isDemoMode) {
        return DEMO_BODY_ESTIMATION;
      }

      if (session.fullBodyImageBase64) {
        try {
          const res = await fetch("/api/body-estimate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              heightCm: session.profile.heightCm,
              weightKg: session.profile.weightKg,
              gender: session.profile.gender,
              fullBodyImageBase64: session.fullBodyImageBase64,
              referenceObjectType: session.referenceObjectType
            })
          });
          const json = await res.json();
          if (res.ok && json.success) {
            return json.data as BodyEstimationResult;
          }
        } catch {
          // fall through to profile fallback
        }
      }

      return estimateBodyFromProfile(session.profile);
    };

    void resolveBodyEstimation().then(setEstimation);

    fetchProduct(session.productUrl, session.manualSizeText)
      .then(setProduct)
      .catch((err) => {
        setParseError(err instanceof Error ? err.message : "사이즈표를 불러오지 못했습니다.");
      })
      .finally(() => setLoading(false));
  }, [router, fetchProduct]);

  const recommendedSize = useMemo(
    () => (estimation && product ? recommendSizeFromChart(estimation.estimated, product, { heightCm }) : null),
    [estimation, product, heightCm]
  );

  const comparisonRows = useMemo(
    () => (estimation && product ? buildComparisonRows(estimation.estimated, product, { heightCm }) : []),
    [estimation, product, heightCm]
  );

  const silhouetteData = useMemo(
    () =>
      estimation && product && recommendedSize
        ? buildSilhouetteMeasurements(estimation.estimated, product, recommendedSize, { heightCm })
        : { category: "top" as const, measurements: [] },
    [estimation, product, recommendedSize, heightCm]
  );

  const productImageUrls = useMemo(() => {
    if (!product) return [];
    if (product.productImageUrls?.length) return product.productImageUrls;
    if (product.modelImageUrl) return [product.modelImageUrl];
    return [];
  }, [product]);

  const onManualSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!manualSizeText.trim()) return;

    const session = loadSession();
    if (!session) {
      router.replace("/body");
      return;
    }

    try {
      setRetrying(true);
      setParseError(null);
      updateSessionManualSizeText(manualSizeText);
      const parsed = await fetchProduct(session.productUrl, manualSizeText);
      setProduct(parsed);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "수동 입력 파싱 실패");
    } finally {
      setRetrying(false);
    }
  };

  if (!estimation) return null;

  const measurements = formatBodyMeasurementItems(estimation.estimated);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">핏 분석 결과</h1>
          <p className="mt-1 text-sm text-slate-600">
            {product ? `${product.productName} · ${product.parsingSource} 파싱` : "사이즈표 로딩 중..."}
          </p>
        </div>
        <Link
          href="/body"
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          ← 다시 입력
        </Link>
      </header>

      {productImageUrls.length > 0 ? (
        <ProductImageGallery imageUrls={productImageUrls} productName={product?.productName ?? "상품"} />
      ) : null}

      {product ? <OutfitShotLinks productName={product.productName} /> : null}

      <BodyMeasurementSummaryCard subtitle={subtitle} measurements={measurements} />

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-600">
          상품 페이지에서 사이즈표를 분석하고 있습니다...
        </div>
      ) : null}

      {parseError && !product ? (
        <section className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-medium text-amber-900">{parseError}</p>
          <p className="text-sm text-amber-800">
            사이즈표를 직접 입력해주세요. 형식: 사이즈,어깨,가슴,총장[,허리][,소매]
          </p>
          <form onSubmit={onManualSubmit} className="space-y-3">
            <textarea
              value={manualSizeText}
              onChange={(e) => setManualSizeText(e.target.value)}
              rows={5}
              className="w-full rounded-md border border-amber-300 bg-white px-3 py-2 text-sm"
              placeholder={"M,46,105,69\nL,48,110,71"}
            />
            <button
              type="submit"
              disabled={retrying}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {retrying ? "분석 중..." : "수동 입력으로 분석"}
            </button>
          </form>
        </section>
      ) : null}

      {product && recommendedSize ? (
        <>
          <section className="grid gap-4 lg:grid-cols-2">
            <BodySilhouetteViewer
              category={silhouetteData.category}
              measurements={silhouetteData.measurements}
            />
            <RecommendedSizeHero
              sizeLabel={recommendedSize}
              description={`${product.productName} 기준 ${recommendedSize} 사이즈가 가장 균형 잡힙니다. ${estimation.note}`}
            />
          </section>

          <SizeComparisonTable
            sizeLabels={getSizeLabels(product)}
            rows={comparisonRows}
            hemPosition={estimation.hemPosition}
            description={`부위별 핏 판정 · ${detectProductCategory(product) === "top" ? "상의" : "하의"} (모드맨 단면×2 적용)`}
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
        </>
      ) : null}
    </main>
  );
}
