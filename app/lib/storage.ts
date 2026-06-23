import { Gender, ReferenceObjectType } from "./types";

const SESSION_KEY = "fit-analyzer-session";
const PROFILE_KEY = "fit-analyzer-profile";
const PRODUCT_KEY = "fit-analyzer-product-url";

export type StoredProfile = {
  heightCm: number;
  weightKg: number;
  gender: Gender;
};

export type StoredSession = {
  profile: StoredProfile;
  fullBodyImageBase64: string;
  referenceObjectType?: ReferenceObjectType;
  referenceImageBase64?: string;
  productUrl: string;
  manualSizeText?: string;
};

export function saveSession(session: StoredSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.setItem(PROFILE_KEY, JSON.stringify(session.profile));
  localStorage.setItem(PRODUCT_KEY, session.productUrl);
}

export function loadSession(): StoredSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as StoredSession) : null;
}

export function loadBodyProfile(): StoredProfile | null {
  const raw = localStorage.getItem(PROFILE_KEY);
  return raw ? (JSON.parse(raw) as StoredProfile) : null;
}

export function loadProductUrl(): string | null {
  return localStorage.getItem(PRODUCT_KEY);
}

export function updateSessionManualSizeText(manualSizeText: string) {
  const session = loadSession();
  if (!session) return;
  saveSession({ ...session, manualSizeText });
}
