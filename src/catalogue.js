import * as XLSX from "xlsx";
import { nextId } from "./local";

export const CATALOGUE_FIELDS = [
  { key: "name", label: "Product name" },
  { key: "handle", label: "Handle" },
  { key: "description", label: "Description" },
  { key: "vendor", label: "Vendor" },
  { key: "category", label: "Category" },
  { key: "tags", label: "Tags" },
  { key: "sku", label: "SKU" },
  { key: "barcode", label: "Barcode" },
  { key: "sizes", label: "Sizes" },
  { key: "colors", label: "Colours" },
  { key: "cost", label: "Cost" },
  { key: "supply", label: "Supply price" },
  { key: "retail", label: "Retail / sell price" },
  { key: "status", label: "Status" },
  { key: "imageSrc", label: "Image URL / name" },
  { key: "inventoryQty", label: "Inventory qty" },
];

const HEADER_ALIASES = {
  name: ["title", "product name", "name", "product"],
  handle: ["handle", "url handle", "urlhandle"],
  description: ["description", "body (html)", "body html", "body"],
  vendor: ["vendor"],
  category: ["type", "product category", "category", "product type"],
  tags: ["tags"],
  sku: ["sku", "variant sku", "variant sku"],
  barcode: ["barcode", "variant barcode", "barcodes"],
  sizes: ["sizes", "size", "option1 value", "option 1 value"],
  colors: ["colors", "colours", "color", "colour", "option2 value", "option 2 value"],
  cost: ["cost", "cost per item", "variant cost"],
  supply: ["supply", "supply price", "partner supply", "wholesale"],
  retail: ["retail", "price", "variant price", "suggested retail", "selling price"],
  status: ["status", "published", "published on online store"],
  imageSrc: ["image src", "image", "variant image", "image src"],
  inventoryQty: ["inventory qty", "variant inventory qty", "inventory quantity", "on hand", "available"],
};

export function downloadBlob(name, body, type) {
  const blob = new Blob([body], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export function sampleTemplateCsv() {
  const header = [
    "Handle",
    "Title",
    "Body (HTML)",
    "Vendor",
    "Type",
    "Tags",
    "Status",
    "Option1 Name",
    "Option1 Value",
    "Option2 Name",
    "Option2 Value",
    "Variant SKU",
    "Variant Barcode",
    "Variant Price",
    "Cost per item",
    "Supply Price",
    "Variant Inventory Qty",
    "Image Src",
  ];
  const rows = [
    [
      "kurti-a",
      "Kurti A",
      "Everyday cotton kurti",
      "Jaipur Loom House",
      "Kurtis",
      "ethnic,cotton",
      "active",
      "Size",
      "M",
      "Color",
      "Red",
      "KUR-001-M-RED",
      "890100000101",
      "2000",
      "1500",
      "1700",
      "36",
      "kurti-a-red.jpg",
    ],
    [
      "kurti-a",
      "Kurti A",
      "Everyday cotton kurti",
      "Jaipur Loom House",
      "Kurtis",
      "ethnic,cotton",
      "active",
      "Size",
      "L",
      "Color",
      "Black",
      "KUR-001-L-BLK",
      "890100000102",
      "2000",
      "1500",
      "1700",
      "26",
      "kurti-a-black.jpg",
    ],
    [
      "suit-b",
      "Suit B",
      "Festive suit set",
      "Noida Stitch Unit",
      "Suits",
      "festive",
      "active",
      "Size",
      "L",
      "Color",
      "Wine",
      "SUT-014-L-WIN",
      "890100000201",
      "3499",
      "2600",
      "2900",
      "0",
      "",
    ],
  ];
  return [header, ...rows].map((line) => line.map(csvEscape).join(",")).join("\n");
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function exportProductsCsv(products) {
  const header = [
    "Handle",
    "Title",
    "Body (HTML)",
    "Vendor",
    "Type",
    "Tags",
    "Status",
    "Option1 Name",
    "Option1 Value",
    "Option2 Name",
    "Option2 Value",
    "Variant SKU",
    "Variant Barcode",
    "Variant Price",
    "Cost per item",
    "Supply Price",
    "Image Src",
  ];
  const lines = products.map((row) =>
    [
      row.handle || slugify(row.name),
      row.name,
      row.description || "",
      row.vendor || "",
      row.category || "",
      row.tags || "",
      (row.status || "Active").toLowerCase(),
      "Size",
      firstToken(row.sizes),
      "Color",
      firstToken(row.colors),
      row.sku || "",
      row.barcode || "",
      row.retail ?? "",
      row.cost ?? "",
      row.supply ?? "",
      Array.isArray(row.images) && row.images[0] ? "embedded" : row.imageSrc || "",
    ]
      .map(csvEscape)
      .join(","),
  );
  return [header.join(","), ...lines].join("\n");
}

function firstToken(value) {
  if (!value) return "";
  return String(value).split(/[,\s]+/).filter(Boolean)[0] || "";
}

export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function parseCsvText(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  const input = String(text || "").replace(/^\uFEFF/, "");
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    const next = input[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      row.push(cell);
      cell = "";
      continue;
    }
    if (ch === "\n" || (ch === "\r" && next === "\n")) {
      row.push(cell);
      if (row.some((item) => String(item).trim() !== "")) rows.push(row);
      row = [];
      cell = "";
      if (ch === "\r") i += 1;
      continue;
    }
    if (ch === "\r") {
      row.push(cell);
      if (row.some((item) => String(item).trim() !== "")) rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += ch;
  }
  row.push(cell);
  if (row.some((item) => String(item).trim() !== "")) rows.push(row);
  if (!rows.length) return { headers: [], records: [] };
  const headers = rows[0].map((item) => String(item).trim());
  const records = rows.slice(1).map((line, index) => {
    const record = { __row: index + 2 };
    headers.forEach((header, hi) => {
      record[header] = line[hi] ?? "";
    });
    return record;
  });
  return { headers, records };
}

export async function parseCatalogueFile(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv") || name.endsWith(".txt")) {
    const text = await file.text();
    return { ...parseCsvText(text), sourceName: file.name };
  }
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    if (!matrix.length) return { headers: [], records: [], sourceName: file.name };
    const headers = matrix[0].map((item) => String(item).trim());
    const records = matrix.slice(1).filter((line) => line.some((cell) => String(cell).trim() !== "")).map((line, index) => {
      const record = { __row: index + 2 };
      headers.forEach((header, hi) => {
        record[header] = line[hi] ?? "";
      });
      return record;
    });
    return { headers, records, sourceName: file.name };
  }
  throw new Error("Use a .csv or .xlsx catalogue file.");
}

function normalizeHeader(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_/]+/g, " ")
    .replace(/\s+/g, " ");
}

