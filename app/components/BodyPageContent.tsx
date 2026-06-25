"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BodyNameProfileBar from "@/app/components/BodyNameProfileBar";
import BodyStepForm from "@/app/components/BodyStepForm";
import { loadNamedProfile } from "@/app/lib/namedProfileStorage";
import { saveSession, StoredProfile } from "@/app/lib/storage";

const DEMO_PRODUCT_URL =
  "https://mode-man.com/product/br-26118-racing-team-jacket-black/15053/category/140/display/1/";

export default function BodyPageContent() {
  const router = useRouter();
  const [profileName, setProfileName] = useState("");
  const [loadKey, setLoadKey] = useState(0);
  const [prefillProfile, setPrefillProfile] = useState<StoredProfile | null>(null);
  const [prefillFullBodyImageBase64, setPrefillFullBodyImageBase64] = useState<string | undefined>();
  const [loadMessage, setLoadMessage] = useState<string | null>(null);

  const handleLoad = () => {
    const profile = loadNamedProfile(profileName);
    if (!profile) {
      setLoadMessage("저장된 신체 정보를 찾을 수 없습니다.");
      return;
    }

    setPrefillProfile(profile);
    setPrefillFullBodyImageBase64(profile.fullBodyImageBase64);
    setLoadKey((key) => key + 1);
    setLoadMessage(`${profileName.trim()}님의 신체 정보를 불러왔습니다.`);
  };

  const handleDemo = () => {
    saveSession({
      profile: { heightCm: 173, weightKg: 68, gender: "male" },
      fullBodyImageBase64: "",
      productUrl: DEMO_PRODUCT_URL,
      isDemoMode: true
    });
    router.push("/result");
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <button
          type="button"
          onClick={handleDemo}
          className="w-full rounded-lg border border-slate-900 bg-slate-900 px-4 py-3 text-left text-sm font-semibold text-white hover:bg-slate-800"
        >
          🎯 데모 체험하기
        </button>
        <p className="mt-2 text-center text-xs text-slate-500">173cm / 68kg 남성 · 레이싱 재킷</p>
      </section>

      <BodyNameProfileBar
        name={profileName}
        onNameChange={(name) => {
          setProfileName(name);
          setLoadMessage(null);
        }}
        onLoad={handleLoad}
        loadMessage={loadMessage}
      />
      <BodyStepForm
        key={loadKey}
        profileName={profileName}
        prefillProfile={prefillProfile ?? undefined}
        prefillFullBodyImageBase64={prefillFullBodyImageBase64}
      />
    </div>
  );
}
