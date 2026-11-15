/** OMS enums — keep display labels stable; map to legacy fulfilment/payment/delivery fields. */

export const FULFILLMENT_STATUSES = [
  "New",
  "Confirmed",
  "Processing",
  "Ready to Ship",
  "Shipped",
  "Delivered",
  "Cancelled",
  "On Hold",
  "Returned",
  "Payment failed",
];

export const PAYMENT_STATUSES = ["Paid", "Pending", "Failed", "COD", "Partially Refunded", "Refunded"];

export const SHIPPING_STATUSES = [
  "Not Assigned",
  "Label Generated",
  "Pickup Scheduled",
  "Picked Up",
  "In Transit",
  "Out for Delivery",
  "Delivered",
  "Delivery Failed",
  "RTO",
  "NDR",
];

export const COURIERS = ["Shiprocket", "Delhivery", "Xpressbees"];

export const PAYMENT_METHODS = ["Prepaid", "COD"];

export const DATE_PRESETS = [
  { id: "all", label: "All dates" },
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "custom", label: "Custom range" },
];

export const ATTENTION_FILTERS = [
  { id: "All", label: "All" },
  { id: "payment", label: "Payment issues" },
  { id: "processing", label: "Processing delays" },
  { id: "pickup", label: "Pickup delays" },
  { id: "delivery", label: "Delivery exceptions" },
  { id: "failed_ship", label: "Failed shipments" },
  { id: "admin", label: "Pending admin actions" },
];

export const SUMMARY_CARDS = [
  { id: "all", label: "Total Orders", fulfillment: null, icon: "total" },
  { id: "new", label: "New Orders", fulfillment: "New", icon: "new" },
  { id: "processing", label: "Processing", fulfillment: "Processing", icon: "processing" },
  { id: "ready", label: "Ready to Ship", fulfillment: "Ready to Ship", icon: "ready" },
  { id: "transit", label: "In Transit", fulfillment: "Shipped", icon: "transit" },
  { id: "delivered", label: "Delivered", fulfillment: "Delivered", icon: "delivered" },
];

/** Legacy seed fulfilment → OMS fulfillment label */
export const LEGACY_FULFILMENT_TO_OMS = {
  Confirmed: "New",
  Packing: "Processing",
  "Ready to ship": "Ready to Ship",
  Shipped: "Shipped",
  Delivered: "Delivered",
  Cancelled: "Cancelled",
  Returned: "Returned",
  "Payment failed": "Payment failed",
  "On hold": "On Hold",
  New: "New",
  Processing: "Processing",
  "Ready to Ship": "Ready to Ship",
  "On Hold": "On Hold",
};

/** OMS → legacy fulfilment (for cascade / existing modules) */
export const OMS_TO_LEGACY_FULFILMENT = {
  New: "Confirmed",
  Confirmed: "Confirmed",
  Processing: "Packing",
  "Ready to Ship": "Ready to ship",
  Shipped: "Shipped",
  Delivered: "Delivered",
  Cancelled: "Cancelled",
  "On Hold": "On hold",
  Returned: "Returned",
  "Payment failed": "Payment failed",
};

export const LEGACY_PAYMENT_TO_OMS = {
  Captured: "Paid",
  Pending: "Pending",
  "COD pending": "COD",
  Failed: "Failed",
  Refunded: "Refunded",
  "Partially Refunded": "Partially Refunded",
  Paid: "Paid",
  COD: "COD",
};

export const OMS_TO_LEGACY_PAYMENT = {
  Paid: "Captured",
  Pending: "Pending",
  Failed: "Failed",
  COD: "COD pending",
  Refunded: "Refunded",
  "Partially Refunded": "Refunded",
};

export const PICKUP_LOCATIONS = [
  { id: "WH-01", name: "Central warehouse", city: "Gurugram" },
  { id: "WH-02", name: "Returns bay", city: "Gurugram" },
];
