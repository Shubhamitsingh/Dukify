import { addDays, ANCHOR } from "../lib/metrics.js";

const catalogue = [
  ["Rosewood Silk Kurta", "Kurtas", 1700, 2499, 2199, "#9f1239", "Silk blend", "Dry clean", 86, "2026-09-12"],
  ["Ivory Chanderi Saree", "Sarees", 2200, 3499, 2999, "#d6d3d1", "Chanderi", "Dry clean", 40, "2026-09-14"],
  ["Midnight Georgette Gown", "Dresses", 2800, 4499, 3999, "#1e1b4b", "Georgette", "Dry clean", 22, "2026-09-18"],
  ["Pearl Cotton Shirt", "Shirts", 900, 1499, 1299, "#e7e5e4", "Cotton", "Machine wash cold", 120, "2026-09-20"],
  ["Indigo Straight Denim", "Denim", 1100, 1999, 1699, "#1e3a8a", "Denim", "Machine wash cold", 74, "2026-09-22"],
  ["Saffron Block Kurta", "Kurtas", 1400, 2199, 1899, "#c2410c", "Cotton", "Machine wash cold", 64, "2026-09-28"],
  ["Lotus Tissue Saree", "Sarees", 2600, 3999, 3499, "#fb7185", "Tissue", "Dry clean", 28, "2026-10-01"],
  ["Cedar Linen Shirt", "Shirts", 950, 1599, 1399, "#a16207", "Linen", "Gentle wash", 58, "2026-10-02"],
  ["Blush Wrap Dress", "Dresses", 1800, 2799, 2499, "#fb7185", "Crepe", "Dry clean", 36, "2026-10-04"],
  ["Olive Cargo Denim", "Denim", 1200, 2099, 1799, "#3f6212", "Denim", "Machine wash cold", 41, "2026-10-05"],
  ["Gold Hoop Set", "Accessories", 400, 799, 699, "#ca8a04", "Brass", "Wipe clean", 150, "2026-10-06"],
  ["Marble Kolhapuri Flats", "Footwear", 800, 1499, 1299, "#d6d3d1", "Leather", "Wipe clean", 0, "2026-10-08"],
  ["Emerald Festive Set", "Ethnic sets", 2400, 3899, 3399, "#047857", "Silk blend", "Dry clean", 19, "2026-10-09"],
  ["Cloud Organza Kurta", "Kurtas", 1600, 2499, 2099, "#e0e7ff", "Organza", "Dry clean", 47, "2026-10-11"],
  ["Neel Handloom Saree", "Sarees", 2100, 3299, 2899, "#1d4ed8", "Handloom cotton", "Dry clean", 33, "2026-10-12"],
  ["Taupe Wide-leg Denim", "Denim", 1300, 2199, 1899, "#78716c", "Denim", "Machine wash cold", 52, "2026-10-14"],
  ["Coral Slip Dress", "Dresses", 1500, 2399, 2099, "#fb7185", "Satin", "Dry clean", 27, "2026-10-16"],
  ["Ink Oxford Shirt", "Shirts", 850, 1399, 1199, "#0f172a", "Cotton", "Machine wash cold", 98, "2026-10-18"],
  ["Heritage Juttis", "Footwear", 700, 1299, 1099, "#b45309", "Leather", "Wipe clean", 44, "2026-10-20"],
  ["Pearl Stud Edit", "Accessories", 350, 699, 599, "#f5f5f4", "Alloy", "Wipe clean", 3, "2026-10-22"],
  ["Maroon Bandhani Set", "Ethnic sets", 2300, 3699, 3199, "#9f1239", "Modal silk", "Dry clean", 16, "2026-10-24"],
  ["Mist Printed Kurta", "Kurtas", 1250, 1999, 1699, "#94a3b8", "Cotton", "Machine wash cold", 70, "2026-10-26"],
  ["Champagne Satin Saree", "Sarees", 3000, 4799, 4299, "#e7e5e4", "Satin", "Dry clean", 14, "2026-10-28"],
  ["Forest Shirt Dress", "Dresses", 1900, 2999, 2599, "#14532d", "Cotton", "Machine wash cold", 24, "2026-10-30"],
  ["Stonewash Slim Denim", "Denim", 1150, 1899, 1699, "#64748b", "Denim", "Machine wash cold", 61, "2026-11-01"],
  ["Sand Resort Shirt", "Shirts", 880, 1499, 1299, "#d6d3d1", "Cotton", "Machine wash cold", 77, "2026-11-02"],
  ["Black Block Heels", "Footwear", 1100, 1999, 1699, "#111827", "Leather", "Wipe clean", 18, "2026-11-04"],
  ["Ruby Choker", "Accessories", 600, 1199, 999, "#be123c", "Brass", "Wipe clean", 39, "2026-11-05"],
  ["Ivory Anarkali Set", "Ethnic sets", 2700, 4299, 3799, "#fafaf9", "Georgette", "Dry clean", 12, "2026-11-06"],
  ["Lilac Everyday Kurta", "Kurtas", 980, 1699, 1499, "#c4b5fd", "Cotton", "Machine wash cold", 54, "2026-11-08"],
];

