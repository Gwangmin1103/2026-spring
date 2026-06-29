import { BodyEstimationResult, Gender } from "./types";

export type BodyProfileEstimateInput = {
  heightCm: number;
  weightKg: number;
  gender: Gender;
};

type LookupEntry = {
  heightMin: number; heightMax: number;
  weightMin: number; weightMax: number;
  count: number;
  shoulderWidthCm: number;
  chestCircumferenceCm: number;
  waistCircumferenceCm: number;
  hipCircumferenceCm: number;
  thighCircumferenceCm: number;
  sleeveLengthCm: number;
};

const LOOKUP_TABLE: Record<Gender, LookupEntry[]> = {
  male: [
    { heightMin:150,heightMax:160,weightMin:55,weightMax:65,count:8,shoulderWidthCm:36.2,chestCircumferenceCm:90.6,waistCircumferenceCm:84.8,hipCircumferenceCm:90.1,thighCircumferenceCm:50.4,sleeveLengthCm:51.3 },
    { heightMin:160,heightMax:165,weightMin:40,weightMax:55,count:2,shoulderWidthCm:37.4,chestCircumferenceCm:82.8,waistCircumferenceCm:76.9,hipCircumferenceCm:85.3,thighCircumferenceCm:42.0,sleeveLengthCm:51.8 },
    { heightMin:160,heightMax:165,weightMin:55,weightMax:65,count:18,shoulderWidthCm:36.7,chestCircumferenceCm:88.3,waistCircumferenceCm:80.1,hipCircumferenceCm:89.2,thighCircumferenceCm:51.3,sleeveLengthCm:51.7 },
    { heightMin:160,heightMax:165,weightMin:65,weightMax:75,count:25,shoulderWidthCm:37.9,chestCircumferenceCm:94.5,waistCircumferenceCm:89.3,hipCircumferenceCm:94.6,thighCircumferenceCm:56.5,sleeveLengthCm:51.1 },
    { heightMin:160,heightMax:165,weightMin:75,weightMax:85,count:3,shoulderWidthCm:39.6,chestCircumferenceCm:101.5,waistCircumferenceCm:91.6,hipCircumferenceCm:96.6,thighCircumferenceCm:56.1,sleeveLengthCm:53.7 },
    { heightMin:165,heightMax:170,weightMin:40,weightMax:55,count:2,shoulderWidthCm:36.3,chestCircumferenceCm:82.0,waistCircumferenceCm:68.3,hipCircumferenceCm:84.3,thighCircumferenceCm:47.0,sleeveLengthCm:53.6 },
    { heightMin:165,heightMax:170,weightMin:55,weightMax:65,count:32,shoulderWidthCm:38.2,chestCircumferenceCm:86.7,waistCircumferenceCm:76.7,hipCircumferenceCm:88.5,thighCircumferenceCm:51.0,sleeveLengthCm:53.7 },
    { heightMin:165,heightMax:170,weightMin:65,weightMax:75,count:62,shoulderWidthCm:38.8,chestCircumferenceCm:92.9,waistCircumferenceCm:84.6,hipCircumferenceCm:92.6,thighCircumferenceCm:54.4,sleeveLengthCm:53.6 },
    { heightMin:165,heightMax:170,weightMin:75,weightMax:85,count:25,shoulderWidthCm:39.1,chestCircumferenceCm:95.9,waistCircumferenceCm:90.7,hipCircumferenceCm:97.9,thighCircumferenceCm:59.6,sleeveLengthCm:56.0 },
    { heightMin:165,heightMax:170,weightMin:85,weightMax:100,count:10,shoulderWidthCm:39.4,chestCircumferenceCm:101.8,waistCircumferenceCm:98.8,hipCircumferenceCm:101.9,thighCircumferenceCm:60.5,sleeveLengthCm:55.3 },
    { heightMin:170,heightMax:175,weightMin:55,weightMax:65,count:28,shoulderWidthCm:38.2,chestCircumferenceCm:86.1,waistCircumferenceCm:74.8,hipCircumferenceCm:88.1,thighCircumferenceCm:49.7,sleeveLengthCm:56.0 },
    { heightMin:170,heightMax:175,weightMin:65,weightMax:75,count:76,shoulderWidthCm:39.3,chestCircumferenceCm:90.5,waistCircumferenceCm:82.2,hipCircumferenceCm:92.9,thighCircumferenceCm:56.3,sleeveLengthCm:54.5 },
    { heightMin:170,heightMax:175,weightMin:75,weightMax:85,count:48,shoulderWidthCm:39.9,chestCircumferenceCm:97.9,waistCircumferenceCm:89.9,hipCircumferenceCm:98.4,thighCircumferenceCm:60.8,sleeveLengthCm:55.3 },
    { heightMin:170,heightMax:175,weightMin:85,weightMax:100,count:16,shoulderWidthCm:40.6,chestCircumferenceCm:101.9,waistCircumferenceCm:96.9,hipCircumferenceCm:103.0,thighCircumferenceCm:61.6,sleeveLengthCm:58.4 },
    { heightMin:170,heightMax:175,weightMin:100,weightMax:130,count:2,shoulderWidthCm:40.5,chestCircumferenceCm:111.8,waistCircumferenceCm:113.7,hipCircumferenceCm:109.7,thighCircumferenceCm:64.8,sleeveLengthCm:55.2 },
    { heightMin:175,heightMax:180,weightMin:55,weightMax:65,count:10,shoulderWidthCm:39.8,chestCircumferenceCm:84.7,waistCircumferenceCm:69.9,hipCircumferenceCm:89.1,thighCircumferenceCm:50.6,sleeveLengthCm:56.4 },
    { heightMin:175,heightMax:180,weightMin:65,weightMax:75,count:42,shoulderWidthCm:40.4,chestCircumferenceCm:92.1,waistCircumferenceCm:79.4,hipCircumferenceCm:94.4,thighCircumferenceCm:56.8,sleeveLengthCm:57.9 },
    { heightMin:175,heightMax:180,weightMin:75,weightMax:85,count:37,shoulderWidthCm:40.8,chestCircumferenceCm:95.1,waistCircumferenceCm:86.2,hipCircumferenceCm:98.2,thighCircumferenceCm:59.2,sleeveLengthCm:57.1 },
    { heightMin:175,heightMax:180,weightMin:85,weightMax:100,count:16,shoulderWidthCm:39.9,chestCircumferenceCm:101.5,waistCircumferenceCm:95.6,hipCircumferenceCm:102.6,thighCircumferenceCm:61.5,sleeveLengthCm:57.8 },
    { heightMin:180,heightMax:185,weightMin:55,weightMax:65,count:2,shoulderWidthCm:39.9,chestCircumferenceCm:82.7,waistCircumferenceCm:70.0,hipCircumferenceCm:85.3,thighCircumferenceCm:48.6,sleeveLengthCm:59.2 },
    { heightMin:180,heightMax:185,weightMin:65,weightMax:75,count:5,shoulderWidthCm:40.3,chestCircumferenceCm:84.7,waistCircumferenceCm:75.0,hipCircumferenceCm:93.0,thighCircumferenceCm:55.7,sleeveLengthCm:57.5 },
    { heightMin:180,heightMax:185,weightMin:75,weightMax:85,count:13,shoulderWidthCm:40.8,chestCircumferenceCm:95.3,waistCircumferenceCm:85.3,hipCircumferenceCm:97.6,thighCircumferenceCm:57.7,sleeveLengthCm:58.1 },
    { heightMin:180,heightMax:185,weightMin:85,weightMax:100,count:3,shoulderWidthCm:44.8,chestCircumferenceCm:99.6,waistCircumferenceCm:92.3,hipCircumferenceCm:104.0,thighCircumferenceCm:62.0,sleeveLengthCm:58.6 },
  ],
  female: [
    { heightMin:150,heightMax:160,weightMin:40,weightMax:55,count:129,shoulderWidthCm:33.6,chestCircumferenceCm:84.2,waistCircumferenceCm:70.5,hipCircumferenceCm:89.6,thighCircumferenceCm:52.0,sleeveLengthCm:50.6 },
    { heightMin:150,heightMax:160,weightMin:55,weightMax:65,count:118,shoulderWidthCm:34.4,chestCircumferenceCm:92.7,waistCircumferenceCm:81.0,hipCircumferenceCm:93.9,thighCircumferenceCm:54.3,sleeveLengthCm:51.3 },
    { heightMin:150,heightMax:160,weightMin:65,weightMax:75,count:23,shoulderWidthCm:34.8,chestCircumferenceCm:100.1,waistCircumferenceCm:90.1,hipCircumferenceCm:99.2,thighCircumferenceCm:58.1,sleeveLengthCm:51.9 },
    { heightMin:160,heightMax:165,weightMin:40,weightMax:55,count:68,shoulderWidthCm:34.6,chestCircumferenceCm:82.1,waistCircumferenceCm:67.4,hipCircumferenceCm:89.2,thighCircumferenceCm:51.5,sleeveLengthCm:52.2 },
    { heightMin:160,heightMax:165,weightMin:55,weightMax:65,count:61,shoulderWidthCm:34.5,chestCircumferenceCm:88.9,waistCircumferenceCm:74.7,hipCircumferenceCm:94.7,thighCircumferenceCm:55.4,sleeveLengthCm:52.9 },
    { heightMin:160,heightMax:165,weightMin:65,weightMax:75,count:14,shoulderWidthCm:34.8,chestCircumferenceCm:95.0,waistCircumferenceCm:85.3,hipCircumferenceCm:100.1,thighCircumferenceCm:60.1,sleeveLengthCm:52.8 },
    { heightMin:160,heightMax:165,weightMin:75,weightMax:85,count:2,shoulderWidthCm:37.6,chestCircumferenceCm:103.2,waistCircumferenceCm:89.8,hipCircumferenceCm:105.0,thighCircumferenceCm:64.5,sleeveLengthCm:53.5 },
    { heightMin:165,heightMax:170,weightMin:40,weightMax:55,count:15,shoulderWidthCm:34.8,chestCircumferenceCm:81.1,waistCircumferenceCm:66.3,hipCircumferenceCm:89.6,thighCircumferenceCm:51.3,sleeveLengthCm:54.9 },
    { heightMin:165,heightMax:170,weightMin:55,weightMax:65,count:22,shoulderWidthCm:35.2,chestCircumferenceCm:87.1,waistCircumferenceCm:72.3,hipCircumferenceCm:94.9,thighCircumferenceCm:55.0,sleeveLengthCm:54.2 },
    { heightMin:165,heightMax:170,weightMin:65,weightMax:75,count:3,shoulderWidthCm:37.1,chestCircumferenceCm:97.1,waistCircumferenceCm:83.7,hipCircumferenceCm:97.8,thighCircumferenceCm:58.1,sleeveLengthCm:54.7 },
    { heightMin:170,heightMax:175,weightMin:55,weightMax:65,count:2,shoulderWidthCm:36.0,chestCircumferenceCm:86.2,waistCircumferenceCm:73.0,hipCircumferenceCm:98.0,thighCircumferenceCm:57.4,sleeveLengthCm:55.1 },
  ]
};

