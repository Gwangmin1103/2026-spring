"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { saveNamedFullBodyPhoto } from "@/app/lib/namedProfileStorage";
import { compressImageToBase64 } from "@/app/lib/imageCompress";
import { StoredProfile } from "@/app/lib/storage";

type FullBodyPhotoFieldProps = {
  profileName?: string;
  profileSnapshot?: StoredProfile;
  prefillFullBodyImageBase64?: string;
  onFileChange: (file: File | null) => void;
  onLoadedBase64Change: (base64: string | undefined) => void;
};

export default function FullBodyPhotoField({
  profileName = "",
  profileSnapshot,
  prefillFullBodyImageBase64,
  onFileChange,
  onLoadedBase64Change
}: FullBodyPhotoFieldProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasLoadedPhoto, setHasLoadedPhoto] = useState(false);

  useEffect(() => {
    if (!prefillFullBodyImageBase64) return;

    setPreviewUrl(`data:image/jpeg;base64,${prefillFullBodyImageBase64}`);
    setHasLoadedPhoto(true);
    onLoadedBase64Change(prefillFullBodyImageBase64);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- prefill only
  }, [prefillFullBodyImageBase64]);

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onFileChange(file);
    setHasLoadedPhoto(false);
    onLoadedBase64Change(undefined);

    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const base64 = await compressImageToBase64(file);
    setPreviewUrl(`data:image/jpeg;base64,${base64}`);
    onLoadedBase64Change(base64);

    if (profileName.trim()) {
      saveNamedFullBodyPhoto(profileName, base64, profileSnapshot);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block space-y-1 text-sm">
        <span className="font-medium">
          전신 사진 업로드 (선택)
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="w-full text-sm"
        />
      </label>

      {previewUrl ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="mb-2 text-xs font-medium text-slate-500">전신 사진 미리보기</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="전신 사진 미리보기" className="mx-auto max-h-80 rounded-lg object-contain" />
        </div>
      ) : null}
    </div>
  );
}
