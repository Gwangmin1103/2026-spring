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

function writeStore(store: NamedProfilesStore): boolean {
  try {
    localStorage.setItem(NAMED_PROFILES_KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}

function persistRecord(name: string, record: NamedProfileRecord) {
  const store = readStore();

  if (writeStore({ ...store, [name]: record })) return;

  const { fullBodyImageBase64: _photo, ...profileWithoutPhoto } = record;
  writeStore({ ...store, [name]: profileWithoutPhoto });
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
  persistRecord(trimmed, {
    ...store[trimmed],
    ...profile
  });
}

export function saveNamedFullBodyPhoto(name: string, fullBodyImageBase64: string, profile?: StoredProfile) {
  const trimmed = name.trim();
  if (!trimmed || !fullBodyImageBase64) return;

  const store = readStore();
  persistRecord(trimmed, {
    ...store[trimmed],
    ...profile,
    fullBodyImageBase64
  });
}
