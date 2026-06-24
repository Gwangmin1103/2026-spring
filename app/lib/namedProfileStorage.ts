import { StoredProfile } from "./storage";

const NAMED_PROFILES_KEY = "fit-analyzer-named-profiles";

export type NamedProfileRecord = StoredProfile & {
  fullBodyImageBase64?: string;
};

type NamedProfilesStore = Record<string, NamedProfileRecord>;

function readStore(): NamedProfilesStore {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(NAMED_PROFILES_KEY);
    return raw ? (JSON.parse(raw) as NamedProfilesStore) : {};
  } catch {
    return {};
  }
}

function writeStore(store: NamedProfilesStore) {
  localStorage.setItem(NAMED_PROFILES_KEY, JSON.stringify(store));
}

export function loadNamedProfile(name: string): NamedProfileRecord | null {
  const trimmed = name.trim();
  if (!trimmed) return null;
  return readStore()[trimmed] ?? null;
}

export function saveNamedProfile(name: string, profile: NamedProfileRecord) {
  const trimmed = name.trim();
  if (!trimmed) return;

  const store = readStore();
  store[trimmed] = {
    ...store[trimmed],
    ...profile
  };
  writeStore(store);
}

export function saveNamedFullBodyPhoto(name: string, fullBodyImageBase64: string, profile?: StoredProfile) {
  const trimmed = name.trim();
  if (!trimmed || !fullBodyImageBase64) return;

  const store = readStore();
  store[trimmed] = {
    ...store[trimmed],
    ...profile,
    fullBodyImageBase64
  };
  writeStore(store);
}