function sizesFor(category) {
  if (category === "Footwear") return ["36", "37", "38", "39", "40"];
  if (category === "Accessories" || category === "Sarees") return ["Free"];
  return ["S", "M", "L", "XL"];
}

export const products = catalogue.map((row, index) => {
  const [name, category, supplyPrice, mrp, suggestedRetail, color, fabric, care, stock, addedOn] = row;
  const id = `p${String(index + 1).padStart(2, "0")}`;
  const sku = `PAH-${category.slice(0, 3).toUpperCase()}-${String(index + 1).padStart(3, "0")}`;
  const sizes = sizesFor(category);
  return {
    id,
    name,
    sku,
    category,
    supplyPrice,
    mrp,
    suggestedRetail,
    color,
    fabric,
    care,
    stock,
    addedOn,
    approval: index >= 28 ? "Pending approval" : "Approved",
    description: `${name} is part of the central Dukify fashion catalogue. Fabric, imagery, and variants are maintained by the platform.`,
    specs: { fabric, care, origin: "Central catalogue", occasion: category === "Ethnic sets" || category === "Sarees" ? "Festive" : "Everyday" },
    variants: sizes.map((size, sizeIndex) => ({
      id: `${id}-${size}`,
      size,
      sku: `${sku}-${size}`,
      stock: Math.max(0, stock - sizeIndex * 3),
    })),
  };
});

