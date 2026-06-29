import { BodyEstimationResult, Gender } from "./types";

export type BodyType = 'slim' | 'normal' | 'muscular' | 'chubby';

export type BodyProfileEstimateInput = {
  heightCm: number;
  weightKg: number;
  gender: Gender;
  age?: number;
  bodyType?: BodyType;
};

type LookupEntry = {
  heightMin: number; heightMax: number;
  weightMin: number; weightMax: number;
  ageMin: number; ageMax: number;
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
    {heightMin:150,heightMax:160,weightMin:55,weightMax:65,ageMin:20,ageMax:40,count:4,shoulderWidthCm:36.6,chestCircumferenceCm:91.0,waistCircumferenceCm:84.9,hipCircumferenceCm:90.3,thighCircumferenceCm:50.4,sleeveLengthCm:51.0},
    {heightMin:150,heightMax:160,weightMin:55,weightMax:65,ageMin:40,ageMax:60,count:8,shoulderWidthCm:36.2,chestCircumferenceCm:90.6,waistCircumferenceCm:84.8,hipCircumferenceCm:90.1,thighCircumferenceCm:50.4,sleeveLengthCm:51.3},
    {heightMin:150,heightMax:160,weightMin:55,weightMax:65,ageMin:60,ageMax:100,count:8,shoulderWidthCm:35.8,chestCircumferenceCm:91.2,waistCircumferenceCm:87.1,hipCircumferenceCm:90.1,thighCircumferenceCm:50.4,sleeveLengthCm:51.3},
    {heightMin:160,heightMax:165,weightMin:55,weightMax:65,ageMin:20,ageMax:40,count:9,shoulderWidthCm:37.4,chestCircumferenceCm:86.6,waistCircumferenceCm:76.8,hipCircumferenceCm:88.0,thighCircumferenceCm:50.0,sleeveLengthCm:52.1},
    {heightMin:160,heightMax:165,weightMin:55,weightMax:65,ageMin:40,ageMax:60,count:18,shoulderWidthCm:36.7,chestCircumferenceCm:88.3,waistCircumferenceCm:80.1,hipCircumferenceCm:89.2,thighCircumferenceCm:51.3,sleeveLengthCm:51.7},
    {heightMin:160,heightMax:165,weightMin:55,weightMax:65,ageMin:60,ageMax:100,count:18,shoulderWidthCm:35.9,chestCircumferenceCm:90.1,waistCircumferenceCm:83.4,hipCircumferenceCm:89.2,thighCircumferenceCm:51.3,sleeveLengthCm:51.7},
    {heightMin:160,heightMax:165,weightMin:65,weightMax:75,ageMin:20,ageMax:40,count:12,shoulderWidthCm:38.4,chestCircumferenceCm:92.8,waistCircumferenceCm:85.9,hipCircumferenceCm:93.5,thighCircumferenceCm:55.8,sleeveLengthCm:51.8},
    {heightMin:160,heightMax:165,weightMin:65,weightMax:75,ageMin:40,ageMax:60,count:25,shoulderWidthCm:37.9,chestCircumferenceCm:94.5,waistCircumferenceCm:89.3,hipCircumferenceCm:94.6,thighCircumferenceCm:56.5,sleeveLengthCm:51.1},
    {heightMin:160,heightMax:165,weightMin:65,weightMax:75,ageMin:60,ageMax:100,count:25,shoulderWidthCm:37.1,chestCircumferenceCm:96.3,waistCircumferenceCm:93.7,hipCircumferenceCm:94.6,thighCircumferenceCm:56.5,sleeveLengthCm:51.1},
    {heightMin:165,heightMax:170,weightMin:55,weightMax:65,ageMin:20,ageMax:40,count:16,shoulderWidthCm:38.8,chestCircumferenceCm:85.3,waistCircumferenceCm:73.2,hipCircumferenceCm:87.1,thighCircumferenceCm:50.2,sleeveLengthCm:53.9},
    {heightMin:165,heightMax:170,weightMin:55,weightMax:65,ageMin:40,ageMax:60,count:32,shoulderWidthCm:38.2,chestCircumferenceCm:86.7,waistCircumferenceCm:76.7,hipCircumferenceCm:88.5,thighCircumferenceCm:51.0,sleeveLengthCm:53.7},
    {heightMin:165,heightMax:170,weightMin:55,weightMax:65,ageMin:60,ageMax:100,count:32,shoulderWidthCm:37.3,chestCircumferenceCm:88.5,waistCircumferenceCm:81.9,hipCircumferenceCm:88.5,thighCircumferenceCm:51.0,sleeveLengthCm:53.7},
    {heightMin:165,heightMax:170,weightMin:65,weightMax:75,ageMin:20,ageMax:40,count:28,shoulderWidthCm:39.2,chestCircumferenceCm:91.3,waistCircumferenceCm:81.4,hipCircumferenceCm:91.8,thighCircumferenceCm:53.8,sleeveLengthCm:53.8},
    {heightMin:165,heightMax:170,weightMin:65,weightMax:75,ageMin:40,ageMax:60,count:62,shoulderWidthCm:38.8,chestCircumferenceCm:92.9,waistCircumferenceCm:84.6,hipCircumferenceCm:92.6,thighCircumferenceCm:54.4,sleeveLengthCm:53.6},
    {heightMin:165,heightMax:170,weightMin:65,weightMax:75,ageMin:60,ageMax:100,count:62,shoulderWidthCm:37.8,chestCircumferenceCm:94.1,waistCircumferenceCm:88.3,hipCircumferenceCm:92.6,thighCircumferenceCm:54.4,sleeveLengthCm:53.6},
    {heightMin:165,heightMax:170,weightMin:75,weightMax:85,ageMin:20,ageMax:40,count:10,shoulderWidthCm:39.5,chestCircumferenceCm:94.2,waistCircumferenceCm:87.1,hipCircumferenceCm:96.4,thighCircumferenceCm:58.9,sleeveLengthCm:55.3},
    {heightMin:165,heightMax:170,weightMin:75,weightMax:85,ageMin:40,ageMax:60,count:25,shoulderWidthCm:39.1,chestCircumferenceCm:95.9,waistCircumferenceCm:90.7,hipCircumferenceCm:97.9,thighCircumferenceCm:59.6,sleeveLengthCm:56.0},
    {heightMin:165,heightMax:170,weightMin:75,weightMax:85,ageMin:60,ageMax:100,count:25,shoulderWidthCm:38.2,chestCircumferenceCm:97.8,waistCircumferenceCm:94.9,hipCircumferenceCm:97.9,thighCircumferenceCm:59.6,sleeveLengthCm:56.0},
    {heightMin:170,heightMax:175,weightMin:55,weightMax:65,ageMin:20,ageMax:40,count:14,shoulderWidthCm:39.1,chestCircumferenceCm:84.4,waistCircumferenceCm:72.1,hipCircumferenceCm:87.0,thighCircumferenceCm:48.9,sleeveLengthCm:56.3},
    {heightMin:170,heightMax:175,weightMin:55,weightMax:65,ageMin:40,ageMax:60,count:28,shoulderWidthCm:38.2,chestCircumferenceCm:86.1,waistCircumferenceCm:74.8,hipCircumferenceCm:88.1,thighCircumferenceCm:49.7,sleeveLengthCm:56.0},
    {heightMin:170,heightMax:175,weightMin:55,weightMax:65,ageMin:60,ageMax:100,count:28,shoulderWidthCm:37.4,chestCircumferenceCm:88.3,waistCircumferenceCm:79.2,hipCircumferenceCm:88.1,thighCircumferenceCm:49.7,sleeveLengthCm:56.0},
    {heightMin:170,heightMax:175,weightMin:65,weightMax:75,ageMin:20,ageMax:40,count:24,shoulderWidthCm:39.6,chestCircumferenceCm:87.9,waistCircumferenceCm:79.3,hipCircumferenceCm:91.7,thighCircumferenceCm:55.0,sleeveLengthCm:54.8},
    {heightMin:170,heightMax:175,weightMin:65,weightMax:75,ageMin:40,ageMax:60,count:41,shoulderWidthCm:39.3,chestCircumferenceCm:91.5,waistCircumferenceCm:82.8,hipCircumferenceCm:93.2,thighCircumferenceCm:56.7,sleeveLengthCm:54.4},
    {heightMin:170,heightMax:175,weightMin:65,weightMax:75,ageMin:60,ageMax:100,count:11,shoulderWidthCm:39.0,chestCircumferenceCm:92.3,waistCircumferenceCm:86.8,hipCircumferenceCm:93.8,thighCircumferenceCm:57.2,sleeveLengthCm:54.2},
    {heightMin:170,heightMax:175,weightMin:75,weightMax:85,ageMin:20,ageMax:40,count:17,shoulderWidthCm:40.3,chestCircumferenceCm:95.8,waistCircumferenceCm:86.4,hipCircumferenceCm:97.0,thighCircumferenceCm:59.9,sleeveLengthCm:55.6},
    {heightMin:170,heightMax:175,weightMin:75,weightMax:85,ageMin:40,ageMax:60,count:48,shoulderWidthCm:39.9,chestCircumferenceCm:97.9,waistCircumferenceCm:89.9,hipCircumferenceCm:98.4,thighCircumferenceCm:60.8,sleeveLengthCm:55.3},
    {heightMin:170,heightMax:175,weightMin:75,weightMax:85,ageMin:60,ageMax:100,count:48,shoulderWidthCm:38.8,chestCircumferenceCm:99.4,waistCircumferenceCm:93.8,hipCircumferenceCm:98.4,thighCircumferenceCm:60.8,sleeveLengthCm:55.3},
    {heightMin:175,heightMax:180,weightMin:55,weightMax:65,ageMin:20,ageMax:40,count:7,shoulderWidthCm:40.5,chestCircumferenceCm:83.1,waistCircumferenceCm:67.3,hipCircumferenceCm:88.0,thighCircumferenceCm:49.8,sleeveLengthCm:56.7},
    {heightMin:175,heightMax:180,weightMin:55,weightMax:65,ageMin:40,ageMax:60,count:10,shoulderWidthCm:39.8,chestCircumferenceCm:84.7,waistCircumferenceCm:69.9,hipCircumferenceCm:89.1,thighCircumferenceCm:50.6,sleeveLengthCm:56.4},
    {heightMin:175,heightMax:180,weightMin:55,weightMax:65,ageMin:60,ageMax:100,count:10,shoulderWidthCm:38.9,chestCircumferenceCm:86.8,waistCircumferenceCm:74.1,hipCircumferenceCm:89.1,thighCircumferenceCm:50.6,sleeveLengthCm:56.4},
    {heightMin:175,heightMax:180,weightMin:65,weightMax:75,ageMin:20,ageMax:40,count:22,shoulderWidthCm:41.0,chestCircumferenceCm:90.4,waistCircumferenceCm:76.2,hipCircumferenceCm:93.5,thighCircumferenceCm:55.9,sleeveLengthCm:58.2},
    {heightMin:175,heightMax:180,weightMin:65,weightMax:75,ageMin:40,ageMax:60,count:42,shoulderWidthCm:40.4,chestCircumferenceCm:92.1,waistCircumferenceCm:79.4,hipCircumferenceCm:94.4,thighCircumferenceCm:56.8,sleeveLengthCm:57.9},
    {heightMin:175,heightMax:180,weightMin:65,weightMax:75,ageMin:60,ageMax:100,count:42,shoulderWidthCm:39.4,chestCircumferenceCm:93.8,waistCircumferenceCm:83.6,hipCircumferenceCm:94.4,thighCircumferenceCm:56.8,sleeveLengthCm:57.9},
    {heightMin:175,heightMax:180,weightMin:75,weightMax:85,ageMin:20,ageMax:40,count:17,shoulderWidthCm:41.3,chestCircumferenceCm:93.4,waistCircumferenceCm:82.5,hipCircumferenceCm:97.0,thighCircumferenceCm:58.4,sleeveLengthCm:57.4},
    {heightMin:175,heightMax:180,weightMin:75,weightMax:85,ageMin:40,ageMax:60,count:37,shoulderWidthCm:40.8,chestCircumferenceCm:95.1,waistCircumferenceCm:86.2,hipCircumferenceCm:98.2,thighCircumferenceCm:59.2,sleeveLengthCm:57.1},
    {heightMin:175,heightMax:180,weightMin:75,weightMax:85,ageMin:60,ageMax:100,count:37,shoulderWidthCm:39.7,chestCircumferenceCm:96.9,waistCircumferenceCm:90.4,hipCircumferenceCm:98.2,thighCircumferenceCm:59.2,sleeveLengthCm:57.1},
    {heightMin:180,heightMax:200,weightMin:65,weightMax:75,ageMin:20,ageMax:40,count:8,shoulderWidthCm:40.8,chestCircumferenceCm:83.8,waistCircumferenceCm:73.1,hipCircumferenceCm:91.5,thighCircumferenceCm:54.2,sleeveLengthCm:57.8},
    {heightMin:180,heightMax:200,weightMin:65,weightMax:75,ageMin:40,ageMax:60,count:5,shoulderWidthCm:40.3,chestCircumferenceCm:84.7,waistCircumferenceCm:75.0,hipCircumferenceCm:93.0,thighCircumferenceCm:55.7,sleeveLengthCm:57.5},
    {heightMin:180,heightMax:200,weightMin:65,weightMax:75,ageMin:60,ageMax:100,count:5,shoulderWidthCm:39.3,chestCircumferenceCm:86.5,waistCircumferenceCm:79.2,hipCircumferenceCm:93.0,thighCircumferenceCm:55.7,sleeveLengthCm:57.5},
    {heightMin:180,heightMax:200,weightMin:75,weightMax:85,ageMin:20,ageMax:40,count:9,shoulderWidthCm:41.4,chestCircumferenceCm:93.6,waistCircumferenceCm:82.1,hipCircumferenceCm:96.3,thighCircumferenceCm:57.0,sleeveLengthCm:58.4},
    {heightMin:180,heightMax:200,weightMin:75,weightMax:85,ageMin:40,ageMax:60,count:13,shoulderWidthCm:40.8,chestCircumferenceCm:95.3,waistCircumferenceCm:85.3,hipCircumferenceCm:97.6,thighCircumferenceCm:57.7,sleeveLengthCm:58.1},
    {heightMin:180,heightMax:200,weightMin:75,weightMax:85,ageMin:60,ageMax:100,count:13,shoulderWidthCm:39.7,chestCircumferenceCm:97.1,waistCircumferenceCm:89.5,hipCircumferenceCm:97.6,thighCircumferenceCm:57.7,sleeveLengthCm:58.1},
  ],
  female: [
    {heightMin:150,heightMax:160,weightMin:40,weightMax:55,ageMin:20,ageMax:40,count:44,shoulderWidthCm:34.0,chestCircumferenceCm:82.3,waistCircumferenceCm:66.8,hipCircumferenceCm:88.0,thighCircumferenceCm:51.2,sleeveLengthCm:50.3},
    {heightMin:150,heightMax:160,weightMin:40,weightMax:55,ageMin:40,ageMax:60,count:59,shoulderWidthCm:33.6,chestCircumferenceCm:84.5,waistCircumferenceCm:71.5,hipCircumferenceCm:89.8,thighCircumferenceCm:52.4,sleeveLengthCm:50.7},
    {heightMin:150,heightMax:160,weightMin:40,weightMax:55,ageMin:60,ageMax:100,count:129,shoulderWidthCm:32.8,chestCircumferenceCm:85.9,waistCircumferenceCm:75.8,hipCircumferenceCm:90.6,thighCircumferenceCm:52.8,sleeveLengthCm:50.6},
    {heightMin:150,heightMax:160,weightMin:55,weightMax:65,ageMin:20,ageMax:40,count:28,shoulderWidthCm:34.8,chestCircumferenceCm:90.3,waistCircumferenceCm:77.2,hipCircumferenceCm:92.4,thighCircumferenceCm:53.3,sleeveLengthCm:51.0},
    {heightMin:150,heightMax:160,weightMin:55,weightMax:65,ageMin:40,ageMax:60,count:61,shoulderWidthCm:34.4,chestCircumferenceCm:92.4,waistCircumferenceCm:81.6,hipCircumferenceCm:93.9,thighCircumferenceCm:54.2,sleeveLengthCm:51.3},
    {heightMin:150,heightMax:160,weightMin:55,weightMax:65,ageMin:60,ageMax:100,count:118,shoulderWidthCm:33.6,chestCircumferenceCm:94.1,waistCircumferenceCm:85.8,hipCircumferenceCm:94.7,thighCircumferenceCm:54.6,sleeveLengthCm:51.3},
    {heightMin:150,heightMax:160,weightMin:65,weightMax:85,ageMin:20,ageMax:40,count:8,shoulderWidthCm:35.0,chestCircumferenceCm:98.4,waistCircumferenceCm:87.3,hipCircumferenceCm:97.8,thighCircumferenceCm:57.5,sleeveLengthCm:51.7},
    {heightMin:150,heightMax:160,weightMin:65,weightMax:85,ageMin:40,ageMax:60,count:23,shoulderWidthCm:34.8,chestCircumferenceCm:100.1,waistCircumferenceCm:90.1,hipCircumferenceCm:99.2,thighCircumferenceCm:58.1,sleeveLengthCm:51.9},
    {heightMin:150,heightMax:160,weightMin:65,weightMax:85,ageMin:60,ageMax:100,count:23,shoulderWidthCm:34.0,chestCircumferenceCm:102.3,waistCircumferenceCm:94.7,hipCircumferenceCm:99.2,thighCircumferenceCm:58.1,sleeveLengthCm:51.9},
    {heightMin:160,heightMax:165,weightMin:40,weightMax:55,ageMin:20,ageMax:40,count:35,shoulderWidthCm:35.0,chestCircumferenceCm:80.5,waistCircumferenceCm:63.8,hipCircumferenceCm:88.1,thighCircumferenceCm:50.6,sleeveLengthCm:52.0},
    {heightMin:160,heightMax:165,weightMin:40,weightMax:55,ageMin:40,ageMax:60,count:27,shoulderWidthCm:34.4,chestCircumferenceCm:82.9,waistCircumferenceCm:69.2,hipCircumferenceCm:89.9,thighCircumferenceCm:51.8,sleeveLengthCm:52.3},
    {heightMin:160,heightMax:165,weightMin:40,weightMax:55,ageMin:60,ageMax:100,count:68,shoulderWidthCm:33.6,chestCircumferenceCm:83.8,waistCircumferenceCm:73.4,hipCircumferenceCm:90.1,thighCircumferenceCm:52.1,sleeveLengthCm:52.2},
    {heightMin:160,heightMax:165,weightMin:55,weightMax:65,ageMin:20,ageMax:40,count:26,shoulderWidthCm:35.0,chestCircumferenceCm:86.9,waistCircumferenceCm:70.8,hipCircumferenceCm:93.2,thighCircumferenceCm:54.5,sleeveLengthCm:52.7},
    {heightMin:160,heightMax:165,weightMin:55,weightMax:65,ageMin:40,ageMax:60,count:28,shoulderWidthCm:34.4,chestCircumferenceCm:89.3,waistCircumferenceCm:76.2,hipCircumferenceCm:94.9,thighCircumferenceCm:55.7,sleeveLengthCm:53.0},
    {heightMin:160,heightMax:165,weightMin:55,weightMax:65,ageMin:60,ageMax:100,count:61,shoulderWidthCm:33.6,chestCircumferenceCm:91.2,waistCircumferenceCm:80.4,hipCircumferenceCm:95.5,thighCircumferenceCm:56.1,sleeveLengthCm:52.9},
    {heightMin:165,heightMax:170,weightMin:40,weightMax:55,ageMin:20,ageMax:40,count:12,shoulderWidthCm:35.2,chestCircumferenceCm:79.8,waistCircumferenceCm:63.2,hipCircumferenceCm:88.4,thighCircumferenceCm:50.5,sleeveLengthCm:55.0},
    {heightMin:165,heightMax:170,weightMin:40,weightMax:55,ageMin:40,ageMax:60,count:15,shoulderWidthCm:34.8,chestCircumferenceCm:81.1,waistCircumferenceCm:66.3,hipCircumferenceCm:89.6,thighCircumferenceCm:51.3,sleeveLengthCm:54.9},
    {heightMin:165,heightMax:170,weightMin:55,weightMax:65,ageMin:20,ageMax:40,count:11,shoulderWidthCm:35.6,chestCircumferenceCm:85.4,waistCircumferenceCm:68.9,hipCircumferenceCm:93.5,thighCircumferenceCm:54.2,sleeveLengthCm:54.1},
    {heightMin:165,heightMax:170,weightMin:55,weightMax:65,ageMin:40,ageMax:60,count:22,shoulderWidthCm:35.2,chestCircumferenceCm:87.1,waistCircumferenceCm:72.3,hipCircumferenceCm:94.9,thighCircumferenceCm:55.0,sleeveLengthCm:54.2},
  ]
};

