import { AnalyzeResult, EstimatedBodyMeasurements, PartFit, ProductInfo, ProductSizeRow, SizeAnalysis } from "./types";

function statusByEase(easeCm: number): PartFit["status"] {
  if (easeCm < -1) return "타이트";
  if (easeCm <= 2) return "딱 맞음";
  if (easeCm <= 6) return "여유있음";
  return "헐렁";
}

function buildComment(part: PartFit["part"], status: PartFit["status"], easeCm: number): string {
  const sign = easeCm > 0 ? `+${easeCm.toFixed(1)}cm` : `${easeCm.toFixed(1)}cm`;
  if (part === "총장") return `총장은 기준점 대비 ${sign}로 ${status}입니다.`;
  return `${part} 여유량 ${sign}로 ${status}입니다.`;
}

function bodyPartFits(body: EstimatedBodyMeasurements, size: ProductSizeRow, heightCm: number): PartFit[] {
  const shoulderEase = size.shoulderWidthCm - body.shoulderWidthCm;
  const chestEase = size.chestCircumferenceCm - body.chestCircumferenceCm;
  const waistEase = (size.waistCircumferenceCm ?? size.chestCircumferenceCm * 0.9) - body.waistCircumferenceCm;
  const hipEase = (size.hipCircumferenceCm ?? size.chestCircumferenceCm * 0.95) - body.hipCircumferenceCm;
  const thighEase = (size.thighCircumferenceCm ?? body.thighCircumferenceCm + 1) - body.thighCircumferenceCm;
  const preferredTopLength = heightCm * 0.4;
  const lengthEase = size.totalLengthCm - preferredTopLength;

  const parts: PartFit[] = [
    { part: "어깨", easeCm: shoulderEase, status: statusByEase(shoulderEase), comment: "" },
    { part: "가슴", easeCm: chestEase, status: statusByEase(chestEase), comment: "" },
    { part: "허리", easeCm: waistEase, status: statusByEase(waistEase), comment: "" },
    { part: "힙", easeCm: hipEase, status: statusByEase(hipEase), comment: "" },
    { part: "허벅지", easeCm: thighEase, status: statusByEase(thighEase), comment: "" },
    { part: "총장", easeCm: lengthEase, status: statusByEase(lengthEase), comment: "" }
  ];

  return parts.map((part) => ({ ...part, comment: buildComment(part.part, part.status, part.easeCm) }));
}

function buildHighlights(parts: PartFit[]): [string, string, string] {
  const shoulder = parts.find((p) => p.part === "어깨");
  const chest = parts.find((p) => p.part === "가슴");
  const length = parts.find((p) => p.part === "총장");
  return [
    shoulder ? `어깨 ${shoulder.status} (${shoulder.easeCm.toFixed(1)}cm)` : "어깨 데이터 없음",
    chest ? `가슴 ${chest.status} (${chest.easeCm.toFixed(1)}cm)` : "가슴 데이터 없음",
    length ? `총장 기준 ${length.status} (${length.easeCm.toFixed(1)}cm)` : "총장 데이터 없음"
  ];
}

function score(parts: PartFit[]): number {
  return parts.reduce((acc, curr) => {
    const penalty = curr.status === "딱 맞음" ? 0 : curr.status === "여유있음" ? 1 : 3;
    return acc + penalty;
  }, 0);
}

export function analyzeAllSizes(body: EstimatedBodyMeasurements, product: ProductInfo, heightCm: number): AnalyzeResult {
  const analyses: SizeAnalysis[] = product.sizeTable.map((sizeRow) => {
    const parts = bodyPartFits(body, sizeRow, heightCm);
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
