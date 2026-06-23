export type ReferenceObjectType = "bottle500" | "a4" | "card";

export type ReferenceObjectSpec = {
  type: ReferenceObjectType;
  label: string;
  dimensionsMm: string;
};

export type Gender = "male" | "female";

export type EstimatedBodyMeasurements = {
  shoulderWidthCm: number;
  chestCircumferenceCm: number;
  waistCircumferenceCm: number;
  thighCircumferenceCm: number;
  hipCircumferenceCm: number;
  totalLengthCm: number;
  sleeveLengthCm: number;
};

export type BodyProfileInput = {
  heightCm: number;
  weightKg: number;
  gender: Gender;
  fullBodyImageBase64?: string;
  referenceObjectType?: ReferenceObjectType;
  referenceImageBase64?: string;
};

export type BodyEstimationResult = {
  estimated: EstimatedBodyMeasurements;
  confidence: "low" | "medium" | "high";
  note: string;
};

export type ProductSizeRow = {
  size: "S" | "M" | "L" | "XL";
  shoulderWidthCm: number;
  chestCircumferenceCm: number;
  waistCircumferenceCm?: number;
  hipCircumferenceCm?: number;
  thighCircumferenceCm?: number;
  totalLengthCm: number;
};

export type ProductInfo = {
  platform: "musinsa" | "29cm";
  url: string;
  productName: string;
  modelImageUrl?: string;
  sizeTable: ProductSizeRow[];
  parsingSource: "crawl" | "manual";
};

export type FitStatus = "타이트" | "딱 맞음" | "여유있음" | "헐렁";

export type PartFit = {
  part: "어깨" | "가슴" | "허리" | "허벅지" | "힙" | "총장";
  easeCm: number;
  status: FitStatus;
  comment: string;
};

export type SizeAnalysis = {
  size: "S" | "M" | "L" | "XL";
  highlights: [string, string, string];
  parts: PartFit[];
};

export type AnalyzeResult = {
  analyses: SizeAnalysis[];
  recommendedSize: "S" | "M" | "L" | "XL";
  aiComment: string;
};
