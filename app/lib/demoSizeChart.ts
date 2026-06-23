import { SizeComparisonRow } from "@/app/components/SizeComparisonTable";
import { analyzeAllSizes } from "./fitEngine";
import {
  compareModoodmanPart,
  detectProductCategory,
  getModoodmanPartMappings,
  mappingHasGarmentData
} from "./modoodman";
import { judgeFitDifference } from "./sizeMatch";
import { StoredProfile } from "./storage";
import {
  BodyEstimationResult,
  EstimatedBodyMeasurements,
  ProductInfo,
  ProductSizeRow
} from "./types";

/** 모드맨 상의 단면 실측 참고 사이즈표 */
export const DEMO_REFERENCE_PRODUCT: ProductInfo = {
  platform: "modoodman",
  url: "",
  productName: "표준 상의 사이즈표 (모드맨 단면)",
  category: "top",
  measurementFields: ["shoulder", "chest", "sleeve", "length"],
  sizeTable: [
    {
      size: "S",
      shoulderWidthCm: 42.0,
      chestCircumferenceCm: 45.0,
      sleeveLengthCm: 58.0,
      totalLengthCm: 66.0
    },
    {
      size: "M",
      shoulderWidthCm: 44.0,
      chestCircumferenceCm: 47.0,
      sleeveLengthCm: 60.0,
      totalLengthCm: 68.0
    },
    {
      size: "L",
      shoulderWidthCm: 46.0,
      chestCircumferenceCm: 49.0,
      sleeveLengthCm: 62.0,
      totalLengthCm: 70.0
    },
    {
      size: "XL",
      shoulderWidthCm: 48.0,
      chestCircumferenceCm: 51.0,
      sleeveLengthCm: 64.0,
      totalLengthCm: 72.0
    }
  ],
  parsingSource: "manual"
};

export function buildDemoComparisonRows(
  body: EstimatedBodyMeasurements,
  product: ProductInfo = DEMO_REFERENCE_PRODUCT,
  options?: { heightCm?: number }
): SizeComparisonRow[] {
  const category = detectProductCategory(product);
  const mappings = getModoodmanPartMappings(category).filter((mapping) => mappingHasGarmentData(mapping, product));
  const round1 = (value: number) => Number(value.toFixed(1));

  return mappings.map((mapping) => ({
    part: mapping.part,
    bodyCm: round1(mapping.bodyCm(body, options?.heightCm) ?? 0),
    cells: Object.fromEntries(
      product.sizeTable
        .map((row) => {
          const compared = compareModoodmanPart(mapping, body, row, options?.heightCm);
          if (!compared) return null;
          return [
            row.size,
            {
              garmentCm: compared.garmentCompareCm,
              differenceCm: compared.easeCm,
              verdict: judgeFitDifference(compared.easeCm)
            }
          ] as const;
        })
        .filter((entry): entry is [string, { garmentCm: number; differenceCm: number; verdict: ReturnType<typeof judgeFitDifference> }] => entry !== null)
    )
  }));
}

export function getDemoSizeLabels(product: ProductInfo = DEMO_REFERENCE_PRODUCT): string[] {
  return product.sizeTable.map((row) => row.size);
}

export function analyzeWithDemoChart(estimation: BodyEstimationResult, heightCm?: number) {
  return analyzeAllSizes(estimation.estimated, DEMO_REFERENCE_PRODUCT, { heightCm });
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

export function formatProfileSubtitle(profile: StoredProfile): string {
  const genderLabel = profile.gender === "male" ? "남성" : "여성";
  return `${genderLabel} · ${profile.heightCm}cm · ${profile.weightKg}kg`;
}
