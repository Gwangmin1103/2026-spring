import { GarmentSilhouetteMeasurement } from "@/app/components/ClothingMeasurementSilhouette";
import { SizeComparisonRow } from "@/app/components/SizeComparisonTable";
import {
  compareModoodmanPart,
  detectProductCategory,
  fitVerdictToStatus,
  getModoodmanPartMappings,
  getSilhouetteParts,
  mappingHasGarmentData
} from "./modoodman";
import {
  FitVerdict,
  judgeFitDifference,
  mapEstimatedBodyToBottom,
  mapEstimatedBodyToTop,
  recommendBestSize,
  compareSizeChart,
  ParsedGarmentSizeChart
} from "./sizeMatch";
import { EstimatedBodyMeasurements, GarmentCategory, PartFit, ProductInfo, ProductSizeRow } from "./types";

const round1 = (value: number) => Number(value.toFixed(1));

export { fitVerdictToStatus };

function rowToTopMeasurements(row: ProductSizeRow) {
  const mapping = getModoodmanPartMappings("top");
  const get = (part: string) => mapping.find((item) => item.part === part);

  const shoulder = get("어깨")?.garmentFlatCm(row);
  const chestFlat = get("가슴")?.garmentFlatCm(row);
  const armholeFlat = get("암홀")?.garmentFlatCm(row);
  const sleeve = get("소매")?.garmentFlatCm(row);
  const length = get("총장")?.garmentFlatCm(row);

  return {
    shoulders: shoulder,
    chest: chestFlat !== undefined ? round1(chestFlat * 2) : undefined,
    arm: armholeFlat !== undefined ? round1(armholeFlat * 2) : undefined,
    sleeve,
    length
  };
}

function rowToBottomMeasurements(row: ProductSizeRow) {
  const mapping = getModoodmanPartMappings("bottom");
  const get = (part: string) => mapping.find((item) => item.part === part);

  const waistFlat = get("허리")?.garmentFlatCm(row);
  const thighFlat = get("허벅지")?.garmentFlatCm(row);
  const hemFlat = get("밑단")?.garmentFlatCm(row);

  return {
    waist: waistFlat !== undefined ? round1(waistFlat * 2) : undefined,
    thigh: thighFlat !== undefined ? round1(thighFlat * 2) : undefined,
    legOpening: hemFlat !== undefined ? round1(hemFlat * 2) : undefined,
    frontRise: get("앞밑위")?.garmentFlatCm(row),
    rearRise: get("뒷밑위")?.garmentFlatCm(row),
    outseam: get("총장")?.garmentFlatCm(row)
  };
}

export function productInfoToChart(product: ProductInfo): ParsedGarmentSizeChart {
  const category = detectProductCategory(product);

  if (category === "bottom") {
    return {
      category: "bottom",
      platform: product.platform,
      productUrl: product.url,
      productName: product.productName,
      entries: product.sizeTable.map((row) => ({
        sizeLabel: row.size,
        measurements: rowToBottomMeasurements(row)
      }))
    };
  }

  return {
    category: "top",
    platform: product.platform,
    productUrl: product.url,
    productName: product.productName,
    entries: product.sizeTable.map((row) => ({
      sizeLabel: row.size,
      measurements: rowToTopMeasurements(row)
    }))
  };
}

export function buildComparisonRows(
  body: EstimatedBodyMeasurements,
  product: ProductInfo,
  options?: { heightCm?: number }
): SizeComparisonRow[] {
  const category = detectProductCategory(product);
  const mappings = getModoodmanPartMappings(category).filter((mapping) => mappingHasGarmentData(mapping, product));

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
        .filter((entry): entry is [string, { garmentCm: number; differenceCm: number; verdict: FitVerdict }] => entry !== null)
    )
  }));
}

export function getSizeLabels(product: ProductInfo): string[] {
  return product.sizeTable.map((row) => row.size);
}

export function recommendSizeFromChart(
  body: EstimatedBodyMeasurements,
  product: ProductInfo,
  options?: { heightCm?: number }
): string {
  const chart = productInfoToChart(product);
  const category = detectProductCategory(product);
  const bodyMeasurements =
    category === "bottom"
      ? mapEstimatedBodyToBottom(body, { heightCm: options?.heightCm })
      : mapEstimatedBodyToTop(body);
  const results = compareSizeChart(chart, bodyMeasurements);
  return recommendBestSize(results)?.sizeLabel ?? product.sizeTable[0]?.size ?? "M";
}

export function buildSilhouetteMeasurements(
  body: EstimatedBodyMeasurements,
  product: ProductInfo,
  recommendedSize: string,
  options?: { heightCm?: number }
): { category: GarmentCategory; measurements: GarmentSilhouetteMeasurement[] } {
  const category = detectProductCategory(product);
  const row = product.sizeTable.find((r) => r.size === recommendedSize) ?? product.sizeTable[0];
  if (!row) return { category, measurements: [] };

  const silhouetteParts = getSilhouetteParts(category);
  const mappings = getModoodmanPartMappings(category).filter(
    (mapping) => silhouetteParts.includes(mapping.part as GarmentSilhouetteMeasurement["part"]) && mappingHasGarmentData(mapping, product)
  );

  const measurements = mappings
    .map((mapping) => {
      const compared = compareModoodmanPart(mapping, body, row, options?.heightCm);
      if (!compared) return null;

      const verdict = judgeFitDifference(compared.easeCm);
      return {
        part: mapping.part as GarmentSilhouetteMeasurement["part"],
        bodyCm: compared.bodyCm,
        garmentFlatCm: compared.garmentFlatCm,
        garmentCompareCm: compared.garmentCompareCm,
        easeCm: compared.easeCm,
        status: fitVerdictToStatus(verdict)
      };
    })
    .filter((item): item is GarmentSilhouetteMeasurement => item !== null);

  return { category, measurements };
}

export function buildSilhouetteParts(
  body: EstimatedBodyMeasurements,
  product: ProductInfo,
  recommendedSize: string,
  options?: { heightCm?: number }
): PartFit[] {
  const category = detectProductCategory(product);
  const row = product.sizeTable.find((r) => r.size === recommendedSize) ?? product.sizeTable[0];
  if (!row) return [];

  return getModoodmanPartMappings(category)
    .filter((mapping) => mappingHasGarmentData(mapping, product))
    .map((mapping) => {
      const compared = compareModoodmanPart(mapping, body, row, options?.heightCm);
      if (!compared) {
        return {
          part: mapping.part as PartFit["part"],
          easeCm: 0,
          status: "딱 맞음" as PartFit["status"],
          comment: `${mapping.part} 데이터 없음`
        };
      }

      const verdict = judgeFitDifference(compared.easeCm);
      const status = fitVerdictToStatus(verdict);
      const sign = compared.easeCm > 0 ? `+${compared.easeCm.toFixed(1)}cm` : `${compared.easeCm.toFixed(1)}cm`;
      return {
        part: mapping.part as PartFit["part"],
        easeCm: compared.easeCm,
        status,
        comment: `${mapping.part} 여유량 ${sign} (${status})`
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

export { detectProductCategory };
