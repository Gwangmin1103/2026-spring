import * as cheerio from "cheerio";

function titleCaseWord(word: string): string {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function extractProductSlugFromUrl(url: string): string | null {
  try {
    const match = new URL(url).pathname.match(/\/product\/([^/]+)/i);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

export function formatProductNameFromSlug(slug: string): string {
  const parts = slug.split("-").filter(Boolean);
  if (parts.length === 0) return slug;

  if (parts.length >= 2 && /^\d+$/.test(parts[1])) {
    const prefix = `${parts[0].toUpperCase()}-${parts[1]}`;
    const rest = parts.slice(2).map(titleCaseWord).join(" ");
    return rest ? `${prefix} ${rest}` : prefix;
  }

  return parts.map(titleCaseWord).join(" ");
}

export function extractProductNameFromUrlSlug(url: string): string | null {
  const slug = extractProductSlugFromUrl(url);
  if (!slug) return null;
  return formatProductNameFromSlug(slug);
}

export function extractOgImageFromHtml(html: string, pageUrl: string): string | undefined {
  const $ = cheerio.load(html);
  const raw = $('meta[property="og:image"]').attr("content")?.trim();
  if (!raw || raw.startsWith("data:")) return undefined;

  try {
    return new URL(raw, pageUrl).href;
  } catch {
    return undefined;
  }
}

export function extractModoodmanProductMetaFromPage(
  url: string,
  html: string,
  fallbackName: string
): { productName: string; modelImageUrl?: string; productImageUrls?: string[] } {
  const productName = extractProductNameFromUrlSlug(url) ?? fallbackName;
  const modelImageUrl = extractOgImageFromHtml(html, url);

  return {
    productName,
    modelImageUrl,
    productImageUrls: modelImageUrl ? [modelImageUrl] : undefined
  };
}