const brandSeed = [
  {
    id: "brand-k",
    name: "Brand K",
    legalName: "Brand K Atelier Pvt Ltd",
    contactName: "Kavya Menon",
    email: "brandk@pahachan.test",
    phone: "+91 98200 11021",
    city: "Mumbai",
    state: "Maharashtra",
    pin: "400001",
    gstin: "27BKATL1234F1Z5",
    status: "Live",
    commissionRate: 0.08,
    gatewayRate: 0.018,
    shippingShare: 49,
    maxDiscount: 0.2,
    domain: "brandk.dukify.store",
    since: "2025-06-12",
    focus: "Contemporary ethnic",
    about: "Brand K designs contemporary ethnic wear for city wardrobes, with a rose and ivory palette.",
    bank: { holder: "Brand K Atelier Pvt Ltd", bank: "HDFC Bank", account: "XXXX XX12 4581", ifsc: "HDFC0000123" },
    teamEnabled: true,
    color: "#9f1239",
    productIds: products.slice(0, 18).map((product) => product.id),
    featured: ["p01", "p02", "p07", "p13"],
    priceFactor: 1,
  },
  {
    id: "aura-loom",
    name: "Aura Loom",
    legalName: "Aura Loom Jaipur LLP",
    contactName: "Meera Shah",
    email: "meera@auraloom.test",
    phone: "+91 98290 44110",
    city: "Jaipur",
    state: "Rajasthan",
    pin: "302001",
    gstin: "08AURAL4455P1Z2",
    status: "Live",
    commissionRate: 0.1,
    gatewayRate: 0.018,
    shippingShare: 59,
    maxDiscount: 0.15,
    domain: "auraloom.dukify.store",
    since: "2025-08-02",
    focus: "Handloom colour",
    about: "Aura Loom works with festive colour and handloom silhouettes.",
    bank: { holder: "Aura Loom Jaipur LLP", bank: "ICICI Bank", account: "XXXX XX88 2201", ifsc: "ICIC0000881" },
    teamEnabled: false,
    color: "#c2410c",
    productIds: ["p02", "p06", "p07", "p13", "p15", "p21", "p23", "p29"],
    featured: ["p07", "p15"],
    priceFactor: 0.97,
  },
  {
    id: "niva",
    name: "Niva Studio",
    legalName: "Niva Studio Retail Pvt Ltd",
    contactName: "Ananya Rao",
    email: "ananya@nivastudio.test",
    phone: "+91 98450 22881",
    city: "Bengaluru",
    state: "Karnataka",
    pin: "560001",
    gstin: "29NIVA7781Q1Z8",
    status: "Live",
    commissionRate: 0.06,
    gatewayRate: 0.02,
    shippingShare: 39,
    maxDiscount: 0.18,
    domain: "niva.dukify.store",
    since: "2025-11-19",
    focus: "Everyday dresses",
    about: "Niva Studio edits easy dresses and shirts for warm-weather wardrobes.",
    bank: { holder: "Niva Studio Retail Pvt Ltd", bank: "Axis Bank", account: "XXXX XX44 9012", ifsc: "UTIB0000442" },
    teamEnabled: false,
    color: "#be185d",
    productIds: ["p03", "p04", "p08", "p09", "p17", "p18", "p24", "p26"],
    featured: ["p03", "p09"],
    priceFactor: 1.04,
  },
  {
    id: "lumen",
    name: "House of Lumen",
    legalName: "House of Lumen Pvt Ltd",
    contactName: "Rhea Kapoor",
    email: "rhea@lumen.test",
    phone: "+91 98100 77331",
    city: "New Delhi",
    state: "Delhi",
    pin: "110001",
    gstin: "07LUMEN2201K1Z4",
    status: "Live",
    commissionRate: 0.12,
    gatewayRate: 0.018,
    shippingShare: 69,
    maxDiscount: 0.12,
    domain: "lumen.dukify.store",
    since: "2026-01-09",
    focus: "Tailored denim",
    about: "House of Lumen keeps a sharp denim and shirt edit.",
    bank: { holder: "House of Lumen Pvt Ltd", bank: "Kotak Mahindra Bank", account: "XXXX XX19 3300", ifsc: "KKBK0000191" },
    teamEnabled: false,
    color: "#1e3a8a",
    productIds: ["p04", "p05", "p10", "p16", "p18", "p25", "p08", "p27"],
    featured: ["p05", "p16"],
    priceFactor: 1.08,
  },
  {
    id: "mogra",
    name: "Mogra Label",
    legalName: "Mogra Label Traders",
    contactName: "Ishaan Desai",
    email: "ishaan@mogra.test",
    phone: "+91 98250 66012",
    city: "Ahmedabad",
    state: "Gujarat",
    pin: "380001",
    gstin: "24MOGRA6612D1Z1",
    status: "In review",
    commissionRate: 0.09,
    gatewayRate: 0.018,
    shippingShare: 49,
    maxDiscount: 0.15,
    domain: "mogra.dukify.store",
    since: "2026-09-01",
    focus: "Accessories and festive sets",
    about: "Mogra Label is preparing a festive accessories and ethnic edit.",
    bank: { holder: "Mogra Label Traders", bank: "State Bank of India", account: "XXXX XX77 1455", ifsc: "SBIN0000771" },
    teamEnabled: false,
    color: "#a16207",
    productIds: ["p11", "p19", "p20", "p21", "p28", "p13", "p01"],
    featured: ["p11", "p21"],
    priceFactor: 0.95,
  },
];

function clampPrice(product, value) {
  return Math.min(product.mrp, Math.max(product.supplyPrice, Math.round(value)));
}

