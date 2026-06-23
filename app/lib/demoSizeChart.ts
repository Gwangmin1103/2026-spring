import { SizeComparisonRow } from "@/app/components/SizeComparisonTable";
import { analyzeAllSizes } from "./fitEngine";
import { judgeFitDifference } from "./sizeMatch";
import { StoredProfile } from "./storage";
import {
  BodyEstimationResult,
  EstimatedBodyMeasurements,
  ProductInfo,
  ProductSizeRow
} from "./types";

/** STEP 2 참고용 표준 상의 사이즈표 — 상품 입력 전 비교 데모 */
export const DEMO_REFERENCE_PRODUCT: ProductInfo = {
  platform: "musinsa",
  url: "",
  productName: "표준 상의 사이즈표 (참고)",
  sizeTable: [
    {
      size: "S",
      shoulderWidthCm: 42.0,
      chestCircumferenceCm: 90.0,
      waistCircumferenceCm: 76.0,
      thighCircumferenceCm: 52.0,
      hipCircumferenceCm: 90.0,
      totalLengthCm: 66.0
    },
    {
      size: "M",
      shoulderWidthCm: 44.0,
      chestCircumferenceCm: 94.0,
      waistCircumferenceCm: 80.0,
      thighCircumferenceCm: 54.0,
      hipCircumferenceCm: 94.0,
      totalLengthCm: 68.0
    },
    {
      size: "L",
      shoulderWidthCm: 46.0,
      chestCircumferenceCm: 98.0,
      waistCircumferenceCm: 84.0,
      thighCircumferenceCm: 56.0,
      hipCircumferenceCm: 98.0,
      totalLengthCm: 70.0
    },
    {
      size: "XL",
      shoulderWidthCm: 48.0,
      chestCircumferenceCm: 102.0,
      waistCircumferenceCm: 88.0,
      thighCircumferenceCm: 58.0,
      hipCircumferenceCm: 102.0,
      totalLengthCm: 72.0
    }
  ],
  parsingSource: "manual"
};

const SLEEVE_BY_SIZE: Record<string, number> = {
  S: 58.0,
  M: 60.0,
  L: 62.0,
  XL: 64.0
};

type PartMapping = {
  part: string;
  bodyCm: (body: EstimatedBodyMeasurements) => number;
  garmentCm: (row: ProductSizeRow) => number;
};

const PART_MAPPINGS: PartMapping[] = [
  { part: "어깨", bodyCm: (b) => b.shoulderWidthCm, garmentCm: (r) => r.shoulderWidthCm },
  { part: "가슴", bodyCm: (b) => b.chestCircumferenceCm, garmentCm: (r) => r.chestCircumferenceCm },
  {
    part: "허리",
    bodyCm: (b) => b.waistCircumferenceCm,
    garmentCm: (r) => r.waistCircumferenceCm ?? r.chestCircumferenceCm * 0.9
  },
  {
    part: "허벅지",
    bodyCm: (b) => b.thighCircumferenceCm,
    garmentCm: (r) => r.thighCircumferenceCm ?? 54
  },
  {
    part: "엉덩이",
    bodyCm: (b) => b.hipCircumferenceCm,
    garmentCm: (r) => r.hipCircumferenceCm ?? r.chestCircumferenceCm * 0.95
  },
  { part: "총장", bodyCm: (b) => b.totalLengthCm, garmentCm: (r) => r.totalLengthCm },
  {
    part: "소매",
    bodyCm: (b) => b.sleeveLengthCm,
    garmentCm: (r) => SLEEVE_BY_SIZE[r.size]
  }
];

export function buildDemoComparisonRows(
  body: EstimatedBodyMeasurements,
  product: ProductInfo = DEMO_REFERENCE_PRODUCT
): SizeComparisonRow[] {
  const round1 = (value: number) => Number(value.toFixed(1));

  return PART_MAPPINGS.map(({ part, bodyCm, garmentCm }) => ({
    part,
    bodyCm: round1(bodyCm(body)),
    cells: Object.fromEntries(
      product.sizeTable.map((row) => {
        const difference = round1(garmentCm(row) - bodyCm(body));
        return [
          row.size,
          {
            garmentCm: round1(garmentCm(row)),
            differenceCm: difference,
            verdict: judgeFitDifference(difference)
          }
        ];
      })
    )
  }));
}

export function getDemoSizeLabels(product: ProductInfo = DEMO_REFERENCE_PRODUCT): string[] {
  return product.sizeTable.map((row) => row.size);
}

export function analyzeWithDemoChart(estimation: BodyEstimationResult) {
  return analyzeAllSizes(estimation.estimated, DEMO_REFERENCE_PRODUCT);
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
