import { sum } from "./data";

export function nextId(rows) {
  const sample = rows[0]?.id || "ID-1";
  const width = (sample.match(/(\d+)$/) || ["", "1"])[1].length;
  const max = rows.reduce((best, row) => {
    const value = Number((String(row.id).match(/(\d+)$/) || ["", "0"])[1]);
    return Math.max(best, value);
  }, 0);
  return `${sample.replace(/\d+$/, "")}${String(max + 1).padStart(width, "0")}`;
}

export const blanks = {
  brands: { name: "", partner: "", email: "", phone: "", domain: "", category: "Ethnic wear", status: "Draft", description: "" },
  partners: { name: "", brand: "", email: "", phone: "", city: "", verification: "Not started", status: "Draft", joined: "10 Nov 2026" },
  websites: { brand: "", url: "", theme: "Ivory editorial", color: "#9D174D", status: "Draft", ssl: "Pending" },
  products: { name: "", sku: "", category: "Kurtis", sizes: "S M L", colors: "", cost: 0, supply: 0, retail: 0, status: "Draft" },
  categories: { name: "", parent: "Women's clothing", products: 0, order: 9, status: "Draft" },
  suppliers: { name: "", city: "", categories: "", contact: "", invoices: 0, status: "Active" },
  purchases: { supplier: "Jaipur Loom House", product: "Kurti A", qty: 10, cost: 0, status: "Draft", date: "10 Nov 2026" },
  warehouses: { name: "", city: "Gurugram", bins: 0, inbound: 0, outbound: 0, status: "Operating" },
  inventory: { sku: "", product: "", size: "M", color: "", warehouse: "Central warehouse", onHand: 0, reserved: 0, available: 0, damaged: 0 },
  orders: { brand: "Aisa Clothing", partner: "Aisa Studio", customer: "Customer · City", product: "Kurti A", sku: "KUR-001-M-RED", qty: 1, value: 2000, supply: 1700, payment: "Pending", method: "UPI", fulfilment: "Confirmed", delivery: "Not shipped", date: "10 Nov 2026" },
  fulfilment: { order: "", brand: "", task: "Pick", assignee: "Pick desk", branding: "Company label", status: "Waiting payment check" },
  shipments: { order: "", courier: "Delhivery", awb: "", charge: 79, status: "In transit" },
  labels: { brand: "", type: "Neck label", artwork: "In review", charge: 18, stock: 0, status: "Pending approval" },
  packaging: { name: "", type: "Company", stock: 0, cost: 0, brands: "", status: "Available" },
  returns: { order: "", brand: "", reason: "", condition: "Good", refund: 0, status: "Pending approval" },
  customers: { label: "Customer · City", brand: "", orders: 0, spend: 0, returns: 0, phone: "" },
  payments: { order: "", method: "UPI", amount: 0, status: "Pending", reference: "" },
  expenses: { head: "", amount: 0, month: "Nov 2026", note: "" },
  settlements: { partner: "", sales: 0, supply: 0, margin: 0, adjustments: 0, status: "Pending", date: "10 Nov 2026" },
  campaigns: { name: "", scope: "Platform", discount: "", starts: "10 Nov 2026", ends: "30 Nov 2026", status: "Scheduled" },
  courses: { title: "", lessons: 1, partners: 0, status: "Draft" },
  tickets: { from: "", topic: "", priority: "Medium", status: "Open", updated: "10 Nov 2026" },
  notices: { title: "", channel: "In-app", audience: "Operations", status: "Draft" },
  staff: { desk: "", department: "Operations", role: "Operations Manager", status: "Active" },
  roles: { name: "", access: "", people: 0 },
  audit: { when: "Just now", actor: "Platform owner", what: "", detail: "Added in this session" },
};

function bump(rows, id, changes) {
  return rows.map((row) => (row.id === id ? { ...row, ...changes } : row));
}

function addStock(db, productName, qty) {
  const product = db.products.find((item) => item.name === productName);
  const bin = db.inventory.find((item) => item.product === productName && item.warehouse === "Central warehouse");
  if (bin) {
    return bump(db.inventory, bin.id, {
      onHand: bin.onHand + qty,
      available: bin.available + qty,
    });
  }
  return [
    {
      id: nextId(db.inventory),
      sku: `${product?.sku || "NEW"}-RECV`,
      product: productName,
      size: "Mixed",
      color: "Mixed",
      warehouse: "Central warehouse",
      onHand: qty,
      reserved: 0,
      available: qty,
      damaged: 0,
    },
    ...db.inventory,
  ];
}

