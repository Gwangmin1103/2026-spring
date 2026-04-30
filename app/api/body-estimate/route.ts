import { NextRequest, NextResponse } from "next/server";
import { estimateBodyFromPhotos } from "@/app/lib/claude";
import { BodyProfileInput } from "@/app/lib/types";

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as BodyProfileInput;
    if (!payload.fullBodyImageBase64 || !payload.heightCm || !payload.weightKg) {
      return NextResponse.json({ error: "전신 사진, 키, 몸무게는 필수입니다." }, { status: 400 });
    }

    const result = await estimateBodyFromPhotos(payload);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { error: "신체 추정 중 오류가 발생했습니다.", detail: String(error) },
      { status: 500 }
    );
  }
}
