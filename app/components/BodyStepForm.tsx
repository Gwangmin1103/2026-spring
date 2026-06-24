"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { saveNamedProfile } from "@/app/lib/namedProfileStorage";
import FullBodyPhotoField from "@/app/components/FullBodyPhotoField";
import { Gender, ReferenceObjectSpec, ReferenceObjectType } from "@/app/lib/types";
import { saveSession, StoredProfile } from "@/app/lib/storage";

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

export default function BodyStepForm({
  profileName = "",
  prefillProfile,
  prefillFullBodyImageBase64
}: {
  profileName?: string;
  prefillProfile?: StoredProfile;
  prefillFullBodyImageBase64?: string;
}) {
  const router = useRouter();
  const [heightCm, setHeightCm] = useState(prefillProfile?.heightCm ?? 175);
  const [weightKg, setWeightKg] = useState(prefillProfile?.weightKg ?? 70);
  const [gender, setGender] = useState<Gender>(prefillProfile?.gender ?? "male");
  const [fullBodyFile, setFullBodyFile] = useState<File | null>(null);
  const [loadedFullBodyBase64, setLoadedFullBodyBase64] = useState<string | undefined>();
  const [referenceType, setReferenceType] = useState<ReferenceObjectType | undefined>();
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [productUrl, setProductUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!prefillProfile) return;
    setHeightCm(prefillProfile.heightCm);
    setWeightKg(prefillProfile.weightKg);
    setGender(prefillProfile.gender);
  }, [prefillProfile]);

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

    if (!fullBodyFile && !loadedFullBodyBase64) {
      setError("전신 사진을 업로드해주세요.");
      return;
    }
    if (!productUrl.trim()) {
      setError("상품 URL을 입력해주세요.");
      return;
    }
    if (referenceType && !referenceFile) {
      setError("기준 물체를 선택했다면 해당 사진도 업로드해주세요.");
      return;
    }

    try {
      setLoading(true);
      const fullBodyImageBase64 = fullBodyFile ? await toBase64(fullBodyFile) : loadedFullBodyBase64!;
      const referenceImageBase64 = referenceFile ? await toBase64(referenceFile) : undefined;

      saveSession({
        profile: { heightCm, weightKg, gender },
        fullBodyImageBase64,
        referenceObjectType: referenceType,
        referenceImageBase64,
        productUrl: productUrl.trim()
      });
      saveNamedProfile(profileName, { heightCm, weightKg, gender, fullBodyImageBase64 });
      router.push("/result");
    } catch {
      setError("데이터 저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-5 rounded-2xl bg-white p-5 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">내 신체 정보</h2>
            <p className="text-sm text-slate-600">전신 사진과 기본 정보를 입력하세요.</p>
          </div>

          <FullBodyPhotoField
            profileName={profileName}
            profileSnapshot={{ heightCm, weightKg, gender }}
            prefillFullBodyImageBase64={prefillFullBodyImageBase64}
            onFileChange={setFullBodyFile}
            onLoadedBase64Change={setLoadedFullBodyBase64}
          />

          <div className="space-y-2">
            <span className="text-sm font-medium">기준 물체 선택 (선택)</span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {OBJECTS.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setReferenceType(referenceType === item.type ? undefined : item.type)}
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
        </section>

        <section className="space-y-5 rounded-2xl bg-white p-5 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">상품 링크</h2>
            <p className="text-sm text-slate-600">어떤 쇼핑몰이든 상품 URL을 입력하세요.</p>
          </div>

          <label className="block space-y-1 text-sm">
            <span className="font-medium">
              상품 URL <span className="text-rose-500">*</span>
            </span>
            <input
              type="url"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              placeholder="https://..."
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>

          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
            <p className="font-medium text-slate-800">분석 시 진행 순서</p>
            <ol className="mt-2 list-inside list-decimal space-y-1">
              <li>키·몸무게·성별로 신체 치수 추정</li>
              <li>상품 페이지에서 사이즈표 파싱</li>
              <li>부위별 TIGHT / FIT / REGULAR / LOOSE 판정</li>
            </ol>
          </div>
        </section>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "저장 중..." : "핏 분석하기"}
      </button>
    </form>
  );
}
