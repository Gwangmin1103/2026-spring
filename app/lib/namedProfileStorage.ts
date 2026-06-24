import { StoredProfile } from "./storage";

const NAMED_PROFILES_KEY = "fit-analyzer-named-profiles";

type NamedProfilesStore = Record<string, StoredProfile>;

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

export function loadNamedProfile(name: string): StoredProfile | null {
  const trimmed = name.trim();
  if (!trimmed) return null;
  return readStore()[trimmed] ?? null;
}

export function saveNamedProfile(name: string, profile: StoredProfile) {
  const trimmed = name.trim();
  if (!trimmed) return;

  const store = readStore();
  store[trimmed] = profile;
  writeStore(store);
}
