export type ReferenceObjectType = "bottle500" | "a4" | "card";

export type ReferenceObjectSpec = {
  type: ReferenceObjectType;
  label: string;
  dimensionsMm: string;
};

export type Gender = "male" | "female";

export type HemPosition = "허리 위" | "허리~골반" | "골반" | "엉덩이 중간" | "엉덩이 아래";

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
  hemPosition?: HemPosition;
};

export type GarmentCategory = "top" | "bottom";

export type ProductSizeRow = {
  size: string;
  /** 모드맨 단면 실측 — 어깨 너비 */
  shoulderWidthCm?: number;
  /** 모드맨 단면 실측 — 가슴 단면 (비교 시 ×2) */
  chestCircumferenceCm?: number;
  /** 모드맨 단면 실측 — 암홀 단면 (비교 시 ×2) */
  armholeCm?: number;
  waistCircumferenceCm?: number;
  hipCircumferenceCm?: number;
  thighCircumferenceCm?: number;
  /** 모드맨 단면 실측 — 밑단 단면 (비교 시 ×2) */
  legOpeningCm?: number;
  frontRiseCm?: number;
  rearRiseCm?: number;
  sleeveLengthCm?: number;
  totalLengthCm: number;
};

export type ProductInfo = {
  platform: string;
  url: string;
  productName: string;
  modelImageUrl?: string;
  /** 상품 상세 이미지 URL 목록 (대표 이미지 포함) */
  productImageUrls?: string[];
  sizeTable: ProductSizeRow[];
  parsingSource: "crawl" | "manual" | "ai";
  /** 파싱된 상품 카테고리 (없으면 실측 항목으로 추론) */
  category?: GarmentCategory;
  /** 파싱된 실측 항목 키 (shoulder, chest, waist 등) */
  measurementFields?: string[];
};

export type FitStatus = "타이트" | "딱 맞음" | "여유있음" | "루즈";

export type PartFit = {
  part: "어깨" | "가슴" | "허리" | "허벅지" | "힙" | "총장";
  easeCm: number;
  status: FitStatus;
  comment: string;
};

export type SizeAnalysis = {
  size: string;
  highlights: [string, string, string];
  parts: PartFit[];
};

export type AnalyzeResult = {
  analyses: SizeAnalysis[];
  recommendedSize: string;
  aiComment: string;
};
