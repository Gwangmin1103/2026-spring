import { EstimatedBodyMeasurements, GarmentCategory, PartFit, ProductInfo, ProductSizeRow } from "./types";
import { FitVerdict, judgeFitDifference } from "./sizeMatch";

export type ModoodmanPartMapping = {
  part: string;
  /** 단면 실측값에 ×2를 적용해 둘레로 환산할지 */
  multiplyFlat: boolean;
  bodyCm: (body: EstimatedBodyMeasurements, heightCm?: number) => number | undefined;
  garmentFlatCm: (row: ProductSizeRow) => number | undefined;
};

const round1 = (value: number) => Number(value.toFixed(1));

export function modoodmanGarmentCompareCm(flatCm: number, multiplyFlat: boolean): number {
  return round1(multiplyFlat ? flatCm * 2 : flatCm);
}

export function detectProductCategory(product: ProductInfo): GarmentCategory {
  if (product.category) return product.category;

  const fields = product.measurementFields ?? inferMeasurementFields(product);
  const topSignals = ["shoulder", "chest", "armhole", "sleeve"].filter((key) => fields.includes(key)).length;
  const bottomSignals = ["frontRise", "rearRise", "thigh", "legOpening"].filter((key) =>
    fields.includes(key)
  ).length;

  if (bottomSignals > topSignals) return "bottom";
  if (topSignals > 0) return "top";

  const sample = product.sizeTable[0];
  if (!sample) return "top";

  if (sample.frontRiseCm !== undefined || sample.rearRiseCm !== undefined || sample.legOpeningCm !== undefined) {
    return "bottom";
  }

  if (
    sample.shoulderWidthCm !== undefined ||
    sample.chestCircumferenceCm !== undefined ||
    sample.sleeveLengthCm !== undefined ||
    sample.armholeCm !== undefined
  ) {
    return "top";
  }

  if (sample.waistCircumferenceCm !== undefined || sample.thighCircumferenceCm !== undefined) {
    return "bottom";
  }

  return "top";
}

export function inferMeasurementFields(product: ProductInfo): string[] {
  const sample = product.sizeTable[0];
  if (!sample) return [];

  const fields: string[] = [];
  if (sample.shoulderWidthCm !== undefined) fields.push("shoulder");
  if (sample.chestCircumferenceCm !== undefined) fields.push("chest");
  if (sample.armholeCm !== undefined) fields.push("armhole");
  if (sample.sleeveLengthCm !== undefined) fields.push("sleeve");
  if (sample.totalLengthCm !== undefined) fields.push("length");
  if (sample.waistCircumferenceCm !== undefined) fields.push("waist");
  if (sample.thighCircumferenceCm !== undefined) fields.push("thigh");
  if (sample.legOpeningCm !== undefined) fields.push("legOpening");
  if (sample.frontRiseCm !== undefined) fields.push("frontRise");
  if (sample.rearRiseCm !== undefined) fields.push("rearRise");
  return fields;
}

const TOP_MAPPINGS: ModoodmanPartMapping[] = [
  {
    part: "어깨",
    multiplyFlat: false,
    bodyCm: (body) => body.shoulderWidthCm,
    garmentFlatCm: (row) => row.shoulderWidthCm
  },
  {
    part: "가슴",
    multiplyFlat: true,
    bodyCm: (body) => body.chestCircumferenceCm,
    garmentFlatCm: (row) => row.chestCircumferenceCm
  },
  {
    part: "암홀",
    multiplyFlat: true,
    bodyCm: (body) => round1(body.chestCircumferenceCm * 0.28),
    garmentFlatCm: (row) => row.armholeCm
  },
  {
    part: "소매",
    multiplyFlat: false,
    bodyCm: (body) => body.sleeveLengthCm,
    garmentFlatCm: (row) => row.sleeveLengthCm
  },
  {
    part: "총장",
    multiplyFlat: false,
    bodyCm: (body) => body.totalLengthCm,
    garmentFlatCm: (row) => row.totalLengthCm
  }
];

