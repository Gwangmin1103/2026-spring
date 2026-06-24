import * as cheerio from "cheerio";
import { inferMeasurementFields } from "./modoodman";
import { GarmentCategory, ProductSizeRow } from "./types";

const MIN_TOTAL_LENGTH_CM = 45;

type ColumnKey =
  | "size"
  | "shoulder"
  | "chest"
  | "armhole"
  | "sleeve"
  | "length"
  | "waist"
  | "frontRise"
  | "rearRise"
  | "thigh"
  | "legOpening"
  | "outseamLength";

export type ModoodmanParseResult = {
  category: GarmentCategory;
  sizeTable: ProductSizeRow[];
  measurementFields: string[];
};

function parseNumber(value: string): number | null {
  const match = value.replace(",", ".").match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  return Number(match[0]);
}

function normalizeHeaderText(text: string): string {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

function classifyHeader(header: string): ColumnKey | null {
  const normalized = normalizeHeaderText(header);
  if (!normalized || normalized === "size") return "size";

  if (normalized.includes("outseam") || (normalized.includes("총장") && normalized.includes("outseam"))) {
    return "outseamLength";
  }
  if (normalized.includes("shoulder") || normalized.includes("어깨")) return "shoulder";
  if (normalized.includes("chest") || normalized.includes("가슴")) return "chest";
  if (normalized.includes("암홀") || /\barm\b/.test(normalized)) return "armhole";
  if (normalized.includes("sleeve") || normalized.includes("팔")) return "sleeve";
  if (normalized.includes("waist") || normalized.includes("허리")) return "waist";
  if (normalized.includes("front rise") || (normalized.includes("앞") && normalized.includes("밑위"))) {
    return "frontRise";
  }
  if (normalized.includes("rear rise") || (normalized.includes("뒷") && normalized.includes("밑위"))) {
    return "rearRise";
  }
  if (normalized.includes("thigh") || normalized.includes("허벅지")) return "thigh";
  if (normalized.includes("leg opening") || normalized.includes("밑단")) return "legOpening";
  if (normalized.includes("length") || normalized.includes("총장")) return "length";

  return null;
}

function detectCategory(columns: (ColumnKey | null)[]): GarmentCategory {
  const bottomSignals = ["waist", "frontRise", "rearRise", "thigh", "legOpening", "outseamLength"];
  if (columns.some((key) => key && bottomSignals.includes(key))) return "bottom";
  return "top";
}

function sanitizeTotalLength(value: number | null): number | undefined {
  if (value === null || Number.isNaN(value) || value < MIN_TOTAL_LENGTH_CM) return undefined;
  return value;
}

function buildRow(values: string[], columnMap: (ColumnKey | null)[]): ProductSizeRow | null {
  const data: Partial<ProductSizeRow> & { size?: string } = {};

  columnMap.forEach((key, index) => {
    if (!key) return;
    const raw = values[index] ?? "";
    if (key === "size") {
      const size = raw.trim();
      if (size) data.size = size;
      return;
    }

    const parsed = parseNumber(raw);
    if (parsed === null) return;

    switch (key) {
      case "shoulder":
        data.shoulderWidthCm = parsed;
        break;
      case "chest":
        data.chestCircumferenceCm = parsed;
        break;
      case "armhole":
        data.armholeCm = parsed;
        break;
      case "sleeve":
        data.sleeveLengthCm = parsed;
        break;
      case "length":
      case "outseamLength": {
        const totalLength = sanitizeTotalLength(parsed);
        if (totalLength !== undefined) data.totalLengthCm = totalLength;
        break;
      }
      case "waist":
        data.waistCircumferenceCm = parsed;
        break;
      case "frontRise":
        data.frontRiseCm = parsed;
        break;
      case "rearRise":
        data.rearRiseCm = parsed;
        break;
      case "thigh":
        data.thighCircumferenceCm = parsed;
        break;
      case "legOpening":
        data.legOpeningCm = parsed;
        break;
    }
  });

  if (!data.size) return null;

  const hasMeasurements =
    data.shoulderWidthCm !== undefined ||
    data.chestCircumferenceCm !== undefined ||
    data.armholeCm !== undefined ||
    data.sleeveLengthCm !== undefined ||
    data.waistCircumferenceCm !== undefined ||
    data.thighCircumferenceCm !== undefined ||
    data.legOpeningCm !== undefined ||
    data.frontRiseCm !== undefined ||
    data.rearRiseCm !== undefined ||
    data.totalLengthCm !== undefined;

  if (!hasMeasurements) return null;

  return data as ProductSizeRow;
}

export function isModoodmanUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    return host === "mode-man.com" || host.endsWith(".mode-man.com") || host.includes("modoodman");
  } catch {
    return false;
  }
}

export function parseModoodmanSizeChart($: cheerio.CheerioAPI): ModoodmanParseResult | null {
  const tableSelectors = ["#size .measurement table", "#size table", ".xans-product-additional #size table"];

  for (const selector of tableSelectors) {
    const tables = $(selector).toArray();
    for (const table of tables) {
      const headerCells = $(table).find("tr").first().find("th,td").toArray();
      const columnMap = headerCells.map((cell) => classifyHeader($(cell).text().trim()));
      if (!columnMap.includes("size")) continue;

      const rows = $(table).find("tr").toArray();
      if (rows.length < 2) continue;

      const sizeTable: ProductSizeRow[] = [];
      for (const row of rows.slice(1)) {
        const values = $(row)
          .find("th,td")
          .toArray()
          .map((cell) => $(cell).text().trim());
        const parsed = buildRow(values, columnMap);
        if (parsed) sizeTable.push(parsed);
      }

      if (sizeTable.length === 0) continue;

      const category = detectCategory(columnMap);
      return {
        category,
        sizeTable,
        measurementFields: inferMeasurementFields({
          platform: "modoodman",
          url: "",
          productName: "",
          sizeTable,
          parsingSource: "crawl",
          category
        })
      };
    }
  }

  return null;
}

export function parseModoodmanSizeChartFromHtml(html: string): ModoodmanParseResult | null {
  const $ = cheerio.load(html);
  return parseModoodmanSizeChart($);
}
