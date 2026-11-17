import * as XLSX from "xlsx";
import { downloadBlob } from "../catalogue";
import { inr } from "../data";

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function sheetFromObjects(rows, columns) {
  return [columns.map(([, label]) => label), ...rows.map((row) => columns.map(([key]) => row[key] ?? ""))];
}

export function exportReportsCsv({ summary, brands, products, margins, filename = "dukify-reports.csv" }) {
  const lines = [
    "Section,Metric,Value",
    `Summary,Total Brands,${summary.totalBrands}`,
    `Summary,Total Products,${summary.totalProducts}`,
    `Summary,Total Orders,${summary.totalOrders}`,
    `Summary,Paid Orders,${summary.paidOrders}`,
    `Summary,Gross Sales,${summary.grossSales}`,
    `Summary,Refunds,${summary.refunds}`,
    "",
    "Brand,Total Orders,Delivered Orders,Gross Sales,AOV",
    ...brands.map(
      (row) =>
        [row.brand, row.totalOrders, row.deliveredOrders, row.grossSales, Math.round(row.aov)].map(csvEscape).join(","),
    ),
    "",
    "Product,Brand,Units Sold,Gross Sales,Supply Cost,Gross Margin",
    ...products.map(
      (row) =>
        [row.product, row.brand, row.unitsSold, row.grossSales, row.supplyCost, row.grossMargin].map(csvEscape).join(","),
    ),
    "",
    "Brand,Order Value,Supply Cost,Platform Commission,Other Deductions,Est Brand Payable,Platform Gross Margin",
    ...margins.map(
      (row) =>
        [
          row.brand,
          row.orderValue,
          row.supplyCost,
          row.platformCommission,
          row.otherDeductions,
          row.estimatedBrandPayable,
          row.platformGrossMargin,
        ]
          .map(csvEscape)
          .join(","),
    ),
  ];
  downloadBlob(filename, lines.join("\n"), "text/csv;charset=utf-8");
}

export function exportReportsXlsx({ summary, brands, products, margins, filename = "dukify-reports.xlsx" }) {
  const book = XLSX.utils.book_new();

  const summarySheet = XLSX.utils.aoa_to_sheet([
    ["Metric", "Value"],
    ["Total Brands", summary.totalBrands],
    ["Total Products", summary.totalProducts],
    ["Total Orders", summary.totalOrders],
    ["Paid Orders", summary.paidOrders],
    ["Gross Sales", summary.grossSales],
    ["Gross Sales (display)", inr(summary.grossSales)],
    ["Refunds", summary.refunds],
    ["Refunds (display)", inr(summary.refunds)],
  ]);
  XLSX.utils.book_append_sheet(book, summarySheet, "Summary");

  const brandCols = [
    ["brand", "Brand"],
    ["totalOrders", "Total Orders"],
    ["deliveredOrders", "Delivered Orders"],
    ["grossSales", "Gross Sales"],
    ["aov", "AOV"],
  ];
  XLSX.utils.book_append_sheet(
    book,
    XLSX.utils.aoa_to_sheet(
      sheetFromObjects(
        brands.map((row) => ({ ...row, aov: Math.round(row.aov) })),
        brandCols,
      ),
    ),
    "Brand Sales",
  );

  const productCols = [
    ["product", "Product"],
    ["brand", "Brand"],
    ["unitsSold", "Units Sold"],
    ["grossSales", "Gross Sales"],
    ["supplyCost", "Supply Cost"],
    ["grossMargin", "Gross Margin"],
  ];
  XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(sheetFromObjects(products, productCols)), "Product Sales");

  const marginCols = [
    ["brand", "Brand"],
    ["orderValue", "Order Value"],
    ["supplyCost", "Product Supply Cost"],
    ["platformCommission", "Platform Commission"],
    ["otherDeductions", "Other Deductions"],
    ["estimatedBrandPayable", "Estimated Brand Payable"],
    ["platformGrossMargin", "Platform Gross Margin"],
  ];
  XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(sheetFromObjects(margins, marginCols)), "Partner Margin");

  XLSX.writeFile(book, filename);
}
