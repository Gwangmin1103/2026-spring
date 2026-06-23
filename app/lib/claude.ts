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
  category?: "top" | "bottom";
  measurementFields?: string[];
  productName?: string;
  platform?: string;
  sizeTable: Array<{
    size: string;
    shoulderWidthCm?: number;
    chestCircumferenceCm?: number;
    armholeCm?: number;
    waistCircumferenceCm?: number;
    hipCircumferenceCm?: number;
    thighCircumferenceCm?: number;
    legOpeningCm?: number;
    frontRiseCm?: number;
    rearRiseCm?: number;
    sleeveLengthCm?: number;
    totalLengthCm?: number;
  }>;
};

function inferFieldsFromRow(row: ClaudeSizeChartResponse["sizeTable"][number]): string[] {
  const fields: string[] = [];
  if (row.shoulderWidthCm !== undefined) fields.push("shoulder");
  if (row.chestCircumferenceCm !== undefined) fields.push("chest");
  if (row.armholeCm !== undefined) fields.push("armhole");
  if (row.sleeveLengthCm !== undefined) fields.push("sleeve");
  if (row.waistCircumferenceCm !== undefined) fields.push("waist");
  if (row.thighCircumferenceCm !== undefined) fields.push("thigh");
  if (row.legOpeningCm !== undefined) fields.push("legOpening");
  if (row.frontRiseCm !== undefined) fields.push("frontRise");
  if (row.rearRiseCm !== undefined) fields.push("rearRise");
  if (row.totalLengthCm !== undefined) fields.push("length");
  return fields;
}

function normalizeSizeRows(rows: ClaudeSizeChartResponse["sizeTable"]): ProductSizeRow[] {
  const result: ProductSizeRow[] = [];
  for (const row of rows) {
    const totalLength = row.totalLengthCm;
    if (totalLength === undefined) continue;

    const hasTop = row.shoulderWidthCm !== undefined || row.chestCircumferenceCm !== undefined || row.sleeveLengthCm !== undefined;
    const hasBottom =
      row.waistCircumferenceCm !== undefined ||
      row.thighCircumferenceCm !== undefined ||
      row.legOpeningCm !== undefined ||
      row.frontRiseCm !== undefined ||
      row.rearRiseCm !== undefined;

    if (!hasTop && !hasBottom) continue;

    result.push({
      size: String(row.size).trim(),
      shoulderWidthCm: row.shoulderWidthCm,
      chestCircumferenceCm: row.chestCircumferenceCm,
      armholeCm: row.armholeCm,
      waistCircumferenceCm: row.waistCircumferenceCm,
      hipCircumferenceCm: row.hipCircumferenceCm,
      thighCircumferenceCm: row.thighCircumferenceCm,
      legOpeningCm: row.legOpeningCm,
      frontRiseCm: row.frontRiseCm,
      rearRiseCm: row.rearRiseCm,
      sleeveLengthCm: row.sleeveLengthCm,
      totalLengthCm: totalLength
    });
  }
  return result;
}

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced?.[1]) return fenced[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) return text.slice(start, end + 1);
  return text.trim();
}

export async function parseSizeChartWithClaude(
  url: string,
  html: string,
  productName: string
): Promise<ProductInfo | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  const truncatedHtml = html.slice(0, 120_000);
  const prompt = `다음은 모드맨(Modoodman) 쇼핑몰 상품 페이지 HTML입니다. 사이즈표(단면 실측)를 찾아 JSON만 출력하세요.

URL: ${url}

모드맨은 옷을 바닥에 펼쳐 단면으로 재는 방식입니다. 표에 적힌 숫자는 단면 cm 값입니다.

반드시 아래 형식:
{
  "category": "top" | "bottom",
  "measurementFields": ["shoulder", "chest", ...],
  "productName": "상품명",
  "platform": "modoodman",
  "sizeTable": [
    {
      "size": "M",
      "shoulderWidthCm": 46,
      "chestCircumferenceCm": 52.5,
      "armholeCm": 24,
      "sleeveLengthCm": 60,
      "totalLengthCm": 69
    }
  ]
}

상의(top) 가능 항목: shoulderWidthCm, chestCircumferenceCm, armholeCm, sleeveLengthCm, totalLengthCm
하의(bottom) 가능 항목: waistCircumferenceCm, thighCircumferenceCm, legOpeningCm, frontRiseCm, rearRiseCm, totalLengthCm

규칙:
- cm 단위 숫자만, 단면 실측값 그대로 (×2 하지 말 것)
- category는 사이즈표 항목으로 판별 (어깨/가슴/소매 → top, 허리/허벅지/밑단/밑위 → bottom)
- measurementFields에는 실제로 파싱된 항목 키 나열
- totalLengthCm은 가능하면 포함
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
      platform: parsed.platform ?? "modoodman",
      url,
      productName: parsed.productName ?? productName,
      sizeTable,
      parsingSource: "ai",
      category: parsed.category,
      measurementFields: parsed.measurementFields ?? inferFieldsFromRow(parsed.sizeTable?.[0] ?? {})
    };
  } catch {
    return null;
  }
}