const BOTTOM_MAPPINGS: ModoodmanPartMapping[] = [
  {
    part: "허리",
    multiplyFlat: true,
    bodyCm: (body) => body.waistCircumferenceCm,
    garmentFlatCm: (row) => row.waistCircumferenceCm
  },
  {
    part: "허벅지",
    multiplyFlat: true,
    bodyCm: (body) => body.thighCircumferenceCm,
    garmentFlatCm: (row) => row.thighCircumferenceCm
  },
  {
    part: "밑단",
    multiplyFlat: true,
    bodyCm: (body) => round1(body.thighCircumferenceCm * 0.55),
    garmentFlatCm: (row) => row.legOpeningCm
  },
  {
    part: "앞밑위",
    multiplyFlat: false,
    bodyCm: (_body, heightCm) => (heightCm ? round1(heightCm * 0.17) : undefined),
    garmentFlatCm: (row) => row.frontRiseCm
  },
  {
    part: "뒷밑위",
    multiplyFlat: false,
    bodyCm: (_body, heightCm) => (heightCm ? round1(heightCm * 0.19) : undefined),
    garmentFlatCm: (row) => row.rearRiseCm
  },
  {
    part: "총장",
    multiplyFlat: false,
    bodyCm: (body, heightCm) =>
      heightCm ? round1(heightCm * 0.61) : round1(body.totalLengthCm * 1.05),
    garmentFlatCm: (row) => row.totalLengthCm
  }
];

export function getModoodmanPartMappings(category: GarmentCategory): ModoodmanPartMapping[] {
  return category === "bottom" ? BOTTOM_MAPPINGS : TOP_MAPPINGS;
}

export function mappingHasGarmentData(mapping: ModoodmanPartMapping, product: ProductInfo): boolean {
  return product.sizeTable.some((row) => mapping.garmentFlatCm(row) !== undefined);
}

export type ModoodmanComparisonValues = {
  bodyCm: number;
  garmentFlatCm: number;
  garmentCompareCm: number;
  easeCm: number;
};

export function compareModoodmanPart(
  mapping: ModoodmanPartMapping,
  body: EstimatedBodyMeasurements,
  row: ProductSizeRow,
  heightCm?: number
): ModoodmanComparisonValues | null {
  const bodyValue = mapping.bodyCm(body, heightCm);
  const garmentFlat = mapping.garmentFlatCm(row);
  if (bodyValue === undefined || garmentFlat === undefined) return null;

  const garmentCompare = modoodmanGarmentCompareCm(garmentFlat, mapping.multiplyFlat);
  return {
    bodyCm: round1(bodyValue),
    garmentFlatCm: round1(garmentFlat),
    garmentCompareCm: garmentCompare,
    easeCm: round1(garmentCompare - bodyValue)
  };
}

export const TOP_SILHOUETTE_PARTS = ["어깨", "가슴", "소매", "총장"] as const;
export const BOTTOM_SILHOUETTE_PARTS = ["허리", "허벅지", "총장", "밑단"] as const;

export type TopSilhouettePart = (typeof TOP_SILHOUETTE_PARTS)[number];
export type BottomSilhouettePart = (typeof BOTTOM_SILHOUETTE_PARTS)[number];
export type SilhouettePart = TopSilhouettePart | BottomSilhouettePart;

export function getSilhouetteParts(category: GarmentCategory): readonly SilhouettePart[] {
  return category === "bottom" ? BOTTOM_SILHOUETTE_PARTS : TOP_SILHOUETTE_PARTS;
}

export function fitVerdictToStatus(verdict: FitVerdict): PartFit["status"] {
  switch (verdict) {
    case "TIGHT":
      return "타이트";
    case "FIT":
      return "딱 맞음";
    case "REGULAR":
      return "여유있음";
    case "LOOSE":
      return "루즈";
  }
}
