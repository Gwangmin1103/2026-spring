import { SizeComparisonRow } from "@/app/components/SizeComparisonTable";
import {
  FitVerdict,
  judgeFitDifference,
  mapEstimatedBodyToTop,
  recommendBestSize,
  compareSizeChart,
  ParsedGarmentSizeChart,
  TopGarmentMeasurements
} from "./sizeMatch";
import { EstimatedBodyMeasurements, PartFit, ProductInfo, ProductSizeRow } from "./types";

const SLEEVE_BY_SIZE: Record<string, number> = {
  S: 58,
  M: 60,
  L: 62,
  XL: 64
};

type PartMapping = {
  part: string;
  partFitKey: PartFit["part"] | "소매";
  bodyCm: (body: EstimatedBodyMeasurements) => number;
  garmentCm: (row: ProductSizeRow) => number;
};

const PART_MAPPINGS: PartMapping[] = [
  { part: "어깨", partFitKey: "어깨", bodyCm: (b) => b.shoulderWidthCm, garmentCm: (r) => r.shoulderWidthCm },
  { part: "가슴", partFitKey: "가슴", bodyCm: (b) => b.chestCircumferenceCm, garmentCm: (r) => r.chestCircumferenceCm },
  {
    part: "허리",
    partFitKey: "허리",
    bodyCm: (b) => b.waistCircumferenceCm,
    garmentCm: (r) => r.waistCircumferenceCm ?? r.chestCircumferenceCm * 0.9
  },
  {
    part: "허벅지",
    partFitKey: "허벅지",
    bodyCm: (b) => b.thighCircumferenceCm,
    garmentCm: (r) => r.thighCircumferenceCm ?? 54
  },
  {
    part: "엉덩이",
    partFitKey: "힙",
    bodyCm: (b) => b.hipCircumferenceCm,
    garmentCm: (r) => r.hipCircumferenceCm ?? r.chestCircumferenceCm * 0.95
  },
  { part: "총장", partFitKey: "총장", bodyCm: (b) => b.totalLengthCm, garmentCm: (r) => r.totalLengthCm },
  {
    part: "소매",
    partFitKey: "소매",
    bodyCm: (b) => b.sleeveLengthCm,
    garmentCm: (r) => SLEEVE_BY_SIZE[r.size] ?? 60
  }
];

export function fitVerdictToStatus(verdict: FitVerdict): PartFit["status"] {
  switch (verdict) {
    case "TIGHT":
      return "타이트";
    case "FIT":
      return "딱 맞음";
    case "REGULAR":
      return "여유있음";
    case "LOOSE":
      return "헐렁";
  }
}

export function productInfoToChart(product: ProductInfo): ParsedGarmentSizeChart {
  return {
    category: "top",
    platform: product.platform,
    productUrl: product.url,
    productName: product.productName,
    entries: product.sizeTable.map((row) => ({
      sizeLabel: row.size,
      measurements: {
        shoulders: row.shoulderWidthCm,
        chest: row.chestCircumferenceCm,
        sleeve: row.sleeveLengthCm ?? SLEEVE_BY_SIZE[row.size],
        length: row.totalLengthCm
      } satisfies TopGarmentMeasurements
    }))
  };
}

export function buildComparisonRows(
  body: EstimatedBodyMeasurements,
  product: ProductInfo
): SizeComparisonRow[] {
  return PART_MAPPINGS.map(({ part, bodyCm, garmentCm }) => ({
    part,
    verdicts: Object.fromEntries(
      product.sizeTable.map((row) => {
        const difference = garmentCm(row) - bodyCm(body);
        return [row.size, judgeFitDifference(difference)];
      })
    )
  }));
}

export function getSizeLabels(product: ProductInfo): string[] {
  return product.sizeTable.map((row) => row.size);
}

export function recommendSizeFromChart(body: EstimatedBodyMeasurements, product: ProductInfo): string {
  const chart = productInfoToChart(product);
  const bodyTop = mapEstimatedBodyToTop(body);
  const results = compareSizeChart(chart, bodyTop);
  return recommendBestSize(results)?.sizeLabel ?? product.sizeTable[0]?.size ?? "M";
}

export function buildSilhouetteParts(
  body: EstimatedBodyMeasurements,
  product: ProductInfo,
  recommendedSize: string
): PartFit[] {
  const row = product.sizeTable.find((r) => r.size === recommendedSize) ?? product.sizeTable[0];
  if (!row) return [];

  return PART_MAPPINGS.filter((m) => m.partFitKey !== "소매")
    .map(({ partFitKey, bodyCm, garmentCm }) => {
      const easeCm = garmentCm(row) - bodyCm(body);
      const verdict = judgeFitDifference(easeCm);
      const status = fitVerdictToStatus(verdict);
      const sign = easeCm > 0 ? `+${easeCm.toFixed(1)}cm` : `${easeCm.toFixed(1)}cm`;
      return {
        part: partFitKey as PartFit["part"],
        easeCm,
        status,
        comment: `${partFitKey} 여유량 ${sign} (${status})`
      };
    });
}

export function formatBodyMeasurementItems(body: EstimatedBodyMeasurements) {
  return [
    { label: "어깨너비", value: body.shoulderWidthCm },
    { label: "가슴둘레", value: body.chestCircumferenceCm },
    { label: "허리둘레", value: body.waistCircumferenceCm },
    { label: "허벅지둘레", value: body.thighCircumferenceCm },
    { label: "엉덩이둘레", value: body.hipCircumferenceCm },
    { label: "총장", value: body.totalLengthCm },
    { label: "소매길이", value: body.sleeveLengthCm }
  ];
}

export function formatProfileSubtitle(profile: { gender: "male" | "female"; heightCm: number; weightKg: number }) {
  const genderLabel = profile.gender === "male" ? "남성" : "여성";
  return `${genderLabel} · ${profile.heightCm}cm · ${profile.weightKg}kg`;
}
