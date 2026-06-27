import Anthropic from "@anthropic-ai/sdk";
import { estimateBodyFromProfile } from "./bodyEstimate";
import { extractModoodmanProductMetaFromPage } from "./productMeta";
import { BodyEstimationResult, BodyProfileInput, ProductInfo, ProductSizeRow, SizeAnalysis } from "./types";

function getAnthropicClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}

type CreateFinalFitCommentParams = {
  bodyEstimation: BodyEstimationResult;
  product: ProductInfo;
  analyses: SizeAnalysis[];
  recommendedSize: string;
};

export async function estimateBodyFromPhotos(input: BodyProfileInput): Promise<BodyEstimationResult> {
  const profileFallback = () =>
    estimateBodyFromProfile({
      heightCm: input.heightCm,
      weightKg: input.weightKg,
      gender: input.gender ?? "male"
    });

  if (!process.env.ANTHROPIC_API_KEY || !input.fullBodyImageBase64) {
    return profileFallback();
  }

  const anthropic = getAnthropicClient();
  if (!anthropic) return profileFallback();

  const content: Anthropic.Messages.MessageParam["content"] = [
    {
      type: "text",
      text: `당신은 신체 치수 측정 전문가입니다. 아래 단계를 순서대로 수행하세요.

[사용자 정보]
- 키: ${input.heightCm}cm
- 몸무게: ${input.weightKg}kg
- 기준 물체: ${input.referenceObjectType ?? "없음"}

[기준 물체 실제 크기]
- bottle500(500ml 페트병): 높이 200mm, 지름 65mm
- a4(A4 용지): 210mm × 297mm
- card(신용카드): 85.6mm × 54mm

[추정 절차 - 반드시 이 순서로 수행]
STEP 1. 사진에서 기준 물체를 찾아 픽셀 높이를 파악하세요.
STEP 2. 기준 물체와 사람 신체의 원근감 차이를 판단하세요. 기준 물체가 카메라에 더 가까이 있으면 실제보다 크게 보이므로, 사람 신체와 같은 평면에 있다고 가정했을 때의 보정 비율을 계산하세요.
STEP 3. 보정된 기준 물체 픽셀 크기와 실제 크기(mm)로 1픽셀 = 몇 mm인지 계산하세요.
STEP 4. 그 비율로 어깨너비(양쪽 어깨 끝 사이 픽셀 → cm)를 계산하세요.
STEP 5. 정면 가슴 너비 픽셀을 측정하고, 둘레는 너비 × π × 0.8로 추정하세요.
STEP 6. 허리 가장 좁은 부분 너비 픽셀을 측정하고 같은 방식으로 둘레를 추정하세요.
STEP 7. 허벅지 한쪽 너비 픽셀을 측정하고 둘레를 추정하세요.
STEP 8. 키 ${input.heightCm}cm와 전체 신체 픽셀 높이를 비교해서 비율을 검증하고, 앞선 계산값과 크게 차이나면 보정하세요.
STEP 9. 어깨 끝에서 손목까지 픽셀로 소매 길이를 추정하세요. 소매 길이가 30cm 미만으로 추정되면 측정 오류이므로 키/몸무게 비율로 재보정하세요. 소매가 명백히 반팔인 경우에만 30cm 이하로 추정하세요.
STEP 10. 어깨에서 옷 밑단까지 총장을 추정하세요. 총장은 키와 절대 혼동하지 마세요. 상의 기준 55~75cm, 아우터 기준 70~110cm.
STEP 11. 옷이나 포즈로 가려진 부위는 키/몸무게 비율로 보완하세요.
STEP 12 (기장 위치 판단): 사진 속 사람의 체형을 보고, 이 옷의 총장(totalLengthCm)이 착용 시 신체 어느 위치까지 올지 판단하세요. 반드시 아래 중 하나로만 답하세요: 허리 위 / 허리~골반 / 골반 / 엉덩이 중간 / 엉덩이 아래

[출력 형식 - JSON만 출력, 다른 텍스트 없음]
{
  "shoulderWidthCm": number,
  "chestCircumferenceCm": number,
  "waistCircumferenceCm": number,
  "thighCircumferenceCm": number,
  "hipCircumferenceCm": number,
  "totalLengthCm": number,
  "sleeveLengthCm": number,
  "hemPosition": "허리 위" | "허리~골반" | "골반" | "엉덩이 중간" | "엉덩이 아래",
  "confidence": "low" | "medium" | "high",
  "note": "추정 과정 요약 (2줄 이내)"
}`
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

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      messages: [{ role: "user", content }]
    });

    const first = response.content[0];
    if (!first || first.type !== "text") return profileFallback();
    console.log("Claude 응답:", first.text);
    const parsed = JSON.parse(extractJson(first.text)) as {
      shoulderWidthCm: number;
      chestCircumferenceCm: number;
      waistCircumferenceCm: number;
      thighCircumferenceCm: number;
      hipCircumferenceCm: number;
      totalLengthCm: number;
      sleeveLengthCm: number;
      hemPosition?: string;
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
      note: parsed.note,
      ...(parsed.hemPosition ? { hemPosition: parsed.hemPosition as BodyEstimationResult["hemPosition"] } : {})
    };
  } catch (error) {
    console.error("estimateBodyFromPhotos 실패:", error);
    return profileFallback();
  }
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

  const anthropic = getAnthropicClient();
  if (!anthropic) {
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

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }]
    });

    const first = response.content[0];
    if (first && first.type === "text") return first.text;
  } catch {
    // fall through to default comment
  }

  return `${recommendedSize} 사이즈를 추천합니다. 어깨와 가슴 중심으로 밸런스가 가장 좋고 총장도 안정적입니다.`;
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

