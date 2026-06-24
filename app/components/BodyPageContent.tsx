"use client";

import { useState } from "react";
import BodyNameProfileBar from "@/app/components/BodyNameProfileBar";
import BodyStepForm from "@/app/components/BodyStepForm";
import { loadNamedProfile } from "@/app/lib/namedProfileStorage";
import { StoredProfile } from "@/app/lib/storage";

export default function BodyPageContent() {
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

  return (
    <div className="space-y-5">
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
