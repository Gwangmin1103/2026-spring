import { NextRequest, NextResponse } from "next/server";
import { estimateBodyFromProfile } from "@/app/lib/bodyEstimate";
import { estimateBodyFromPhotos } from "@/app/lib/claude";
import { BodyProfileInput, Gender } from "@/app/lib/types";

function parseGender(value: unknown): Gender | null {
  if (value === "male" || value === "female") return value;
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as BodyProfileInput;
    const heightCm = Number(payload.heightCm);
    const weightKg = Number(payload.weightKg);
    const gender = parseGender(payload.gender);

    if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
      return NextResponse.json({ error: "유효한 키와 몸무게를 입력해주세요." }, { status: 400 });
    }

    if (!gender) {
      return NextResponse.json({ error: "성별(남/여)을 선택해주세요." }, { status: 400 });
    }

    const profileInput: BodyProfileInput = {
      heightCm,
      weightKg,
      gender,
      fullBodyImageBase64: payload.fullBodyImageBase64,
      referenceObjectType: payload.referenceObjectType,
      referenceImageBase64: payload.referenceImageBase64
    };

    const result = payload.fullBodyImageBase64
      ? await estimateBodyFromPhotos(profileInput)
      : estimateBodyFromProfile({ heightCm, weightKg, gender });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { error: "신체 추정 중 오류가 발생했습니다.", detail: String(error) },
      { status: 500 }
    );
  }
}
