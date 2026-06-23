import { AnalyzeResult, EstimatedBodyMeasurements, PartFit, ProductInfo, ProductSizeRow, SizeAnalysis } from "./types";
import {
  compareModoodmanPart,
  detectProductCategory,
  getModoodmanPartMappings,
  mappingHasGarmentData
} from "./modoodman";
import { judgeFitDifference } from "./sizeMatch";
import { fitVerdictToStatus } from "./modoodman";

function buildComment(part: string, status: PartFit["status"], easeCm: number): string {
  const sign = easeCm > 0 ? `+${easeCm.toFixed(1)}cm` : `${easeCm.toFixed(1)}cm`;
  if (part === "총장") return `총장은 기준점 대비 ${sign}로 ${status}입니다.`;
  return `${part} 여유량 ${sign}로 ${status}입니다.`;
}

function bodyPartFits(body: EstimatedBodyMeasurements, size: ProductSizeRow, product: ProductInfo, heightCm?: number): PartFit[] {
  const category = detectProductCategory(product);
  const mappings = getModoodmanPartMappings(category).filter((mapping) => mappingHasGarmentData(mapping, product));

  return mappings
    .map((mapping) => {
      const compared = compareModoodmanPart(mapping, body, size, heightCm);
      if (!compared) return null;

      const status = fitVerdictToStatus(judgeFitDifference(compared.easeCm));
      return {
        part: mapping.part as PartFit["part"],
        easeCm: compared.easeCm,
        status,
        comment: buildComment(mapping.part, status, compared.easeCm)
      };
    })
    .filter((part): part is PartFit => part !== null);
}

function buildHighlights(parts: PartFit[]): [string, string, string] {
  const shoulder = parts.find((p) => p.part === "어깨");
  const chest = parts.find((p) => p.part === "가슴");
  const waist = parts.find((p) => p.part === "허리");
  const length = parts.find((p) => p.part === "총장");
  return [
    shoulder ? `어깨 ${shoulder.status} (${shoulder.easeCm.toFixed(1)}cm)` : waist ? `허리 ${waist.status} (${waist.easeCm.toFixed(1)}cm)` : "어깨/허리 데이터 없음",
    chest ? `가슴 ${chest.status} (${chest.easeCm.toFixed(1)}cm)` : parts.find((p) => p.part === "허벅지") ? `허벅지 ${parts.find((p) => p.part === "허벅지")!.status}` : "가슴/허벅지 데이터 없음",
    length ? `총장 기준 ${length.status} (${length.easeCm.toFixed(1)}cm)` : "총장 데이터 없음"
  ];
}

function score(parts: PartFit[]): number {
  return parts.reduce((acc, curr) => {
    const penalty = curr.status === "딱 맞음" ? 0 : curr.status === "여유있음" ? 1 : 3;
    return acc + penalty;
  }, 0);
}

export function analyzeAllSizes(
  body: EstimatedBodyMeasurements,
  product: ProductInfo,
  options?: { heightCm?: number }
): AnalyzeResult {
  const analyses: SizeAnalysis[] = product.sizeTable.map((sizeRow) => {
    const parts = bodyPartFits(body, sizeRow, product, options?.heightCm);
    return {
      size: sizeRow.size,
      highlights: buildHighlights(parts),
      parts
    };
  });

  const best = [...analyses].sort((a, b) => score(a.parts) - score(b.parts))[0];
  return {
    analyses,
    recommendedSize: best?.size ?? "M",
    aiComment: ""
  };
}
