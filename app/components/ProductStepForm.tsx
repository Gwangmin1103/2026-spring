"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { loadBodyEstimation, loadBodyProfile, saveAnalyzeResult, saveProductInfo } from "@/app/lib/storage";

type SizeOption = "S" | "M" | "L" | "XL";

export default function ProductStepForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [selectedSize, setSelectedSize] = useState<SizeOption>("M");
  const [manualSizeText, setManualSizeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const body = loadBodyEstimation();
    const profile = loadBodyProfile();
    if (!body || !profile) {
      setError("신체 정보가 없습니다. STEP 1부터 진행해주세요.");
      return;
    }
    if (!url.trim()) {
      setError("상품 URL을 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      const crawlRes = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, manualSizeText })
      });
      const crawlJson = await crawlRes.json();
      if (!crawlRes.ok || !crawlJson.success) throw new Error(crawlJson.error ?? "상품 파싱 실패");

      const product = crawlJson.data;
      saveProductInfo(product);

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heightCm: profile.heightCm,
          bodyEstimation: body,
          product
        })
      });
      const analyzeJson = await analyzeRes.json();
      if (!analyzeRes.ok || !analyzeJson.success) throw new Error(analyzeJson.error ?? "핏 분석 실패");

      saveAnalyzeResult({
        ...analyzeJson.data,
        preferredInputSize: selectedSize
      });
      router.push("/result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl bg-white p-5 shadow-sm">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">STEP 2. 상품 링크 입력</h2>
        <p className="text-sm text-slate-600">무신사/29CM URL로 사이즈표를 파싱하고 실패 시 수동 텍스트를 사용합니다.</p>
      </div>

      <label className="block space-y-1 text-sm">
        <span className="font-medium">상품 URL</span>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.musinsa.com/..."
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </label>

      <div className="space-y-2">
        <span className="text-sm font-medium">사이즈 선택</span>
        <div className="grid grid-cols-4 gap-2">
          {(["S", "M", "L", "XL"] as const).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSize(size)}
              className={`rounded-md border px-3 py-2 text-sm ${
                selectedSize === size ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <label className="block space-y-1 text-sm">
        <span className="font-medium">수동 사이즈표 텍스트 (fallback)</span>
        <textarea
          value={manualSizeText}
          onChange={(e) => setManualSizeText(e.target.value)}
          rows={5}
          className="w-full rounded-md border border-slate-300 px-3 py-2"
          placeholder={"예) M,46,105,69\nL,48,110,71"}
        />
      </label>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "사이즈 분석 중..." : "결과 보기"}
      </button>
    </form>
  );
}