const round1 = (v: number) => Number(v.toFixed(1));

// 어깨 보정: AI Hub 견봉 기준 → 삼각근 기준 변환
const SHOULDER_ADJUSTMENT: Record<string, number> = {
  slim: 2.0,
  normal: 3.0,
  muscular: 4.0,
  chubby: 4.5,
};

export function estimateBodyFromProfile(input: BodyProfileEstimateInput): BodyEstimationResult {
  const table = LOOKUP_TABLE[input.gender];
  const { heightCm, weightKg, age, bodyType } = input;

  const ageMin = !age ? 20 : age < 40 ? 20 : age < 60 ? 40 : 60;
  const ageMax = !age ? 100 : age < 40 ? 40 : age < 60 ? 60 : 100;

  let exact = table.find(e =>
    heightCm >= e.heightMin && heightCm < e.heightMax &&
    weightKg >= e.weightMin && weightKg < e.weightMax &&
    ageMin >= e.ageMin && ageMax <= e.ageMax
  );

  if (!exact) {
    const candidates = table.filter(e =>
      heightCm >= e.heightMin && heightCm < e.heightMax &&
      weightKg >= e.weightMin && weightKg < e.weightMax
    );
    exact = candidates[0];
  }

  if (!exact) {
    const sorted = [...table].sort((a, b) => {
      const aMidH = (a.heightMin + a.heightMax) / 2;
      const bMidH = (b.heightMin + b.heightMax) / 2;
      const aMidW = (a.weightMin + a.weightMax) / 2;
      const bMidW = (b.weightMin + b.weightMax) / 2;
      return (Math.abs(aMidH - heightCm) * 2 + Math.abs(aMidW - weightKg)) -
             (Math.abs(bMidH - heightCm) * 2 + Math.abs(bMidW - weightKg));
    });
    exact = sorted[0];
  }

  const bodyTypeScale = {
    slim:     { chest: 0.94, waist: 0.91, thigh: 0.95, hip: 0.96 },
    normal:   { chest: 1.00, waist: 1.00, thigh: 1.00, hip: 1.00 },
    muscular: { chest: 1.04, waist: 0.95, thigh: 1.02, hip: 1.00 },
    chubby:   { chest: 1.08, waist: 1.10, thigh: 1.06, hip: 1.05 },
  };
  const scale = bodyType ? bodyTypeScale[bodyType] : bodyTypeScale.normal;
  const shoulderAdj = bodyType ? SHOULDER_ADJUSTMENT[bodyType] : SHOULDER_ADJUSTMENT.normal;

  const totalLengthCm = round1(heightCm * (input.gender === 'male' ? 0.36 : 0.355));
  const genderLabel = input.gender === 'male' ? '남성' : '여성';
  const ageLabel = age ? `${age}세` : '';
  const bodyTypeLabel = bodyType ? ({ slim:'마름', normal:'보통', muscular:'근육형', chubby:'통통' })[bodyType] : '';

  return {
    estimated: {
      shoulderWidthCm: round1(exact.shoulderWidthCm + shoulderAdj),
      chestCircumferenceCm: round1(exact.chestCircumferenceCm * scale.chest),
      waistCircumferenceCm: round1(exact.waistCircumferenceCm * scale.waist),
      thighCircumferenceCm: round1(exact.thighCircumferenceCm * scale.thigh),
      hipCircumferenceCm: round1(exact.hipCircumferenceCm * scale.hip),
      totalLengthCm,
      sleeveLengthCm: exact.sleeveLengthCm,
    },
    confidence: 'medium',
    note: `AI Hub 991명 실측 데이터 기반. ${genderLabel} ${ageLabel} ${bodyTypeLabel} 구간 평균값.`.trim()
  };
}
