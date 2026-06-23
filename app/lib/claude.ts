import Anthropic from "@anthropic-ai/sdk";
import { estimateBodyFromProfile } from "./bodyEstimate";
import { BodyEstimationResult, BodyProfileInput, ProductInfo, SizeAnalysis } from "./types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

type CreateFinalFitCommentParams = {
  bodyEstimation: BodyEstimationResult;
  product: ProductInfo;
  analyses: SizeAnalysis[];
  recommendedSize: "S" | "M" | "L" | "XL";
};

export async function estimateBodyFromPhotos(input: BodyProfileInput): Promise<BodyEstimationResult> {
  if (!process.env.ANTHROPIC_API_KEY || !input.fullBodyImageBase64) {
    return estimateBodyFromProfile({
      heightCm: input.heightCm,
      weightKg: input.weightKg,
      gender: input.gender ?? "male"
    });
  }

  const content: Anthropic.Messages.MessageParam["content"] = [
    {
      type: "text",
      text: `전신 사진과 사용자 정보를 바탕으로 신체 치수를 cm 단위로 추정하세요.
반드시 JSON만 출력:
{
  "shoulderWidthCm": number,
  "chestCircumferenceCm": number,
  "waistCircumferenceCm": number,
  "thighCircumferenceCm": number,
  "hipCircumferenceCm": number,
  "totalLengthCm": number,
  "sleeveLengthCm": number,
  "confidence": "low" | "medium" | "high",
  "note": "string"
}
키: ${input.heightCm}cm
몸무게: ${input.weightKg}kg
기준 물체: ${input.referenceObjectType ?? "없음"}`
    },
    {
      type: "image",
      source: {
        type: "base64",
        media_type: "image/jpeg",
        data: input.fullBodyImageBase64
      }
    }
  ];

  if (input.referenceImageBase64) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: "image/jpeg",
        data: input.referenceImageBase64
      }
    });
  }

  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 500,
    messages: [{ role: "user", content }]
  });

  const first = response.content[0];
  if (!first || first.type !== "text") throw new Error("Vision 응답 파싱 실패");
  const parsed = JSON.parse(first.text) as {
    shoulderWidthCm: number;
    chestCircumferenceCm: number;
    waistCircumferenceCm: number;
    thighCircumferenceCm: number;
    hipCircumferenceCm: number;
    totalLengthCm: number;
    sleeveLengthCm: number;
    confidence: "low" | "medium" | "high";
    note: string;
  };

  return {
    estimated: {
      shoulderWidthCm: parsed.shoulderWidthCm,
      chestCircumferenceCm: parsed.chestCircumferenceCm,
      waistCircumferenceCm: parsed.waistCircumferenceCm,
      thighCircumferenceCm: parsed.thighCircumferenceCm,
      hipCircumferenceCm: parsed.hipCircumferenceCm,
      totalLengthCm: parsed.totalLengthCm,
      sleeveLengthCm: parsed.sleeveLengthCm
    },
    confidence: parsed.confidence,
    note: parsed.note
  };
}

export async function createFinalFitComment({
  bodyEstimation,
  product,
  analyses,
  recommendedSize
}: CreateFinalFitCommentParams): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return `${recommendedSize} 사이즈를 추천합니다. 어깨와 가슴 중심으로 밸런스가 가장 좋고 총장도 안정적입니다.`;
  }

  const prompt = `
너는 패션 핏 분석가야.
다음 정보를 바탕으로 추천 사이즈를 포함한 2~3문장 코멘트를 한국어로 작성해줘.
문장은 간결하고 구매 결정에 도움이 되어야 해.

[신체 추정]
${JSON.stringify(bodyEstimation, null, 2)}

[상품 스펙]
${JSON.stringify(product, null, 2)}

[사이즈별 분석]
${JSON.stringify(analyses, null, 2)}

[최종 추천]
${recommendedSize}
`;

  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }]
  });

  const first = response.content[0];
  if (first && first.type === "text") return first.text;
  return "핏 분석 문장을 생성하지 못했습니다.";
}