const MIN_TOTAL_LENGTH_CM = 45;

function sanitizeTotalLengthCm(value: number | undefined): number | undefined {
  if (value === undefined || Number.isNaN(value)) return undefined;
  if (value < MIN_TOTAL_LENGTH_CM) return undefined;
  return value;
}

function normalizeSizeRows(rows: ClaudeSizeChartResponse["sizeTable"]): ProductSizeRow[] {
  const result: ProductSizeRow[] = [];
  for (const row of rows) {
    const totalLength = sanitizeTotalLengthCm(row.totalLengthCm);

    const hasTop = row.shoulderWidthCm !== undefined || row.chestCircumferenceCm !== undefined || row.sleeveLengthCm !== undefined;
    const hasBottom =
      row.waistCircumferenceCm !== undefined ||
      row.thighCircumferenceCm !== undefined ||
      row.legOpeningCm !== undefined ||
      row.frontRiseCm !== undefined ||
      row.rearRiseCm !== undefined;

    if (!hasTop && !hasBottom) continue;

    const normalizedRow = {
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
      ...(totalLength !== undefined ? { totalLengthCm: totalLength } : {})
    };

    result.push(normalizedRow as ProductSizeRow);
  }
  return result;
}

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced?.[1] ? fenced[1].trim() : text.trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start >= 0 && end > start) return candidate.slice(start, end + 1);
  return candidate;
}

export async function extractModoodmanProductMeta(
  url: string,
  html: string,
  fallbackName: string
): Promise<{ productName?: string; modelImageUrl?: string; productImageUrls?: string[] }> {
  return extractModoodmanProductMetaFromPage(url, html, fallbackName);
}

export async function parseSizeChartWithClaude(
  url: string,
  html: string,
  productName: string
): Promise<ProductInfo | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  const anthropic = getAnthropicClient();
  if (!anthropic) return null;

  const truncatedHtml = html.slice(0, 120_000);
  const prompt = `다음은 모드맨(Modoodman) 쇼핑몰 상품 페이지 HTML입니다. 사이즈표를 찾아 JSON만 출력하세요.

URL: ${url}

모드맨 측정 방식 (반드시 구분):
1. 단면 실측 (바닥에 펼쳐 반쪽만 잰 값): 어깨, 가슴(Chest), 암홀, 허리, 허벅지, 밑단 등 → 표 숫자 그대로 입력 (×2 하지 말 것)
2. 전체 길이 (단면 아님): totalLengthCm(총장/Length/Outseam Length), sleeveLengthCm(소매/팔길이) → 표 숫자 그대로 입력, ×2 또는 ÷2 절대 금지

totalLengthCm(총장) 상세 규칙:
- 총장(Length, 총장, Outseam Length)은 옷을 세워서 잰 전체 길이이며, 단면 실측이 아님 → 절대 ×2 또는 ÷2 하지 말 것
- 상의: 보통 50~85cm / 코트·아우터: 최대 120cm / 바지(하의): 90~120cm 범위
- "총장", "Length", "Outseam Length" 열의 값만 totalLengthCm에 사용
- "어깨+소매", "암홀", "가슴", "허벅지" 등 다른 열 값을 totalLengthCm에 넣지 말 것
- 45cm 미만(예: 26cm)은 총장이 아니므로 totalLengthCm을 null로 두거나 생략

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
      "totalLengthCm": 61
    }
  ]
}

상의(top) 가능 항목: shoulderWidthCm, chestCircumferenceCm, armholeCm, sleeveLengthCm, totalLengthCm
하의(bottom) 가능 항목: waistCircumferenceCm, thighCircumferenceCm, legOpeningCm, frontRiseCm, rearRiseCm, totalLengthCm

규칙:
- 단면 항목(가슴/암홀/허리/허벅지/밑단): cm 단위 숫자만, 단면 실측값 그대로 (×2 하지 말 것)
- totalLengthCm(총장): 위 totalLengthCm 상세 규칙 준수. 표에 적힌 전체 길이 그대로 (×2/÷2 금지)
- sleeveLengthCm: "소매", "Sleeve", "팔길이" 열 값 그대로 (단면 아님, ×2/÷2 금지)
- category는 사이즈표 항목으로 판별 (어깨/가슴/소매 → top, 허리/허벅지/밑단/밑위 → bottom)
- measurementFields에는 실제로 파싱된 항목 키 나열
- totalLengthCm은 가능하면 포함
- 사이즈표를 찾을 수 없으면 sizeTable을 빈 배열로

HTML:
${truncatedHtml}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
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
