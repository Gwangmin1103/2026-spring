import { EstimatedBodyMeasurements } from "./types";

/** 옷 실측 대비 여유량(옷 - 신체) 기준 핏 판정 */
export type FitVerdict = "TIGHT" | "FIT" | "REGULAR" | "LOOSE";

export type GarmentCategory = "top" | "bottom";

export const TOP_MEASUREMENT_KEYS = ["shoulders", "chest", "arm", "sleeve", "length"] as const;
export const BOTTOM_MEASUREMENT_KEYS = [
  "waist",
  "frontRise",
  "rearRise",
  "thigh",
  "legOpening",
  "outseam"
] as const;

export type TopMeasurementKey = (typeof TOP_MEASUREMENT_KEYS)[number];
export type BottomMeasurementKey = (typeof BOTTOM_MEASUREMENT_KEYS)[number];

export const TOP_MEASUREMENT_LABELS: Record<TopMeasurementKey, string> = {
  shoulders: "어깨",
  chest: "가슴",
  arm: "암홀",
  sleeve: "팔",
  length: "총장"
};

export const BOTTOM_MEASUREMENT_LABELS: Record<BottomMeasurementKey, string> = {
  waist: "허리",
  frontRise: "앞밑위",
  rearRise: "뒷밑위",
  thigh: "허벅지",
  legOpening: "밑단",
  outseam: "총장"
};

/** 상의 실측 사이즈 (쇼핑몰 파싱 결과를 그대로 매핑) */
export type TopGarmentMeasurements = Partial<Record<TopMeasurementKey, number>>;

/** 하의 실측 사이즈 (쇼핑몰 파싱 결과를 그대로 매핑) */
export type BottomGarmentMeasurements = Partial<Record<BottomMeasurementKey, number>>;

/** 사이즈표 한 행 (예: M, L, 30) */
export type GarmentSizeChartEntry = {
  sizeLabel: string;
  measurements: TopGarmentMeasurements | BottomGarmentMeasurements;
};

/**
 * 쇼핑몰에서 파싱한 사이즈표.
 * parser.ts 등에서 이 형태로 변환해 바로 compareSizeChart()에 전달하면 됩니다.
 */
export type ParsedGarmentSizeChart = {
  category: GarmentCategory;
  platform?: string;
  productUrl?: string;
  productName?: string;
  entries: GarmentSizeChartEntry[];
};

/** 사용자 신체 치수 — 상의 비교용 */
export type TopBodyMeasurements = Partial<Record<TopMeasurementKey, number>>;

/** 사용자 신체 치수 — 하의 비교용 */
export type BottomBodyMeasurements = Partial<Record<BottomMeasurementKey, number>>;

export type MeasurementComparison = {
  key: string;
  label: string;
  bodyCm: number | null;
  garmentCm: number | null;
  /** 옷 실측 - 신체 치수 (양수 = 여유 있음) */
  differenceCm: number | null;
  verdict: FitVerdict | "UNKNOWN";
};

export type SizeMatchResult = {
  sizeLabel: string;
  category: GarmentCategory;
  comparisons: MeasurementComparison[];
  /** UNKNOWN을 제외한 항목 중 TIGHT 개수 */
  tightCount: number;
  /** UNKNOWN을 제외한 항목 중 FIT 개수 */
  fitCount: number;
  score: number;
};

const round1 = (value: number) => Number(value.toFixed(1));

/**
 * 여유량(옷 - 신체)으로 핏 판정.
 * - TIGHT: 신체 > 옷 (차이 < 0)
 * - FIT: 0 ~ 3cm
 * - REGULAR: 3 ~ 6cm
 * - LOOSE: 6cm 초과
 */
export function judgeFitDifference(differenceCm: number): FitVerdict {
  if (differenceCm < 0) return "TIGHT";
  if (differenceCm <= 3) return "FIT";
  if (differenceCm <= 6) return "REGULAR";
  return "LOOSE";
}

function compareMeasurement(
  key: string,
  label: string,
  bodyCm: number | undefined,
  garmentCm: number | undefined
): MeasurementComparison {
  if (bodyCm === undefined || garmentCm === undefined) {
    return {
      key,
      label,
      bodyCm: bodyCm ?? null,
      garmentCm: garmentCm ?? null,
      differenceCm: null,
      verdict: "UNKNOWN"
    };
  }

  const differenceCm = round1(garmentCm - bodyCm);
  return {
    key,
    label,
    bodyCm: round1(bodyCm),
    garmentCm: round1(garmentCm),
    differenceCm,
    verdict: judgeFitDifference(differenceCm)
  };
}

