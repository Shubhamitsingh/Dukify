import { integrationsSeedRows } from "./integrations/data/integrations";
import { seedOrders } from "./orders/seedOrders";
import { DEFAULT_SETTINGS } from "./settings/data/defaults";
import { supportAgentsSeed, ticketCategoriesSeed, ticketsSeed } from "./support/data/seed";

export const seed = {
  brands: [
    { id: "BRD-1001", name: "Aisa Clothing", partner: "Aisa Studio", email: "studio@aisa.example", phone: "+91 98000 10001", domain: "aisa.platformdomain.in", category: "Ethnic wear", status: "Active", description: "Everyday kurtis and co-ord sets." },
    { id: "BRD-1002", name: "Royal Ethnic", partner: "Royal Ethnic House", email: "hello@royalethnic.example", phone: "+91 98000 10002", domain: "royal.platformdomain.in", category: "Occasion wear", status: "Active", description: "Suits and sarees on the company label." },
    { id: "BRD-1003", name: "Noor Fashion", partner: "Noor Fashion Desk", email: "desk@noorfashion.example", phone: "+91 98000 10003", domain: "noor.platformdomain.in", category: "Festive", status: "Active", description: "Smaller festive edit. Returns are being watched." },
    { id: "BRD-1004", name: "Zari Atelier", partner: "Zari Atelier", email: "apply@zari.example", phone: "+91 98000 10004", domain: "zari.platformdomain.in", category: "Ethnic wear", status: "Pending approval", description: "Application in review. Storefront is not live." },
    { id: "BRD-1005", name: "Lotus Thread", partner: "Lotus Thread", email: "care@lotus.example", phone: "+91 98000 10005", domain: "lotus.platformdomain.in", category: "Western wear", status: "Temporarily suspended", description: "Storefront suspended. Orders stay on record." },
    { id: "BRD-1006", name: "Gulmohar", partner: "Gulmohar", email: "draft@gulmohar.example", phone: "+91 98000 10006", domain: "Not assigned", category: "Ethnic wear", status: "Draft", description: "Created by Super Admin. Logo is still open." },
  ],
  partners: [
    { id: "PTR-2041", name: "Aisa Studio", brand: "Aisa Clothing", email: "studio@aisa.example", phone: "+91 98000 10001", city: "Jaipur", verification: "Verified", status: "Active", joined: "12 Aug 2026" },
    { id: "PTR-2042", name: "Royal Ethnic House", brand: "Royal Ethnic", email: "hello@royalethnic.example", phone: "+91 98000 10002", city: "Delhi", verification: "Verified", status: "Active", joined: "28 Aug 2026" },
    { id: "PTR-2043", name: "Noor Fashion Desk", brand: "Noor Fashion", email: "desk@noorfashion.example", phone: "+91 98000 10003", city: "Lucknow", verification: "Verified", status: "Active", joined: "09 Sep 2026" },
    { id: "PTR-2044", name: "Zari Atelier", brand: "Zari Atelier", email: "apply@zari.example", phone: "+91 98000 10004", city: "Surat", verification: "Pending", status: "Pending approval", joined: "02 Nov 2026" },
    { id: "PTR-2045", name: "Lotus Thread", brand: "Lotus Thread", email: "care@lotus.example", phone: "+91 98000 10005", city: "Pune", verification: "Verified", status: "Suspended", joined: "19 Sep 2026" },
    { id: "PTR-2046", name: "Gulmohar", brand: "Gulmohar", email: "draft@gulmohar.example", phone: "+91 98000 10006", city: "Indore", verification: "Not started", status: "Draft", joined: "08 Nov 2026" },
  ],
  websites: [
    { id: "WEB-01", brand: "Aisa Clothing", url: "aisa.platformdomain.in", theme: "Ivory editorial", color: "#9D174D", status: "Published", ssl: "Active" },
    { id: "WEB-02", brand: "Royal Ethnic", url: "royal.platformdomain.in", theme: "Indigo ceremonial", color: "#1E3A5F", status: "Published", ssl: "Active" },
    { id: "WEB-03", brand: "Noor Fashion", url: "noor.platformdomain.in", theme: "Festive sand", color: "#92400E", status: "Published", ssl: "Active" },
    { id: "WEB-04", brand: "Zari Atelier", url: "zari.platformdomain.in", theme: "Ivory editorial", color: "#A16207", status: "Setup pending", ssl: "Pending" },
    { id: "WEB-05", brand: "Lotus Thread", url: "lotus.platformdomain.in", theme: "Ivory editorial", color: "#166534", status: "Suspended", ssl: "Inactive" },
    { id: "WEB-06", brand: "Gulmohar", url: "Not assigned", theme: "Not selected", color: "#9D174D", status: "Draft", ssl: "Not issued" },
  ],
  products: [
    { id: "PRD-01", name: "Kurti A", sku: "KUR-001", barcode: "890100000001", category: "Kurtis", sizes: "S M L XL", colors: "Red, Black", cost: 1500, supply: 1700, retail: 2000, status: "Active" },
    { id: "PRD-02", name: "Suit B", sku: "SUT-014", barcode: "890100000002", category: "Suits", sizes: "M L XL", colors: "Wine, Ivory", cost: 2600, supply: 2900, retail: 3499, status: "Active" },
    { id: "PRD-03", name: "Saree C", sku: "SAR-008", barcode: "890100000003", category: "Sarees", sizes: "Free", colors: "Maroon, Gold", cost: 1800, supply: 2100, retail: 2599, status: "Active" },
    { id: "PRD-04", name: "Co-ord D", sku: "CRD-003", barcode: "890100000004", category: "Co-ord sets", sizes: "S M L", colors: "Sage, Black", cost: 1200, supply: 1450, retail: 1799, status: "Active" },
    { id: "PRD-05", name: "Dress E", sku: "DRS-021", barcode: "890100000005", category: "Dresses", sizes: "S M L", colors: "Blush", cost: 900, supply: 1100, retail: 1499, status: "Active" },
    { id: "PRD-06", name: "Dupatta F", sku: "DUP-006", barcode: "890100000006", category: "Dupattas", sizes: "Free", colors: "Ivory", cost: 350, supply: 450, retail: 699, status: "Active" },
    { id: "PRD-07", name: "Top G", sku: "TOP-011", barcode: "890100000007", category: "Tops", sizes: "S M L", colors: "White, Navy", cost: 500, supply: 650, retail: 899, status: "Hidden" },
    { id: "PRD-08", name: "Jeans H", sku: "JNS-004", barcode: "890100000008", category: "Jeans", sizes: "28 30 32", colors: "Indigo", cost: 800, supply: 980, retail: 1299, status: "Draft" },
  ],
  categories: [
    { id: "CAT-01", name: "Kurtis", parent: "Women's clothing", products: 1, order: 1, status: "Active" },
    { id: "CAT-02", name: "Suits", parent: "Ethnic wear", products: 1, order: 2, status: "Active" },
    { id: "CAT-03", name: "Sarees", parent: "Ethnic wear", products: 1, order: 3, status: "Active" },
    { id: "CAT-04", name: "Co-ord sets", parent: "Women's clothing", products: 1, order: 4, status: "Active" },
    { id: "CAT-05", name: "Dresses", parent: "Western wear", products: 1, order: 5, status: "Active" },
    { id: "CAT-06", name: "Tops", parent: "Western wear", products: 1, order: 6, status: "Active" },
    { id: "CAT-07", name: "Jeans", parent: "Western wear", products: 1, order: 7, status: "Draft" },
    { id: "CAT-08", name: "Accessories", parent: "Collections", products: 1, order: 8, status: "Active" },
  ],
  suppliers: [
    { id: "SUP-01", name: "Jaipur Loom House", city: "Jaipur", categories: "Kurtis, co-ord", contact: "desk@loomhouse.example", invoices: 4, status: "Active" },
    { id: "SUP-02", name: "Surat Silk Desk", city: "Surat", categories: "Sarees", contact: "orders@suratsilk.example", invoices: 3, status: "Active" },
    { id: "SUP-03", name: "Noida Stitch Unit", city: "Noida", categories: "Suits, dresses", contact: "unit@noidastitch.example", invoices: 2, status: "Active" },
    { id: "SUP-04", name: "Ludhiana Denim", city: "Ludhiana", categories: "Jeans", contact: "mill@ludhianadenim.example", invoices: 1, status: "On hold" },
  ],
  purchases: [
    { id: "PO-301", supplier: "Jaipur Loom House", product: "Kurti A", qty: 200, cost: 300000, status: "Received", date: "02 Oct 2026" },
    { id: "PO-302", supplier: "Noida Stitch Unit", product: "Suit B", qty: 80, cost: 208000, status: "Received", date: "18 Oct 2026" },
    { id: "PO-303", supplier: "Surat Silk Desk", product: "Saree C", qty: 60, cost: 108000, status: "Inspection", date: "04 Nov 2026" },
    { id: "PO-304", supplier: "Jaipur Loom House", product: "Co-ord D", qty: 120, cost: 144000, status: "In transit", date: "08 Nov 2026" },
    { id: "PO-305", supplier: "Ludhiana Denim", product: "Jeans H", qty: 40, cost: 32000, status: "Draft", date: "10 Nov 2026" },
  ],
  warehouses: [
    { id: "WH-01", name: "Central warehouse", city: "Gurugram", bins: 48, inbound: 2, outbound: 5, status: "Operating" },
    { id: "WH-02", name: "Returns bay", city: "Gurugram", bins: 8, inbound: 3, outbound: 0, status: "Inspection only" },
  ],
  inventory: [
    { id: "INV-01", sku: "KUR-001-M-RED", product: "Kurti A", size: "M", color: "Red", warehouse: "Central warehouse", onHand: 42, reserved: 6, available: 36, damaged: 0, reorderAt: 12 },
    { id: "INV-02", sku: "KUR-001-L-BLK", product: "Kurti A", size: "L", color: "Black", warehouse: "Central warehouse", onHand: 28, reserved: 2, available: 26, damaged: 1, reorderAt: 12 },
    { id: "INV-03", sku: "SUT-014-L-WIN", product: "Suit B", size: "L", color: "Wine", warehouse: "Central warehouse", onHand: 0, reserved: 0, available: 0, damaged: 2, reorderAt: 8 },
    { id: "INV-04", sku: "SAR-008-FR-MAR", product: "Saree C", size: "Free", color: "Maroon", warehouse: "Central warehouse", onHand: 18, reserved: 3, available: 15, damaged: 0, reorderAt: 10 },
    { id: "INV-05", sku: "CRD-003-S-SAG", product: "Co-ord D", size: "S", color: "Sage", warehouse: "Central warehouse", onHand: 12, reserved: 1, available: 11, damaged: 0, reorderAt: 12 },
    { id: "INV-06", sku: "DRS-021-M-BLS", product: "Dress E", size: "M", color: "Blush", warehouse: "Central warehouse", onHand: 9, reserved: 0, available: 9, damaged: 0, reorderAt: 10 },
    { id: "INV-07", sku: "DUP-006-FR-IVR", product: "Dupatta F", size: "Free", color: "Ivory", warehouse: "Central warehouse", onHand: 40, reserved: 4, available: 36, damaged: 0, reorderAt: 20 },
    { id: "INV-08", sku: "SUT-014-M-RET", product: "Suit B", size: "M", color: "Wine", warehouse: "Returns bay", onHand: 2, reserved: 0, available: 0, damaged: 2, reorderAt: 0 },
  ],
  orders: seedOrders,
  fulfilment: [
    { id: "FUL-18", order: "ORD-1048", brand: "Aisa Clothing", task: "Pack", assignee: "Packing desk", branding: "Partner label", status: "Packing" },
    { id: "FUL-17", order: "ORD-1047", brand: "Royal Ethnic", task: "Handover", assignee: "Dispatch desk", branding: "Company label", status: "Shipped" },
    { id: "FUL-16", order: "ORD-1046", brand: "Noor Fashion", task: "Pick", assignee: "Pick desk", branding: "Company label", status: "Waiting payment check" },
    { id: "FUL-15", order: "ORD-1042", brand: "Aisa Clothing", task: "Label", assignee: "Dispatch desk", branding: "Partner label", status: "Ready to ship" },
  ],
  shipments: [
    { id: "SHP-77", order: "ORD-1047", courier: "Delhivery", awb: "DLV8842101", charge: 79, status: "NDR", ndrReason: "Customer not available", attempts: 2 },
    { id: "SHP-76", order: "ORD-1045", courier: "Shiprocket", awb: "SR2291004", charge: 69, status: "Delivered", ndrReason: "", attempts: 1 },
    { id: "SHP-75", order: "ORD-1044", courier: "Delhivery", awb: "DLV8841008", charge: 89, status: "Delivered", ndrReason: "", attempts: 1 },
    { id: "SHP-74", order: "ORD-1040", courier: "Xpressbees", awb: "XB110293", charge: 59, status: "Delivered", ndrReason: "", attempts: 1 },
    { id: "SHP-73", order: "ORD-1043", courier: "Delhivery", awb: "DLV8839002", charge: 99, status: "RTO", ndrReason: "Refused at door", attempts: 3 },
  ],
  labels: [
    { id: "LBL-01", brand: "Aisa Clothing", type: "Neck label", artwork: "Approved", charge: 18, stock: 240, status: "Active" },
    { id: "LBL-02", brand: "Lotus Thread", type: "Hang tag", artwork: "Approved", charge: 12, stock: 40, status: "Paused" },
    { id: "LBL-03", brand: "Noor Fashion", type: "Neck label", artwork: "In review", charge: 18, stock: 0, status: "Pending approval" },
  ],
  packaging: [
    { id: "PKG-01", name: "Standard mailer", type: "Company", stock: 800, cost: 12, brands: "All company-label brands", status: "Available" },
    { id: "PKG-02", name: "Aisa printed box", type: "Partner", stock: 60, cost: 35, brands: "Aisa Clothing", status: "Available" },
    { id: "PKG-03", name: "Thank-you card", type: "Partner", stock: 140, cost: 6, brands: "Aisa Clothing, Royal Ethnic", status: "Available" },
    { id: "PKG-04", name: "Festive sleeve", type: "Partner", stock: 8, cost: 22, brands: "Noor Fashion", status: "Low" },
  ],
  returns: [
    { id: "RET-12", order: "ORD-1043", brand: "Noor Fashion", reason: "Size mismatch", condition: "Damaged", refund: 4000, status: "Inspection" },
    { id: "RET-11", order: "ORD-1032", brand: "Aisa Clothing", reason: "Colour difference", condition: "Good", refund: 2000, status: "Restock approved" },
    { id: "RET-10", order: "ORD-1028", brand: "Royal Ethnic", reason: "Changed mind", condition: "Good", refund: 3499, status: "Refunded" },
    { id: "RET-09", order: "ORD-1021", brand: "Noor Fashion", reason: "Stitch issue", condition: "Damaged", refund: 2599, status: "Pending approval" },
  ],
  customers: [
    { id: "CUS-01", label: "Customer · Delhi", brand: "Aisa Clothing", orders: 2, spend: 4000, returns: 0, phone: "+91 98111 00001" },
    { id: "CUS-02", label: "Customer · Jaipur", brand: "Royal Ethnic", orders: 1, spend: 3499, returns: 0, phone: "+91 98111 00002" },
    { id: "CUS-03", label: "Customer · Lucknow", brand: "Noor Fashion", orders: 1, spend: 2599, returns: 0, phone: "+91 98111 00003" },
    { id: "CUS-04", label: "Customer · Pune", brand: "Aisa Clothing", orders: 1, spend: 1799, returns: 0, phone: "+91 98111 00004" },
    { id: "CUS-05", label: "Customer · Kanpur", brand: "Noor Fashion", orders: 1, spend: 4000, returns: 1, phone: "+91 98111 00005" },
    { id: "CUS-06", label: "Customer · Chandigarh", brand: "Royal Ethnic", orders: 1, spend: 1398, returns: 0, phone: "+91 98111 00006" },
  ],
  payments: [
    { id: "PAY-501", order: "ORD-1048", method: "UPI", amount: 2000, status: "Captured", reference: "UPI-88421" },
    { id: "PAY-500", order: "ORD-1047", method: "Card", amount: 3499, status: "Captured", reference: "CRD-22910" },
    { id: "PAY-499", order: "ORD-1046", method: "COD", amount: 2599, status: "Pending", reference: "COD-1046" },
    { id: "PAY-498", order: "ORD-1045", method: "UPI", amount: 1799, status: "Captured", reference: "UPI-77102" },
    { id: "PAY-497", order: "ORD-1043", method: "UPI", amount: 4000, status: "Refunded", reference: "UPI-66091" },
    { id: "PAY-496", order: "ORD-1039", method: "UPI", amount: 2000, status: "Failed", reference: "UPI-FAIL-19" },
  ],
  expenses: [
    { id: "EXP-01", head: "Product sourcing", amount: 300000, month: "Oct 2026", note: "PO-301 Kurti A" },
    { id: "EXP-02", head: "Courier", amount: 395, month: "Nov 2026", note: "Five sample shipments" },
    { id: "EXP-03", head: "Packaging", amount: 2400, month: "Nov 2026", note: "Mailers and cards" },
    { id: "EXP-04", head: "Gateway", amount: 186, month: "Nov 2026", note: "Captured UPI and card fees" },
    { id: "EXP-05", head: "Refunds", amount: 4000, month: "Nov 2026", note: "ORD-1043 — tracked in refunds, excluded from ops expense total" },
    { id: "EXP-06", head: "Warehouse", amount: 45000, month: "Nov 2026", note: "Gurugram rent share" },
    { id: "EXP-07", head: "Marketing", amount: 12000, month: "Nov 2026", note: "Festive campaign boost" },
  ],
  settlements: [
    { id: "SET-14", partner: "Aisa Studio", sales: 7298, supply: 5950, margin: 1348, adjustments: 0, status: "Pending", date: "10 Nov 2026" },
    { id: "SET-13", partner: "Royal Ethnic House", sales: 7496, supply: 5900, margin: 1596, adjustments: 0, status: "Approved", date: "08 Nov 2026" },
    { id: "SET-12", partner: "Noor Fashion Desk", sales: 6599, supply: 5500, margin: 1099, adjustments: 4000, status: "On hold", date: "06 Nov 2026" },
    { id: "SET-11", partner: "Aisa Studio", sales: 6400, supply: 5100, margin: 1300, adjustments: 0, status: "Paid", date: "28 Oct 2026" },
  ],
  campaigns: [
    { id: "CMP-01", name: "Festive kurtis", scope: "Platform", discount: "10%", starts: "01 Nov 2026", ends: "20 Nov 2026", status: "Live" },
    { id: "CMP-02", name: "Aisa welcome", scope: "Aisa Clothing", discount: "₹150", starts: "05 Nov 2026", ends: "30 Nov 2026", status: "Live" },
    { id: "CMP-03", name: "Saree weekend", scope: "Royal Ethnic", discount: "8%", starts: "14 Nov 2026", ends: "16 Nov 2026", status: "Scheduled" },
    { id: "CMP-04", name: "Clearance tops", scope: "Lotus Thread", discount: "20%", starts: "01 Oct 2026", ends: "31 Oct 2026", status: "Ended" },
  ],
  courses: [
    { id: "CRS-01", title: "Starting a clothing brand", lessons: 6, partners: 4, status: "Published" },
    { id: "CRS-02", title: "Instagram marketing", lessons: 8, partners: 3, status: "Published" },
    { id: "CRS-03", title: "Pricing and margin", lessons: 4, partners: 2, status: "Published" },
    { id: "CRS-04", title: "Customer support", lessons: 3, partners: 1, status: "Draft" },
  ],
  tickets: ticketsSeed,
  supportAgents: supportAgentsSeed,
  ticketCategories: ticketCategoriesSeed,
  notices: [
    { id: "NTC-01", title: "New order ORD-1048", channel: "In-app", audience: "Operations", status: "Delivered" },
    { id: "NTC-02", title: "Kurti A size M is low", channel: "In-app", audience: "Inventory", status: "Delivered" },
    { id: "NTC-03", title: "Payment failed on ORD-1039", channel: "Email", audience: "Finance", status: "Delivered" },
    { id: "NTC-04", title: "Partner announcement draft", channel: "In-app", audience: "Partners", status: "Draft" },
    { id: "NTC-05", title: "Shipment DLV8842101 has no new scan", channel: "SMS", audience: "Dispatch", status: "Failed" },
  ],
  staff: [
    { id: "STF-01", desk: "Platform owner", department: "Management", role: "Super Admin", status: "Active" },
    { id: "STF-02", desk: "Operations desk", department: "Operations", role: "Operations Manager", status: "Active" },
    { id: "STF-03", desk: "Catalogue desk", department: "Catalogue", role: "Product Manager", status: "Active" },
    { id: "STF-04", desk: "Pick desk", department: "Warehouse", role: "Warehouse Staff", status: "Active" },
    { id: "STF-05", desk: "Finance desk", department: "Finance", role: "Finance Manager", status: "Active" },
    { id: "STF-06", desk: "Support desk", department: "Support", role: "Customer Support", status: "Active" },
  ],
  roles: [
    { id: "ROL-01", name: "Super Admin", access: "Full platform", people: 1 },
    { id: "ROL-02", name: "Operations Manager", access: "Orders, fulfilment, shipping", people: 1 },
    { id: "ROL-03", name: "Product Manager", access: "Catalogue, pricing, suppliers", people: 1 },
    { id: "ROL-04", name: "Inventory Manager", access: "Inventory, warehouses, purchasing", people: 1 },
    { id: "ROL-05", name: "Warehouse Staff", access: "Pick, pack, stock scan", people: 1 },
    { id: "ROL-06", name: "Finance Manager", access: "Payments, expenses, settlements", people: 1 },
    { id: "ROL-07", name: "Customer Support", access: "Tickets, customers, returns", people: 1 },
    { id: "ROL-08", name: "Marketing Manager", access: "Campaigns, academy, notices", people: 0 },
  ],
  audit: [
    { id: "AUD-01", when: "10 Nov 2026 · 18:40", actor: "Platform owner", what: "Opened the sample operating picture", detail: "Local file, not a database" },
    { id: "AUD-02", when: "09 Nov 2026 · 11:15", actor: "Catalogue desk", what: "Kurti A supply price confirmed at ₹1,700", detail: "Existing orders keep their own price" },
    { id: "AUD-03", when: "08 Nov 2026 · 16:02", actor: "Operations desk", what: "Aisa neck label approved", detail: "Applies to new orders only" },
    { id: "AUD-04", when: "02 Nov 2026 · 09:20", actor: "Support desk", what: "Zari application left pending", detail: "Storefront stays unpublished" },
  ],
  inspections: [
    { id: "QC-01", type: "Inbound", ref: "PO-303", product: "Saree C", qty: 60, result: "Pending", inspector: "Returns bay", notes: "Drape and colour check" },
    { id: "QC-02", type: "Return", ref: "RET-12", product: "Kurti A", qty: 2, result: "Pending", inspector: "Returns bay", notes: "Reported damaged on arrival" },
    { id: "QC-03", type: "Inbound", ref: "PO-301", product: "Kurti A", qty: 200, result: "Pass", inspector: "Central warehouse", notes: "Received 02 Oct" },
    { id: "QC-04", type: "Packaging", ref: "PKG-04", product: "Festive sleeve", qty: 8, result: "Fail", inspector: "Packing desk", notes: "Print rubs off. Stock left as Low." },
  ],
  integrations: integrationsSeedRows(),
  settings: structuredClone(DEFAULT_SETTINGS),
};

export function inr(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function sum(rows, key) {
  return rows.reduce((total, row) => total + Number(row[key] || 0), 0);
}