export const brands = brandSeed.map((brand) => {
  const pricing = {};
  brand.productIds.forEach((id) => {
    const product = products.find((item) => item.id === id);
    pricing[id] = clampPrice(product, product.suggestedRetail * brand.priceFactor);
  });
  return {
    ...brand,
    pricing,
    address: `${brand.city}, ${brand.state} ${brand.pin}`,
    team: brand.teamEnabled
      ? [
          { id: "tm-1", name: brand.contactName, email: brand.email, role: "Owner" },
          { id: "tm-2", name: "Neel Arora", email: "neel@brandk.test", role: "Marketing" },
        ]
      : [],
  };
});

const people = [
  ["Aisha Qureshi", "Mumbai"],
  ["Rohan Iyer", "Pune"],
  ["Sara Kapoor", "Mumbai"],
  ["Dev Malhotra", "Delhi"],
  ["Myra Sen", "Kolkata"],
  ["Kabir Das", "Mumbai"],
  ["Inaaya Shah", "Surat"],
  ["Vivaan Joshi", "Bengaluru"],
  ["Zara Khan", "Hyderabad"],
  ["Arjun Mehta", "Mumbai"],
  ["Kiara Nair", "Kochi"],
  ["Reyansh Gill", "Chandigarh"],
  ["Anvi Bose", "Mumbai"],
  ["Shaurya Jain", "Jaipur"],
  ["Mira Dutta", "Mumbai"],
  ["Yash Varma", "Lucknow"],
  ["Navya Kulkarni", "Pune"],
  ["Omar Siddiqui", "Mumbai"],
  ["Meher Bhatt", "Jaipur"],
  ["Tara Singh", "Udaipur"],
  ["Laksh Chawla", "Jaipur"],
  ["Diya Reddy", "Bengaluru"],
  ["Harsh Pandey", "Mysuru"],
  ["Sana Iqbal", "Bengaluru"],
  ["Aditi Khanna", "Delhi"],
  ["Nikhil Grover", "Gurugram"],
  ["Ritu Ahluwalia", "Delhi"],
  ["Parth Trivedi", "Ahmedabad"],
  ["Hetal Shah", "Ahmedabad"],
  ["Manav Patel", "Vadodara"],
];

const customerBrands = [
  ...Array(18).fill("brand-k"),
  ...Array(3).fill("aura-loom"),
  ...Array(3).fill("niva"),
  ...Array(3).fill("lumen"),
  ...Array(3).fill("mogra"),
];

export const customers = people.map(([name, city], index) => {
  const brandId = customerBrands[index];
  const slug = name.toLowerCase().replace(/[^a-z]+/g, ".");
  return {
    id: `c${String(index + 1).padStart(2, "0")}`,
    brandId,
    name,
    email: `${slug}@mail.test`,
    phone: `+91 98${String(20000000 + index * 173).slice(0, 8)}`,
    city,
    since: addDays("2026-09-01", index % 50),
  };
});

function buildBrandOrders(brand, plan) {
  const pool = customers.filter((customer) => customer.brandId === brand.id);
  const selected = brand.productIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product) => product.approval === "Approved" && product.stock > 0);
  return plan.map((item, index) => {
    const product = selected[index % selected.length];
    const customer = pool[index % pool.length];
    const retailUnit = brand.pricing[product.id];
    return {
      id: item.id,
      brandId: brand.id,
      customerId: customer.id,
      productId: product.id,
      date: addDays(ANCHOR, -item.daysAgo),
      qty: item.qty,
      retailUnit,
      supplyUnit: product.supplyPrice,
      discount: item.discount,
      status: item.status,
      paymentStatus: item.payment,
      courier: ["Shipped", "Delivered", "Return requested"].includes(item.status) ? "Dukify Logistics" : "",
      awb: ["Shipped", "Delivered", "Return requested"].includes(item.status) ? `AWB${item.id.replace(/\D/g, "")}` : "",
      note: item.note || "",
    };
  });
}