function moveStock(db, sku, qty, mode) {
  const bin = db.inventory.find((item) => item.sku === sku);
  if (!bin) return { inventory: db.inventory, note: "No matching SKU, stock unchanged." };
  if (mode === "reserve") {
    if (bin.available < qty) return { inventory: db.inventory, note: "Not enough available stock to reserve." };
    return {
      inventory: bump(db.inventory, bin.id, { available: bin.available - qty, reserved: bin.reserved + qty }),
      note: `Reserved ${qty} of ${sku}.`,
    };
  }
  if (mode === "ship") {
    const fromReserved = Math.min(bin.reserved, qty);
    const fromAvailable = Math.min(bin.available, qty - fromReserved);
    return {
      inventory: bump(db.inventory, bin.id, {
        reserved: bin.reserved - fromReserved,
        available: bin.available - fromAvailable,
        onHand: Math.max(0, bin.onHand - fromReserved - fromAvailable),
      }),
      note: `Shipped ${fromReserved + fromAvailable} of ${sku}.`,
    };
  }
  return {
    inventory: bump(db.inventory, bin.id, {
      onHand: bin.onHand + qty,
      available: bin.available + qty,
    }),
    note: `Restocked ${qty}.`,
  };
}

export function cascade(db, collection, before, after) {
  let next = db;
  const notes = [];
  const changed = (key) => before?.[key] !== after?.[key];

  if (collection === "purchases" && changed("status") && after.status === "Received") {
    next = { ...next, inventory: addStock(next, after.product, Number(after.qty) || 0) };
    notes.push(`Added ${after.qty} ${after.product} to central stock.`);
  }

  if (collection === "payments" && changed("status") && after.order) {
    const payment = after.status === "Pending" ? "COD pending" : after.status;
    next = { ...next, orders: bump(next.orders, after.order, { payment }) };
    notes.push(`Order ${after.order} payment set to ${payment}.`);
  }

  if (collection === "brands" && changed("status")) {
    const website = {
      Active: "Published",
      "Pending approval": "Setup pending",
      "Temporarily suspended": "Suspended",
      Deactivated: "Suspended",
      Closed: "Suspended",
      Draft: "Draft",
    }[after.status] || "Draft";
    const partner = {
      Active: "Active",
      "Pending approval": "Pending approval",
      "Temporarily suspended": "Suspended",
      Deactivated: "Deactivated",
      Closed: "Deactivated",
      Draft: "Draft",
    }[after.status] || after.status;
    next = {
      ...next,
      websites: next.websites.map((site) => (site.brand === after.name ? { ...site, status: website } : site)),
      partners: next.partners.map((person) => (person.brand === after.name ? { ...person, status: partner } : person)),
    };
    notes.push(`Website set to ${website}. Partner set to ${partner}.`);
  }

  if (collection === "orders" && changed("fulfilment")) {
    const task = next.fulfilment.find((item) => item.order === after.id);
    if (task) {
      next = { ...next, fulfilment: bump(next.fulfilment, task.id, { status: after.fulfilment === "Confirmed" ? "Waiting payment check" : after.fulfilment }) };
    }
    if (after.fulfilment === "Packing") {
      const moved = moveStock(next, after.sku, Number(after.qty) || 1, "reserve");
      next = { ...next, inventory: moved.inventory };
      notes.push(moved.note);
    }
    if (after.fulfilment === "Shipped") {
      const moved = moveStock(next, after.sku, Number(after.qty) || 1, "ship");
      const exists = next.shipments.some((item) => item.order === after.id);
      next = {
        ...next,
        inventory: moved.inventory,
        orders: bump(next.orders, after.id, { delivery: "In transit" }),
        shipments: exists
          ? next.shipments
          : [
              { id: nextId(next.shipments), order: after.id, courier: "Delhivery", awb: `LOCAL${after.id.slice(-4)}`, charge: 79, status: "In transit" },
              ...next.shipments,
            ],
      };
      notes.push(moved.note);
      if (!exists) notes.push("Opened a local shipment.");
    }
  }

  if (collection === "returns" && changed("status") && after.status === "Restock approved") {
    const order = next.orders.find((item) => item.id === after.order);
    if (order) {
      const moved = moveStock(next, order.sku, 1, "restock");
      next = { ...next, inventory: moved.inventory };
      notes.push(moved.note);
    } else {
      notes.push("That order is not in this sample, so stock was left as it is.");
    }
  }

  if (collection === "returns" && changed("status") && after.status === "Refunded" && after.order) {
    next = {
      ...next,
      orders: next.orders.map((order) => (order.id === after.order ? { ...order, payment: "Refunded", fulfilment: "Returned" } : order)),
      payments: next.payments.map((payment) => (payment.order === after.order ? { ...payment, status: "Refunded" } : payment)),
    };
    notes.push(`Payment for ${after.order} marked refunded.`);
  }

  return { db: next, note: notes.filter(Boolean).join(" ") };
}

