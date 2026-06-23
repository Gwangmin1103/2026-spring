import { BodyEstimationResult, Gender, ProductInfo } from "./types";

const BODY_KEY = "fit-analyzer-body-estimation";
const PROFILE_KEY = "fit-analyzer-profile";
const PRODUCT_KEY = "fit-analyzer-product";
const RESULT_KEY = "fit-analyzer-result";

export type StoredProfile = {
  heightCm: number;
  weightKg: number;
  gender: Gender;
};

export function saveBodyProfile(profile: StoredProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function loadBodyProfile(): StoredProfile | null {
  const raw = localStorage.getItem(PROFILE_KEY);
  return raw ? (JSON.parse(raw) as StoredProfile) : null;
}

export function saveBodyEstimation(estimation: BodyEstimationResult) {
  localStorage.setItem(BODY_KEY, JSON.stringify(estimation));
}

export function loadBodyEstimation(): BodyEstimationResult | null {
  const raw = localStorage.getItem(BODY_KEY);
  return raw ? (JSON.parse(raw) as BodyEstimationResult) : null;
}

export function saveProductInfo(product: ProductInfo) {
  localStorage.setItem(PRODUCT_KEY, JSON.stringify(product));
}

export function loadProductInfo(): ProductInfo | null {
  const raw = localStorage.getItem(PRODUCT_KEY);
  return raw ? (JSON.parse(raw) as ProductInfo) : null;
}

export function saveAnalyzeResult(result: unknown) {
  localStorage.setItem(RESULT_KEY, JSON.stringify(result));
}

export function loadAnalyzeResult<T>(): T | null {
  const raw = localStorage.getItem(RESULT_KEY);
  return raw ? (JSON.parse(raw) as T) : null;
}