const brandKPlan = [
  ["New", 0, "Paid", 1, 0],
  ["New", 0, "Pending", 2, 0],
  ["New", 1, "Paid", 1, 150],
  ["New", 2, "Paid", 1, 0],
  ["Confirmed", 1, "Paid", 1, 0],
  ["Confirmed", 3, "Paid", 2, 200],
  ["Confirmed", 4, "Pending", 1, 0],
  ["Confirmed", 6, "Paid", 1, 0],
  ["Processing", 2, "Paid", 1, 0],
  ["Processing", 5, "Paid", 1, 100],
  ["Processing", 8, "Paid", 2, 0],
  ["Processing", 9, "Pending", 1, 0],
  ["Packed", 3, "Paid", 1, 0],
  ["Packed", 7, "Paid", 1, 0],
  ["Packed", 11, "Paid", 1, 0],
  ["Shipped", 4, "Paid", 1, 0],
  ["Shipped", 6, "Paid", 2, 250],
  ["Shipped", 10, "Paid", 1, 0],
  ["Shipped", 12, "Paid", 1, 0],
  ["Shipped", 14, "Pending", 1, 0],
  ["Delivered", 8, "Paid", 1, 0],
  ["Delivered", 13, "Paid", 2, 0],
  ["Delivered", 16, "Paid", 1, 180],
  ["Delivered", 18, "Paid", 1, 0],
  ["Delivered", 21, "Paid", 1, 0],
  ["Delivered", 28, "Paid", 2, 0],
  ["Delivered", 34, "Paid", 1, 0],
  ["Delivered", 40, "Refunded", 1, 0],
  ["Cancelled", 2, "Refunded", 1, 0],
  ["Cancelled", 15, "Failed", 1, 0],
  ["Return requested", 9, "Paid", 1, 0],
  ["Return requested", 20, "Refunded", 1, 0],
].map((row, index) => ({
  id: `ORD-26${String(index + 1).padStart(3, "0")}`,
  status: row[0],
  daysAgo: row[1],
  payment: row[2],
  qty: row[3],
  discount: row[4],
  note: row[0] === "Return requested" ? "Customer asked for a size exchange. Fulfilment is with Dukify." : "",
}));

const otherPlans = {
  "aura-loom": [
    ["Delivered", 12, "Paid", 1, 0],
    ["Delivered", 30, "Paid", 1, 0],
    ["Shipped", 5, "Paid", 1, 0],
    ["New", 1, "Paid", 1, 0],
    ["Processing", 3, "Paid", 1, 0],
  ],
  niva: [
    ["Delivered", 9, "Paid", 1, 0],
    ["Delivered", 22, "Paid", 2, 100],
    ["Shipped", 4, "Paid", 1, 0],
    ["Confirmed", 2, "Pending", 1, 0],
  ],
  lumen: [
    ["Delivered", 15, "Paid", 1, 0],
    ["Delivered", 36, "Paid", 1, 0],
    ["Packed", 6, "Paid", 1, 0],
    ["New", 0, "Paid", 1, 0],
    ["Cancelled", 11, "Refunded", 1, 0],
  ],
  mogra: [
    ["Delivered", 18, "Paid", 1, 0],
    ["New", 1, "Pending", 1, 0],
    ["Confirmed", 7, "Paid", 1, 0],
    ["Shipped", 8, "Paid", 1, 0],
  ],
};

let sequence = brandKPlan.length;
function planRows(rows) {
  return rows.map((row) => {
    sequence += 1;
    return {
      id: `ORD-26${String(sequence).padStart(3, "0")}`,
      status: row[0],
      daysAgo: row[1],
      payment: row[2],
      qty: row[3],
      discount: row[4],
      note: "",
    };
  });
}

export const orders = [
  ...buildBrandOrders(brands[0], brandKPlan),
  ...brands.slice(1).flatMap((brand) => buildBrandOrders(brand, planRows(otherPlans[brand.id]))),
];

export const traffic = brands.flatMap((brand) => {
  const base = brand.id === "brand-k" ? 180 : brand.id === "mogra" ? 40 : 90;
  return Array.from({ length: 45 }, (_, index) => {
    const date = addDays(ANCHOR, -(44 - index));
    const wave = 1 + ((index * 17 + brand.name.length) % 9) / 20;
    const visits = Math.round(base * wave);
    return {
      id: `${brand.id}-${date}`,
      brandId: brand.id,
      date,
      visits,
      views: Math.round(visits * 2.4),
      carts: Math.round(visits * 0.08),
    };
  });
});