const round1 = (v: number) => Number(v.toFixed(1));

function interpolate(a: LookupEntry, b: LookupEntry, t: number): Omit<LookupEntry, 'heightMin'|'heightMax'|'weightMin'|'weightMax'|'count'> {
  return {
    shoulderWidthCm: round1(a.shoulderWidthCm + (b.shoulderWidthCm - a.shoulderWidthCm) * t),
    chestCircumferenceCm: round1(a.chestCircumferenceCm + (b.chestCircumferenceCm - a.chestCircumferenceCm) * t),
    waistCircumferenceCm: round1(a.waistCircumferenceCm + (b.waistCircumferenceCm - a.waistCircumferenceCm) * t),
    hipCircumferenceCm: round1(a.hipCircumferenceCm + (b.hipCircumferenceCm - a.hipCircumferenceCm) * t),
    thighCircumferenceCm: round1(a.thighCircumferenceCm + (b.thighCircumferenceCm - a.thighCircumferenceCm) * t),
    sleeveLengthCm: round1(a.sleeveLengthCm + (b.sleeveLengthCm - a.sleeveLengthCm) * t),
  };
}

export function estimateBodyFromProfile(input: BodyProfileEstimateInput): BodyEstimationResult {
  const table = LOOKUP_TABLE[input.gender];
  const { heightCm, weightKg } = input;

  // 정확히 매칭되는 구간 찾기
  const exact = table.find(e =>
    heightCm >= e.heightMin && heightCm < e.heightMax &&
    weightKg >= e.weightMin && weightKg < e.weightMax
  );

  let result: Omit<LookupEntry, 'heightMin'|'heightMax'|'weightMin'|'weightMax'|'count'>;

  if (exact) {
    result = exact;
  } else {
    // 가장 가까운 구간 찾기 (키 우선)
    const sorted = [...table].sort((a, b) => {
      const aMidH = (a.heightMin + a.heightMax) / 2;
      const bMidH = (b.heightMin + b.heightMax) / 2;
      const aMidW = (a.weightMin + a.weightMax) / 2;
      const bMidW = (b.weightMin + b.weightMax) / 2;
      const aDist = Math.abs(aMidH - heightCm) * 2 + Math.abs(aMidW - weightKg);
      const bDist = Math.abs(bMidH - heightCm) * 2 + Math.abs(bMidW - weightKg);
      return aDist - bDist;
    });
    const nearest = sorted[0];
    const second = sorted[1];
    if (second) {
      result = interpolate(nearest, second, 0.3);
    } else {
      result = nearest;
    }
  }

  // totalLengthCm은 키 비율로 추정 (데이터에 없음)
  const totalLengthCm = round1(heightCm * (input.gender === 'male' ? 0.398 : 0.392));
  const genderLabel = input.gender === 'male' ? '남성' : '여성';

  return {
    estimated: {
      shoulderWidthCm: result.shoulderWidthCm,
      chestCircumferenceCm: result.chestCircumferenceCm,
      waistCircumferenceCm: result.waistCircumferenceCm,
      thighCircumferenceCm: result.thighCircumferenceCm,
      hipCircumferenceCm: result.hipCircumferenceCm,
      totalLengthCm,
      sleeveLengthCm: result.sleeveLengthCm,
    },
    confidence: exact ? 'medium' : 'low',
    note: `AI Hub 한국인 실측 데이터(991명) 기반 추정. ${genderLabel} 키${heightCm}cm 몸무게${weightKg}kg 구간 평균값.`
  };
}