export function partnerMoney(db) {
  const names = [...new Set(db.orders.map((order) => order.partner).filter(Boolean))];
  return names.map((partner) => {
    const paid = db.orders.filter((order) => order.partner === partner && (order.payment === "Captured" || order.payment === "COD pending"));
    const refunded = db.orders.filter((order) => order.partner === partner && order.payment === "Refunded");
    const sales = sum(paid, "value");
    const supply = sum(paid, "supply");
    const refunds = sum(refunded, "value");
    const shipping = sum(
      db.shipments.filter((shipment) => db.orders.some((order) => order.id === shipment.order && order.partner === partner)),
      "charge",
    );
    return { partner, sales, supply, margin: sales - supply, refunds, shipping };
  });
}

export function related(db, collection, row) {
  if (!row) return [];
  const block = (title, path, rows, text) =>
    rows.length ? { title, path, rows: rows.slice(0, 6).map((item) => ({ id: item.id, text: text(item) })) } : null;

  const blocks = {
    brands: [
      block("Partner", "/partners", db.partners.filter((item) => item.brand === row.name), (item) => `${item.name} · ${item.status}`),
      block("Website", "/websites", db.websites.filter((item) => item.brand === row.name), (item) => `${item.url} · ${item.status}`),
      block("Orders", "/orders", db.orders.filter((item) => item.brand === row.name), (item) => `${item.id} · ${item.fulfilment}`),
    ],
    partners: [
      block("Brand", "/brands", db.brands.filter((item) => item.partner === row.name || item.name === row.brand), (item) => `${item.name} · ${item.status}`),
      block("Settlements", "/settlements", db.settlements.filter((item) => item.partner === row.name), (item) => `${item.id} · ${item.status}`),
      block("Tickets", "/support", db.tickets.filter((item) => item.from === row.name), (item) => `${item.id} · ${item.topic}`),
    ],
    websites: [
      block("Brand", "/brands", db.brands.filter((item) => item.name === row.brand), (item) => item.status),
    ],
    products: [
      block("Stock", "/inventory", db.inventory.filter((item) => item.product === row.name), (item) => `${item.sku} · ${item.available} available`),
      block("Purchases", "/purchasing", db.purchases.filter((item) => item.product === row.name), (item) => `${item.id} · ${item.status}`),
      block("Orders", "/orders", db.orders.filter((item) => item.product === row.name), (item) => `${item.id} · ${item.payment}`),
    ],
    purchases: [
      block("Supplier", "/suppliers", db.suppliers.filter((item) => item.name === row.supplier), (item) => item.city),
      block("Stock", "/inventory", db.inventory.filter((item) => item.product === row.product), (item) => `${item.sku} · ${item.available} available`),
    ],
    inventory: [
      block("Product", "/products", db.products.filter((item) => item.name === row.product), (item) => item.status),
      block("Orders", "/orders", db.orders.filter((item) => item.sku === row.sku || item.product === row.product), (item) => item.fulfilment),
    ],
    orders: [
      block("Payment", "/payments", db.payments.filter((item) => item.order === row.id), (item) => `${item.method} · ${item.status}`),
      block("Fulfilment", "/fulfilment", db.fulfilment.filter((item) => item.order === row.id), (item) => `${item.task} · ${item.status}`),
      block("Shipment", "/shipping", db.shipments.filter((item) => item.order === row.id), (item) => `${item.courier} · ${item.status}`),
      block("Return", "/returns", db.returns.filter((item) => item.order === row.id), (item) => `${item.reason} · ${item.status}`),
      block("Customer", "/customers", db.customers.filter((item) => item.label === row.customer && item.brand === row.brand), (item) => item.brand),
    ],
    payments: [
      block("Order", "/orders", db.orders.filter((item) => item.id === row.order), (item) => `${item.brand} · ${item.fulfilment}`),
    ],
    fulfilment: [
      block("Order", "/orders", db.orders.filter((item) => item.id === row.order), (item) => item.fulfilment),
    ],
    shipments: [
      block("Order", "/orders", db.orders.filter((item) => item.id === row.order), (item) => item.delivery),
    ],
    returns: [
      block("Order", "/orders", db.orders.filter((item) => item.id === row.order), (item) => `${item.product} · ${item.payment}`),
    ],
    customers: [
      block("Orders", "/orders", db.orders.filter((item) => item.customer === row.label && item.brand === row.brand), (item) => `${item.id} · ${item.product}`),
    ],
    suppliers: [
      block("Purchases", "/purchasing", db.purchases.filter((item) => item.supplier === row.name), (item) => `${item.id} · ${item.product}`),
    ],
    settlements: [
      block("Partner", "/partners", db.partners.filter((item) => item.name === row.partner), (item) => item.brand),
      block("Orders", "/orders", db.orders.filter((item) => item.partner === row.partner), (item) => `${item.id} · ${item.payment}`),
    ],
    tickets: [
      block("Partner", "/partners", db.partners.filter((item) => item.name === row.from), (item) => item.brand),
    ],
  };

  return (blocks[collection] || []).filter(Boolean);
}