const noticeTemplates = [
  ["order", "New order received", "A customer placed an order on your storefront."],
  ["order", "Shipment update", "Dukify marked an order as shipped. Tracking is now available."],
  ["product", "Catalogue availability", "A selected product is low on central stock."],
  ["payment", "Settlement window", "November earnings are waiting for central settlement approval."],
  ["store", "Storefront draft", "Your homepage draft has unpublished banner changes."],
  ["announcement", "Platform note", "Festive dispatch cut-off is 18 Nov 2026. Fulfilment stays with Dukify."],
];

export const notifications = brands.flatMap((brand, brandIndex) =>
  noticeTemplates.map((template, index) => ({
    id: `nt-${brand.id}-${index + 1}`,
    brandId: brand.id,
    type: template[0],
    title: template[1],
    body: template[2],
    at: `${addDays(ANCHOR, -(index + brandIndex))}T0${8 + index}:15:00`,
    read: index > 2,
  })),
);

export const tickets = [
  {
    id: "TCK-1042",
    brandId: "brand-k",
    topic: "Orders",
    subject: "Exchange request for ORD-26031",
    message: "Customer wants a size exchange. Please confirm the central return desk has the request.",
    status: "Open",
    priority: "Medium",
    createdAt: "2026-11-09T11:20:00",
    replies: [{ at: "2026-11-09T15:00:00", from: "Dukify Support", text: "The return is in the central queue. We will update the refund status here." }],
  },
  {
    id: "TCK-1033",
    brandId: "brand-k",
    topic: "Pricing",
    subject: "MRP check on Ivory Chanderi Saree",
    message: "Can the permitted MRP be confirmed before the festive campaign?",
    status: "Resolved",
    priority: "Low",
    createdAt: "2026-10-22T09:10:00",
    replies: [{ at: "2026-10-22T12:40:00", from: "Dukify Support", text: "MRP on the catalogue record is final. You can price at or below it." }],
  },
  {
    id: "TCK-1018",
    brandId: "aura-loom",
    topic: "Products",
    subject: "Request handloom colourway",
    message: "Please consider a saffron colourway for the tissue saree.",
    status: "Open",
    priority: "Low",
    createdAt: "2026-11-02T10:00:00",
    replies: [],
  },
];

export const coupons = [
  { id: "cp-k-1", brandId: "brand-k", code: "WELCOME10", type: "percent", value: 10, minOrder: 1499, status: "Active", uses: 18 },
  { id: "cp-k-2", brandId: "brand-k", code: "FESTIVE15", type: "percent", value: 15, minOrder: 2999, status: "Scheduled", uses: 0 },
  { id: "cp-a-1", brandId: "aura-loom", code: "LOOM10", type: "percent", value: 10, minOrder: 1999, status: "Active", uses: 6 },
  { id: "cp-n-1", brandId: "niva", code: "NIVA500", type: "flat", value: 500, minOrder: 2499, status: "Active", uses: 4 },
];

export const campaigns = [
  { id: "cm-k-1", brandId: "brand-k", name: "Diwali edit", channel: "Storefront", status: "Active", start: "2026-10-20", end: "2026-11-16", note: "Features ethnic sets and sarees within the 20% discount cap." },
  { id: "cm-k-2", brandId: "brand-k", name: "New drop stories", channel: "Instagram", status: "Scheduled", start: "2026-11-14", end: "2026-11-21", note: "Demo social campaign. Spend is not connected to an ad account." },
  { id: "cm-k-3", brandId: "brand-k", name: "Denim week", channel: "Storefront", status: "Ended", start: "2026-09-12", end: "2026-09-20", note: "Completed demo promotion." },
  { id: "cm-n-1", brandId: "niva", name: "Weekend dresses", channel: "Storefront", status: "Active", start: "2026-11-01", end: "2026-11-18", note: "Dress edit for Niva Studio." },
];