export function detectMapping(headers) {
  const mapping = {};
  const normalized = headers.map((header) => ({ raw: header, norm: normalizeHeader(header) }));
  CATALOGUE_FIELDS.forEach((field) => {
    const aliases = HEADER_ALIASES[field.key] || [];
    const hit = normalized.find((header) => aliases.includes(header.norm));
    if (hit) mapping[field.key] = hit.raw;
  });
  // Prefer Variant SKU over SKU when both exist
  const variantSku = headers.find((header) => normalizeHeader(header) === "variant sku");
  if (variantSku) mapping.sku = variantSku;
  const variantPrice = headers.find((header) => normalizeHeader(header) === "variant price");
  if (variantPrice) mapping.retail = variantPrice;
  return mapping;
}

function moneyValue(raw) {
  if (raw == null || raw === "") return null;
  const cleaned = String(raw).replace(/[₹,\s]/g, "");
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : NaN;
}

function mapStatus(raw) {
  const value = String(raw || "").trim().toLowerCase();
  if (!value) return "Draft";
  if (["active", "true", "published", "live"].includes(value)) return "Active";
  if (["hidden", "unpublished", "false"].includes(value)) return "Hidden";
  if (["archived", "archive"].includes(value)) return "Hidden";
  if (["draft"].includes(value)) return "Draft";
  if (["Active", "Hidden", "Draft"].includes(raw)) return raw;
  return "Draft";
}

export function rowsFromMapping(records, mapping) {
  return records.map((record) => {
    const get = (key) => {
      const header = mapping[key];
      if (!header) return "";
      return record[header] ?? "";
    };
    const option1 = get("sizes");
    const option2 = get("colors");
    const title = String(get("name") || "").trim();
    const sku = String(get("sku") || "").trim();
    const name = title || sku || "Untitled product";
    return {
      __row: record.__row,
      name,
      handle: String(get("handle") || slugify(name)).trim(),
      description: String(get("description") || "").trim(),
      vendor: String(get("vendor") || "").trim(),
      category: String(get("category") || "Uncategorised").trim() || "Uncategorised",
      tags: String(get("tags") || "").trim(),
      sku,
      barcode: String(get("barcode") || "").trim(),
      sizes: String(option1 || "").trim(),
      colors: String(option2 || "").trim(),
      cost: moneyValue(get("cost")),
      supply: moneyValue(get("supply")),
      retail: moneyValue(get("retail")),
      status: mapStatus(get("status")),
      imageSrc: String(get("imageSrc") || "").trim(),
      inventoryQty: moneyValue(get("inventoryQty")),
    };
  });
}

