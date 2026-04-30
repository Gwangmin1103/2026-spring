import * as cheerio from "cheerio";
import { ProductInfo, ProductSizeRow } from "./types";

function parsePlatform(url: string): ProductInfo["platform"] {
  if (url.includes("29cm")) return "29cm";
  return "musinsa";
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
    const size = columns[0]?.toUpperCase() as ProductSizeRow["size"];
    if (!["S", "M", "L", "XL"].includes(size)) continue;
    const shoulder = parseNumber(columns[1] ?? "");
    const chest = parseNumber(columns[2] ?? "");
    const totalLength = parseNumber(columns[3] ?? "");
    if (shoulder === null || chest === null || totalLength === null) continue;
    rows.push({
      size,
      shoulderWidthCm: shoulder,
      chestCircumferenceCm: chest,
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
    const size = cells[0]?.toUpperCase() as ProductSizeRow["size"];
    if (!["S", "M", "L", "XL"].includes(size)) return;

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

export function parseProduct(url: string, html: string, manualSizeText?: string): ProductInfo {
  const $ = cheerio.load(html);
  const parsedRows = parseHtmlSizeTable($);
  const manualRows = manualSizeText ? parseManualSizeText(manualSizeText) : [];
  const sizeTable = parsedRows.length > 0 ? parsedRows : manualRows;

  return {
    platform: parsePlatform(url),
    url,
    productName: detectProductName($),
    modelImageUrl: detectModelImage($),
    sizeTable:
      sizeTable.length > 0
        ? sizeTable
        : [
            { size: "S", shoulderWidthCm: 44, chestCircumferenceCm: 100, totalLengthCm: 67 },
            { size: "M", shoulderWidthCm: 46, chestCircumferenceCm: 105, totalLengthCm: 69 },
            { size: "L", shoulderWidthCm: 48, chestCircumferenceCm: 110, totalLengthCm: 71 },
            { size: "XL", shoulderWidthCm: 50, chestCircumferenceCm: 116, totalLengthCm: 73 }
          ],
    parsingSource: parsedRows.length > 0 ? "crawl" : "manual"
  };
}
