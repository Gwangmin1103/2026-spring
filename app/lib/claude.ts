import Anthropic from "@anthropic-ai/sdk";
import { estimateBodyFromProfile } from "./bodyEstimate";
import { BodyEstimationResult, BodyProfileInput, ProductInfo, ProductSizeRow, SizeAnalysis } from "./types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

type CreateFinalFitCommentParams = {
  bodyEstimation: BodyEstimationResult;
  product: ProductInfo;
  analyses: SizeAnalysis[];
  recommendedSize: string;
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

type ClaudeSizeChartResponse = {
  productName?: string;
  platform?: string;
  sizeTable: Array<{
    size: string;
    shoulderWidthCm?: number;
    chestCircumferenceCm?: number;
    waistCircumferenceCm?: number;
    hipCircumferenceCm?: number;
    thighCircumferenceCm?: number;
    sleeveLengthCm?: number;
    totalLengthCm?: number;
  }>;
};

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced?.[1]) return fenced[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) return text.slice(start, end + 1);
  return text.trim();
}

function normalizeSizeRows(rows: ClaudeSizeChartResponse["sizeTable"]): ProductSizeRow[] {
  const result: ProductSizeRow[] = [];
  for (const row of rows) {
    const shoulder = row.shoulderWidthCm;
    const chest = row.chestCircumferenceCm;
    const totalLength = row.totalLengthCm;
    if (shoulder === undefined || chest === undefined || totalLength === undefined) continue;
    result.push({
      size: String(row.size).trim(),
      shoulderWidthCm: shoulder,
      chestCircumferenceCm: chest,
      waistCircumferenceCm: row.waistCircumferenceCm,
      hipCircumferenceCm: row.hipCircumferenceCm,
      thighCircumferenceCm: row.thighCircumferenceCm,
      sleeveLengthCm: row.sleeveLengthCm,
      totalLengthCm: totalLength
    });
  }
  return result;
}

export async function parseSizeChartWithClaude(
  url: string,
  html: string,
  productName: string
): Promise<ProductInfo | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  const truncatedHtml = html.slice(0, 120_000);
  const prompt = `다음은 쇼핑몰 상품 페이지 HTML입니다. 사이즈표(실측)를 찾아 JSON만 출력하세요.

URL: ${url}

반드시 아래 형식:
{
  "productName": "상품명",
  "platform": "쇼핑몰명",
  "sizeTable": [
    {
      "size": "M",
      "shoulderWidthCm": 46,
      "chestCircumferenceCm": 105,
      "waistCircumferenceCm": 80,
      "sleeveLengthCm": 60,
      "totalLengthCm": 69
    }
  ]
}

규칙:
- cm 단위 숫자만 사용
- size는 페이지에 표시된 사이즈 라벨 그대로 (S, M, L, 95, FREE 등)
- 어깨/가슴/총장은 가능하면 반드시 포함
- 사이즈표를 찾을 수 없으면 sizeTable을 빈 배열로

HTML:
${truncatedHtml}`;

  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }]
  });

  const first = response.content[0];
  if (!first || first.type !== "text") return null;

  try {
    const parsed = JSON.parse(extractJson(first.text)) as ClaudeSizeChartResponse;
    const sizeTable = normalizeSizeRows(parsed.sizeTable ?? []);
    if (sizeTable.length === 0) return null;

    return {
      platform: parsed.platform ?? "unknown",
      url,
      productName: parsed.productName ?? productName,
      sizeTable,
      parsingSource: "ai"
    };
  } catch {
    return null;
  }
}