export function validateCatalogueRows(rows, existingProducts = []) {
  const errors = [];
  const warnings = [];
  const skuCounts = {};
  rows.forEach((row) => {
    if (!row.name) errors.push({ row: row.__row, sku: row.sku, message: "Product name (Title) is required." });
    if (!row.sku) errors.push({ row: row.__row, sku: row.sku, message: "SKU is required for each import row." });
    if (row.sku) skuCounts[row.sku] = (skuCounts[row.sku] || 0) + 1;
    if (row.cost != null && Number.isNaN(row.cost)) errors.push({ row: row.__row, sku: row.sku, message: "Cost is not a valid number." });
    if (row.supply != null && Number.isNaN(row.supply)) errors.push({ row: row.__row, sku: row.sku, message: "Supply price is not a valid number." });
    if (row.retail != null && Number.isNaN(row.retail)) errors.push({ row: row.__row, sku: row.sku, message: "Retail price is not a valid number." });
    if (row.retail != null && row.cost != null && !Number.isNaN(row.retail) && !Number.isNaN(row.cost) && row.retail < row.cost) {
      warnings.push({ row: row.__row, sku: row.sku, message: "Retail is below cost." });
    }
    if (row.supply != null && row.cost != null && !Number.isNaN(row.supply) && !Number.isNaN(row.cost) && row.supply < row.cost) {
      warnings.push({ row: row.__row, sku: row.sku, message: "Supply price is below cost." });
    }
    if (!row.retail && row.retail !== 0) warnings.push({ row: row.__row, sku: row.sku, message: "Retail price is missing." });
    if (!row.supply && row.supply !== 0) warnings.push({ row: row.__row, sku: row.sku, message: "Supply price is missing (Pahachan field)." });
    const existing = existingProducts.find((item) => item.sku === row.sku);
    if (existing) warnings.push({ row: row.__row, sku: row.sku, message: `Will update existing product ${existing.id}.` });
  });
  Object.entries(skuCounts).forEach(([sku, count]) => {
    if (sku && count > 1) errors.push({ row: "-", sku, message: `Duplicate SKU in file (${count} rows).` });
  });
  return { errors, warnings, ok: errors.length === 0 };
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export async function buildImageLibrary(files) {
  const library = {};
  for (const file of files) {
    const dataUrl = await fileToDataUrl(file);
    library[file.name] = dataUrl;
    library[file.name.toLowerCase()] = dataUrl;
    const base = file.name.replace(/\.[^.]+$/, "");
    library[base] = dataUrl;
    library[base.toLowerCase()] = dataUrl;
  }
  return library;
}

export function attachImages(rows, imageLibrary, manualMap = {}) {
  return rows.map((row, index) => {
    const key = manualMap[row.sku] || manualMap[String(index)] || row.imageSrc;
    let image = "";
    if (key) {
      if (String(key).startsWith("data:")) image = key;
      else image = imageLibrary[key] || imageLibrary[String(key).toLowerCase()] || "";
    }
    if (!image && row.sku && imageLibrary[row.sku]) image = imageLibrary[row.sku];
    return {
      ...row,
      images: image ? [image] : [],
      imageSrc: row.imageSrc || "",
    };
  });
}

export function applyCatalogueImport(db, rows) {
  let products = [...db.products];
  let inventory = [...(db.inventory || [])];
  let created = 0;
  let updated = 0;
  let inventoryTouched = 0;

  rows.forEach((row) => {
    const payload = {
      name: row.name,
      handle: row.handle || slugify(row.name),
      description: row.description || "",
      vendor: row.vendor || "",
      category: row.category || "Uncategorised",
      tags: row.tags || "",
      sku: row.sku,
      barcode: row.barcode || "",
      sizes: row.sizes || "",
      colors: row.colors || "",
      cost: Number(row.cost) || 0,
      supply: Number(row.supply) || 0,
      retail: Number(row.retail) || 0,
      status: row.status || "Draft",
      images: Array.isArray(row.images) ? row.images : [],
    };

    const existingIndex = products.findIndex((item) => item.sku === row.sku);
    if (existingIndex >= 0) {
      products[existingIndex] = { ...products[existingIndex], ...payload };
      updated += 1;
    } else {
      const id = nextId(products);
      products = [{ id, ...payload }, ...products];
      created += 1;
    }

    if (row.inventoryQty != null && !Number.isNaN(row.inventoryQty)) {
      const qty = Math.max(0, Math.round(Number(row.inventoryQty) || 0));
      const invIndex = inventory.findIndex((item) => item.sku === row.sku);
      if (invIndex >= 0) {
        const reserved = Number(inventory[invIndex].reserved) || 0;
        inventory[invIndex] = {
          ...inventory[invIndex],
          product: row.name,
          size: row.sizes || inventory[invIndex].size,
          color: row.colors || inventory[invIndex].color,
          onHand: qty + reserved,
          available: qty,
        };
      } else {
        inventory = [
          {
            id: nextId(inventory),
            sku: row.sku,
            product: row.name,
            size: row.sizes || "Free",
            color: row.colors || "",
            warehouse: "Central warehouse",
            onHand: qty,
            reserved: 0,
            available: qty,
            damaged: 0,
            reorderAt: 12,
          },
          ...inventory,
        ];
      }
      inventoryTouched += 1;
    }
  });

  return {
    db: { ...db, products, inventory },
    summary: { created, updated, inventoryTouched, total: rows.length },
  };
}