export const assets = [
  { id: "as-1", name: "Festive hero 1600×900", kind: "Banner", note: "Rose and ivory layout for Brand K." },
  { id: "as-2", name: "Square product frame", kind: "Social", note: "Use catalogue images only. Do not redraw central product photography." },
  { id: "as-3", name: "Story cover", kind: "Social", note: "Brand colour, logo, and one featured product." },
];

export const lessons = [
  { id: "ls-1", group: "start", title: "How a Dukify brand store works", minutes: 6, body: "You sell through your own storefront. Dukify owns the catalogue source, suppliers, warehouses, packing, shipping, and returns. Your work is brand, price within the allowed band, marketing, and customer relationships." },
  { id: "ls-2", group: "setup", title: "Publish the first storefront", minutes: 8, body: "Add a logo, colours, hero banner, featured products, and footer. Save a draft, preview desktop and mobile, then publish. Checkout, tax, and couriers stay locked." },
  { id: "ls-3", group: "marketing", title: "Plan a promotion inside the rules", minutes: 7, body: "Coupons cannot drop a product below its supply price or exceed your brand discount cap. Central pricing approval still applies." },
  { id: "ls-4", group: "selling", title: "Read a product before you list it", minutes: 5, body: "Check approval, stock, variants, MRP, and supply price. Estimated gross margin is retail minus supply. It is not the final settlement." },
  { id: "ls-5", group: "growth", title: "Watch the weekly numbers", minutes: 6, body: "Use orders, conversion, and repeat customers together. A high visit count with weak orders usually means the hero or the price, not the warehouse." },
  { id: "ls-6", group: "videos", title: "Storefront editor walkthrough", minutes: 4, body: "This demo lesson stands in for a training video. The steps match the Storefront Editor in this portal." },
  { id: "ls-7", group: "announcements", title: "Festive dispatch cut-off", minutes: 2, body: "Orders placed after 18 Nov 2026 may move to the next dispatch cycle. You will see status changes here. You cannot mark packing or shipping complete." },
];

export const faqs = [
  { q: "Can I update inventory myself?", a: "No. Stock is a central record. You can read availability and request a catalogue change." },
  { q: "Why is estimated earnings different from the settlement?", a: "Estimated earnings deduct the demo commission, gateway, and shipping share. Refunds remove the earning. Dukify approves the final settlement." },
  { q: "Who ships the order?", a: "Dukify fulfilment ships it. You can track status, AWB, and delivery. You cannot mark those steps done." },
  { q: "Can I see another brand's customers?", a: "No. The portal only loads the signed-in brand. The demo switcher is a development tool and is not a production permission." },
];

export const documents = [
  { id: "doc-1", name: "Brand collaboration agreement", status: "Verified", updated: "2025-06-12" },
  { id: "doc-2", name: "GST registration", status: "Verified", updated: "2025-06-18" },
  { id: "doc-3", name: "Cancelled cheque", status: "Verified", updated: "2025-06-18" },
];

export function defaultStorefront(brand) {
  return {
    logoText: brand.name,
    faviconText: brand.name.slice(0, 1),
    color: brand.color,
    ink: "#111827",
    font: "Inter",
    heroTitle: `${brand.name} — new season`,
    heroText: brand.about,
    about: brand.about,
    footer: `© 2026 ${brand.legalName}. Fulfilled by Dukify.`,
    domain: brand.domain,
    banners: [
      { id: "b1", title: "Festive edit", subtitle: "Selected styles, limited dispatch window" },
      { id: "b2", title: "New on the floor", subtitle: "Fresh catalogue styles you have listed" },
    ],
    sections: [
      { id: "hero", label: "Hero banner", enabled: true },
      { id: "featured", label: "Featured products", enabled: true },
      { id: "about", label: "About the brand", enabled: true },
      { id: "footer", label: "Footer", enabled: true },
    ],
    links: [
      { id: "l1", label: "New", href: "/new" },
      { id: "l2", label: "Ethnic", href: "/ethnic" },
      { id: "l3", label: "About", href: "/about" },
    ],
  };
}

export const FONTS = ["Inter", "Georgia", "Iowan Old Style", "Palatino"];