function scoreVerdict(verdict: FitVerdict | "UNKNOWN"): number {
  switch (verdict) {
    case "FIT":
      return 0;
    case "REGULAR":
      return 1;
    case "LOOSE":
      return 2;
    case "TIGHT":
      return 4;
    default:
      return 0;
  }
}

function summarizeComparisons(comparisons: MeasurementComparison[]): Pick<SizeMatchResult, "tightCount" | "fitCount" | "score"> {
  const known = comparisons.filter((item) => item.verdict !== "UNKNOWN");
  return {
    tightCount: known.filter((item) => item.verdict === "TIGHT").length,
    fitCount: known.filter((item) => item.verdict === "FIT").length,
    score: known.reduce((sum, item) => sum + scoreVerdict(item.verdict), 0)
  };
}

/** 상의: 신체 치수 vs 옷 실측 비교 */
export function compareTopSize(
  body: TopBodyMeasurements,
  garment: TopGarmentMeasurements
): MeasurementComparison[] {
  return TOP_MEASUREMENT_KEYS.map((key) =>
    compareMeasurement(key, TOP_MEASUREMENT_LABELS[key], body[key], garment[key])
  );
}

/** 하의: 신체 치수 vs 옷 실측 비교 */
export function compareBottomSize(
  body: BottomBodyMeasurements,
  garment: BottomGarmentMeasurements
): MeasurementComparison[] {
  return BOTTOM_MEASUREMENT_KEYS.map((key) =>
    compareMeasurement(key, BOTTOM_MEASUREMENT_LABELS[key], body[key], garment[key])
  );
}

/** 추정 신체 치수 → 상의 비교용 매핑 (암홀은 체형 비율 근사치) */
export function mapEstimatedBodyToTop(body: EstimatedBodyMeasurements): TopBodyMeasurements {
  return {
    shoulders: body.shoulderWidthCm,
    chest: body.chestCircumferenceCm,
    arm: round1(body.chestCircumferenceCm * 0.28),
    sleeve: body.sleeveLengthCm,
    length: body.totalLengthCm
  };
}

/** 추정 신체 치수 → 하의 비교용 매핑 (밑위·밑단·총장은 체형 비율 근사치) */
export function mapEstimatedBodyToBottom(
  body: EstimatedBodyMeasurements,
  options?: { heightCm?: number }
): BottomBodyMeasurements {
  const heightCm = options?.heightCm;
  return {
    waist: body.waistCircumferenceCm,
    thigh: body.thighCircumferenceCm,
    frontRise: heightCm ? round1(heightCm * 0.17) : undefined,
    rearRise: heightCm ? round1(heightCm * 0.19) : undefined,
    legOpening: round1(body.thighCircumferenceCm * 0.55),
    outseam: heightCm ? round1(heightCm * 0.61) : round1(body.totalLengthCm * 1.05)
  };
}

function isTopChart(chart: ParsedGarmentSizeChart): chart is ParsedGarmentSizeChart & { category: "top" } {
  return chart.category === "top";
}

/** 사이즈표 전체를 사용자 신체 치수와 비교 */
export function compareSizeChart(
  chart: ParsedGarmentSizeChart,
  body: TopBodyMeasurements | BottomBodyMeasurements
): SizeMatchResult[] {
  return chart.entries.map((entry) => {
    const comparisons = isTopChart(chart)
      ? compareTopSize(body as TopBodyMeasurements, entry.measurements as TopGarmentMeasurements)
      : compareBottomSize(body as BottomBodyMeasurements, entry.measurements as BottomGarmentMeasurements);

    return {
      sizeLabel: entry.sizeLabel,
      category: chart.category,
      comparisons,
      ...summarizeComparisons(comparisons)
    };
  });
}

/** 사이즈표에서 가장 잘 맞는 사이즈 추천 (낮은 score 우선, 동점이면 FIT 항목 수) */
export function recommendBestSize(results: SizeMatchResult[]): SizeMatchResult | null {
  if (results.length === 0) return null;

  return [...results].sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    if (a.tightCount !== b.tightCount) return a.tightCount - b.tightCount;
    return b.fitCount - a.fitCount;
  })[0];
}
