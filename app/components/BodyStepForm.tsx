"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Gender, ReferenceObjectSpec, ReferenceObjectType } from "@/app/lib/types";
import { saveBodyEstimation, saveBodyProfile } from "@/app/lib/storage";

const OBJECTS: ReferenceObjectSpec[] = [
  { type: "bottle500", label: "500ml 페트병", dimensionsMm: "높이 200mm / 지름 65mm" },
  { type: "a4", label: "A4 용지", dimensionsMm: "210 x 297mm" },
  { type: "card", label: "신용카드", dimensionsMm: "85.6 x 54mm" }
];

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function BodyStepForm() {
  const router = useRouter();
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(70);
  const [gender, setGender] = useState<Gender>("male");
  const [fullBodyFile, setFullBodyFile] = useState<File | null>(null);
  const [referenceType, setReferenceType] = useState<ReferenceObjectType | undefined>();
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedLabel = useMemo(
    () => OBJECTS.find((x) => x.type === referenceType)?.label ?? "선택 안 함",
    [referenceType]
  );

  const onFile = (setter: (file: File | null) => void) => (e: ChangeEvent<HTMLInputElement>) => {
    setter(e.target.files?.[0] ?? null);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (referenceType && !referenceFile) {
      setError("기준 물체를 선택했다면 해당 사진도 업로드해주세요.");
      return;
    }

    try {
      setLoading(true);
      const fullBodyImageBase64 = fullBodyFile ? await toBase64(fullBodyFile) : undefined;
      const referenceImageBase64 = referenceFile ? await toBase64(referenceFile) : undefined;
      const res = await fetch("/api/body-estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heightCm,
          weightKg,
          gender,
          fullBodyImageBase64,
          referenceObjectType: referenceType,
          referenceImageBase64
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? "신체 추정 실패");

      saveBodyProfile({ heightCm, weightKg, gender });
      saveBodyEstimation(json.data);
      router.push("/body/result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl bg-white p-5 shadow-sm">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">STEP 1. 신체 정보 입력</h2>
        <p className="text-sm text-slate-600">
          성별, 키, 몸무게를 입력하면 한국 성인 평균 체형 비율로 치수를 추정합니다. (사진은 선택)
        </p>
      </div>

      <label className="block space-y-1 text-sm">
        <span className="font-medium">전신 사진 업로드 (선택)</span>
        <input type="file" accept="image/*" onChange={onFile(setFullBodyFile)} className="w-full text-sm" />
      </label>

      <div className="space-y-2">
        <span className="text-sm font-medium">기준 물체 선택 (선택)</span>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {OBJECTS.map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => setReferenceType(item.type)}
              className={`rounded-xl border p-3 text-left text-sm ${
                referenceType === item.type ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200"
              }`}
            >
              <p className="font-semibold">{item.label}</p>
              <p className="text-xs opacity-80">{item.dimensionsMm}</p>
            </button>
          ))}
        </div>
      </div>

      <label className="block space-y-1 text-sm">
        <span className="font-medium">기준 물체 사진 업로드 ({selectedLabel})</span>
        <input type="file" accept="image/*" onChange={onFile(setReferenceFile)} className="w-full text-sm" />
      </label>

      <div className="space-y-2">
        <span className="text-sm font-medium">성별</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setGender("male")}
            className={`rounded-xl border px-3 py-2 text-sm font-medium ${
              gender === "male" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200"
            }`}
          >
            남성
          </button>
          <button
            type="button"
            onClick={() => setGender("female")}
            className={`rounded-xl border px-3 py-2 text-sm font-medium ${
              gender === "female" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200"
            }`}
          >
            여성
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1 text-sm">
          <span className="font-medium">키 (cm)</span>
          <input
            type="number"
            value={heightCm}
            onChange={(e) => setHeightCm(Number(e.target.value))}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">몸무게 (kg)</span>
          <input
            type="number"
            value={weightKg}
            onChange={(e) => setWeightKg(Number(e.target.value))}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "신체 치수 추정 중..." : "다음 단계로"}
      </button>
    </form>
  );
}
