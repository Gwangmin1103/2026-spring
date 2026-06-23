import { BodyEstimationResult, Gender } from "./types";

export type BodyProfileEstimateInput = {
  heightCm: number;
  weightKg: number;
  gender: Gender;
};

type ReferenceMeasurements = {
  heightCm: number;
  weightKg: number;
  shoulderWidthCm: number;
  chestCircumferenceCm: number;
  waistCircumferenceCm: number;
  thighCircumferenceCm: number;
  hipCircumferenceCm: number;
  totalLengthCm: number;
  sleeveLengthCm: number;
};

/**
 * 한국 성인(20~30대) 평균 체형 기준값.
 * 추후 AI Hub 데이터셋으로 이 상수/함수만 교체하면 됩니다.
 */
const KOREAN_ADULT_REFERENCE: Record<Gender, ReferenceMeasurements> = {
  male: {
    heightCm: 173.5,
    weightKg: 72.0,
    shoulderWidthCm: 44.5,
    chestCircumferenceCm: 96.0,
    waistCircumferenceCm: 82.0,
    thighCircumferenceCm: 56.0,
    hipCircumferenceCm: 96.5,
    totalLengthCm: 69.0,
    sleeveLengthCm: 60.0
  },
  female: {
    heightCm: 161.2,
    weightKg: 57.5,
    shoulderWidthCm: 37.0,
    chestCircumferenceCm: 86.0,
    waistCircumferenceCm: 71.0,
    thighCircumferenceCm: 52.0,
    hipCircumferenceCm: 92.0,
    totalLengthCm: 63.0,
    sleeveLengthCm: 55.0
  }
};

const round1 = (value: number) => Number(value.toFixed(1));

function bmi(weightKg: number, heightCm: number): number {
  return weightKg / Math.pow(heightCm / 100, 2);
}

/**
 * 키·몸무게·성별로 신체 치수를 추정합니다. (순수 계산식, 외부 API 없음)
 */
export function estimateBodyFromProfile(input: BodyProfileEstimateInput): BodyEstimationResult {
  const ref = KOREAN_ADULT_REFERENCE[input.gender];
  const heightRatio = input.heightCm / ref.heightCm;
  const bmiRatio = bmi(input.weightKg, input.heightCm) / bmi(ref.weightKg, ref.heightCm);

  const circumferenceScale = Math.pow(bmiRatio, 0.38);
  const waistScale = Math.pow(bmiRatio, 0.48);
  const thighScale = Math.pow(bmiRatio, 0.43);
  const shoulderScale = Math.pow(bmiRatio, 0.18);

  const genderLabel = input.gender === "male" ? "남성" : "여성";

  return {
    estimated: {
      shoulderWidthCm: round1(ref.shoulderWidthCm * heightRatio * shoulderScale),
      chestCircumferenceCm: round1(ref.chestCircumferenceCm * heightRatio * circumferenceScale),
      waistCircumferenceCm: round1(ref.waistCircumferenceCm * heightRatio * waistScale),
      thighCircumferenceCm: round1(ref.thighCircumferenceCm * heightRatio * thighScale),
      hipCircumferenceCm: round1(ref.hipCircumferenceCm * heightRatio * circumferenceScale),
      totalLengthCm: round1(ref.totalLengthCm * heightRatio),
      sleeveLengthCm: round1(ref.sleeveLengthCm * heightRatio * Math.pow(bmiRatio, 0.12))
    },
    confidence: "low",
    note: `한국 성인 ${genderLabel} 평균 체형 비율로 추정했습니다. (키·몸무게 기반)`
  };
}
