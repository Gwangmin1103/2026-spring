import * as cheerio from "cheerio";
import { extractModoodmanProductMeta, parseSizeChartWithClaude } from "./claude";
import { isModoodmanUrl, parseModoodmanSizeChart } from "./modoodmanParser";
import { ProductInfo, ProductSizeRow } from "./types";

function parsePlatform(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}

function detectProductName($: cheerio.CheerioAPI): string {
  return (
    $('meta[property="og:title"]').attr("content") ||
    $("title").text().trim() ||
    "상품명 미확인"
  );
}

function detectModelImage($: cheerio.CheerioAPI): string | undefined {
  return $('meta[property="og:image"]').attr("content");
}

function resolveImageUrl(src: string, pageUrl: string): string | null {
  const trimmed = src.trim();
  if (!trimmed || trimmed.startsWith("data:") || /blank\.(gif|png)/i.test(trimmed)) return null;
  try {
    return new URL(trimmed, pageUrl).href;
  } catch {
    return null;
  }
}

function detectProductImages($: cheerio.CheerioAPI, pageUrl: string): string[] {
  const urls = new Set<string>();

  const ogImage = detectModelImage($);
  if (ogImage) {
    const resolved = resolveImageUrl(ogImage, pageUrl);
    if (resolved) urls.add(resolved);
  }

  const selectors = [
    ".xans-product-image img",
    ".xans-product-detail img",
    ".prdImg img",
    ".thumbnail img",
    ".ThumbImage img",
    "#prdDetail img",
    ".detailArea img"
  ];

  for (const selector of selectors) {
    $(selector).each((_, el) => {
      const raw =
        $(el).attr("src") ?? $(el).attr("data-src") ?? $(el).attr("data-original") ?? $(el).attr("ec-data-src");
      if (!raw) return;
      const resolved = resolveImageUrl(raw, pageUrl);
      if (resolved) urls.add(resolved);
    });
  }

  return [...urls];
}

function parseNumber(value: string): number | null {
  const match = value.replace(",", ".").match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  return Number(match[0]);
}

function parseManualSizeText(text: string): ProductSizeRow[] {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const rows: ProductSizeRow[] = [];
  for (const line of lines) {
    const columns = line.split(/[|,\t/]/).map((x) => x.trim());
    const size = columns[0];
    if (!size) continue;
    const shoulder = parseNumber(columns[1] ?? "");
    const chest = parseNumber(columns[2] ?? "");
    const totalLength = parseNumber(columns[3] ?? "");
    const waist = parseNumber(columns[4] ?? "");
    const sleeve = parseNumber(columns[5] ?? "");
    if (shoulder === null || chest === null || totalLength === null) continue;
    rows.push({
      size,
      shoulderWidthCm: shoulder,
      chestCircumferenceCm: chest,
      waistCircumferenceCm: waist ?? undefined,
      sleeveLengthCm: sleeve ?? undefined,
      totalLengthCm: totalLength
    });
  }
  return rows;
}

function parseHtmlSizeTable($: cheerio.CheerioAPI): ProductSizeRow[] {
  const rows: ProductSizeRow[] = [];
  $("table tr").each((_, tr) => {
    const cells = $(tr)
      .find("th,td")
      .toArray()
      .map((td) => $(td).text().trim());
    const size = cells[0];
    if (!size) return;

    const shoulder = parseNumber(cells[1] ?? "");
    const chest = parseNumber(cells[2] ?? "");
    const totalLength = parseNumber(cells[3] ?? "");
    if (shoulder === null || chest === null || totalLength === null) return;

    rows.push({
      size,
      shoulderWidthCm: shoulder,
      chestCircumferenceCm: chest,
      totalLengthCm: totalLength
    });
  });
  return rows;
}

export async function parseProduct(
  url: string,
  html: string,
  manualSizeText?: string
): Promise<ProductInfo> {
  const $ = cheerio.load(html);
  const productName = detectProductName($);
  const modelImageUrl = detectModelImage($);
  const productImageUrls = detectProductImages($, url);
  const manualRows = manualSizeText ? parseManualSizeText(manualSizeText) : [];

  if (manualRows.length > 0) {
    return {
      platform: parsePlatform(url),
      url,
      productName,
      modelImageUrl: detectModelImage($),
      sizeTable: manualRows,
      parsingSource: "manual"
    };
  }

  if (isModoodmanUrl(url)) {
    const modoodmanChart = parseModoodmanSizeChart($);
    if (modoodmanChart && modoodmanChart.sizeTable.length > 0) {
      const aiMeta = await extractModoodmanProductMeta(url, html, productName);

      return {
        platform: "modoodman",
        url,
        productName: aiMeta?.productName ?? productName,
        modelImageUrl: aiMeta?.modelImageUrl ?? modelImageUrl,
        productImageUrls: aiMeta?.productImageUrls?.length
          ? aiMeta.productImageUrls
          : productImageUrls.length > 0
            ? productImageUrls
            : undefined,
        sizeTable: modoodmanChart.sizeTable,
        parsingSource: "crawl",
        category: modoodmanChart.category,
        measurementFields: modoodmanChart.measurementFields
      };
    }
  }

  const parsedRows = parseHtmlSizeTable($);

  if (parsedRows.length > 0) {
    return {
      platform: parsePlatform(url),
      url,
      productName,
      modelImageUrl: detectModelImage($),
      sizeTable: parsedRows,
      parsingSource: "crawl"
    };
  }

  const aiParsed = await parseSizeChartWithClaude(url, html, productName);
  if (aiParsed) {
    return {
      ...aiParsed,
      modelImageUrl: aiParsed.modelImageUrl ?? detectModelImage($),
      productImageUrls: productImageUrls.length > 0 ? productImageUrls : undefined
    };
  }

  throw new Error("사이즈표를 찾지 못했습니다. 수동 입력을 사용해주세요.");
}
