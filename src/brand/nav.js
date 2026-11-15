import {
  BadgePercent,
  Bell,
  BookOpen,
  Boxes,
  CircleDollarSign,
  LayoutDashboard,
  LifeBuoy,
  LineChart,
  Megaphone,
  Settings,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";

/**
 * Super-Admin-style flat sidebar: group label + unique destination icons.
 * Deep sections stay in `menu` and surface as page chips.
 */
export const navGroups = [
  {
    label: "Workspace",
    items: [
      { id: "dashboard", to: "/brand/dashboard/overview", label: "Dashboard", icon: LayoutDashboard },
      { id: "store", to: "/brand/store/overview", label: "My Store", icon: Store },
      { id: "products", to: "/brand/products/browse", label: "Products", icon: ShoppingBag },
    ],
  },
  {
    label: "Commerce",
    items: [
      { id: "orders", to: "/brand/orders/all", label: "Orders", icon: Boxes },
      { id: "customers", to: "/brand/customers/all", label: "Customers", icon: Users },
      { id: "marketing", to: "/brand/marketing/overview", label: "Marketing", icon: Megaphone },
      { id: "earnings", to: "/brand/earnings/overview", label: "Earnings", icon: CircleDollarSign },
    ],
  },
  {
    label: "Insights",
    items: [
      { id: "analytics", to: "/brand/analytics/sales", label: "Analytics", icon: LineChart },
      { id: "academy", to: "/brand/academy/start", label: "Academy", icon: BookOpen },
    ],
  },
  {
    label: "Account",
    items: [
      { id: "support", to: "/brand/support/help", label: "Support", icon: LifeBuoy },
      { id: "notifications", to: "/brand/notifications/all", label: "Notifications", icon: Bell },
      { id: "settings", to: "/brand/settings/profile", label: "Settings", icon: Settings },
    ],
  },
];

export const menu = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    items: [
      ["overview", "Business Overview"],
      ["sales", "Sales Overview"],
      ["orders", "Order Overview"],
      ["revenue", "Revenue Overview"],
      ["activity", "Recent Activity"],
    ],
  },
  {
    id: "store",
    label: "My Store",
    icon: Store,
    items: [
      ["overview", "Store Overview"],
      ["editor", "Storefront Editor"],
      ["theme", "Theme & Appearance"],
      ["identity", "Logo & Brand Identity"],
      ["homepage", "Homepage Sections"],
      ["banners", "Banners & Promotional Images"],
      ["navigation", "Navigation & Menus"],
      ["domain", "Domain Management"],
      ["preview", "Store Preview"],
      ["publish", "Publish Store"],
    ],
  },
  {
    id: "products",
    label: "Product Catalogue",
    icon: ShoppingBag,
    items: [
      ["browse", "Browse Products"],
      ["selected", "My Selected Products"],
      ["details", "Product Details"],
      ["variants", "Product Variants"],
      ["pricing", "My Product Pricing"],
      ["featured", "Featured Products"],
      ["availability", "Product Availability"],
      ["recent", "Recently Added Products"],
    ],
  },
  {
    id: "orders",
    label: "Order Management",
    icon: Boxes,
    items: [
      ["all", "All Orders"],
      ["new", "New Orders"],
      ["confirmed", "Confirmed Orders"],
      ["processing", "Processing Orders"],
      ["packed", "Packed Orders"],
      ["shipped", "Shipped Orders"],
      ["delivered", "Delivered Orders"],
      ["cancelled", "Cancelled Orders"],
      ["returns", "Return Requests"],
      ["refunds", "Refund Status"],
    ],
  },
  {
    id: "customers",
    label: "Customers",
    icon: Users,
    items: [
      ["all", "All Customers"],
      ["new", "New Customers"],
      ["returning", "Returning Customers"],
      ["profiles", "Customer Profiles"],
      ["history", "Customer Order History"],
    ],
  },
  {
    id: "marketing",
    label: "Marketing & Promotions",
    icon: Megaphone,
    items: [
      ["overview", "Marketing Overview"],
      ["coupons", "Discount Coupons"],
      ["campaigns", "Promotional Campaigns"],
      ["featured", "Featured Products"],
      ["social", "Social Media Campaigns"],
      ["assets", "Marketing Assets"],
      ["referral", "Referral Campaigns"],
      ["promotions", "Sales Promotions"],
    ],
  },
  {
    id: "analytics",
    label: "Analytics & Reports",
    icon: LineChart,
    items: [
      ["sales", "Sales Analytics"],
      ["orders", "Order Analytics"],
      ["revenue", "Revenue Analytics"],
      ["products", "Product Performance"],
      ["customers", "Customer Analytics"],
      ["conversion", "Conversion Analytics"],
      ["traffic", "Traffic Overview"],
      ["reports", "Date-wise Reports"],
    ],
  },
  {
    id: "earnings",
    label: "Earnings & Settlements",
    icon: CircleDollarSign,
    items: [
      ["overview", "Earnings Overview"],
      ["gross", "Gross Sales"],
      ["margin", "Partner Gross Margin"],
      ["commission", "Applicable Commission"],
      ["deductions", "Discounts & Deductions"],
      ["refunds", "Refund Adjustments"],
      ["pending", "Pending Settlements"],
      ["completed", "Completed Settlements"],
      ["history", "Settlement History"],
      ["payment", "Payment Details"],
    ],
  },
  {
    id: "academy",
    label: "Brand Growth & Academy",
    icon: BookOpen,
    items: [
      ["start", "Getting Started"],
      ["setup", "Brand Setup Guide"],
      ["marketing", "Marketing Tutorials"],
      ["selling", "Product Selling Guides"],
      ["growth", "Business Growth Tips"],
      ["videos", "Training Videos"],
      ["announcements", "Platform Announcements"],
    ],
  },
  {
    id: "support",
    label: "Support Centre",
    icon: LifeBuoy,
    items: [
      ["help", "Help Centre"],
      ["create", "Create Support Ticket"],
      ["tickets", "My Support Tickets"],
      ["faq", "Frequently Asked Questions"],
      ["contact", "Contact Platform Support"],
    ],
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    items: [
      ["all", "All Notifications"],
      ["order", "Order Updates"],
      ["product", "Product Updates"],
      ["payment", "Payment Updates"],
      ["store", "Store Updates"],
      ["announcement", "Platform Announcements"],
    ],
  },
  {
    id: "settings",
    label: "Account & Settings",
    icon: Settings,
    items: [
      ["profile", "Brand Profile"],
      ["business", "Business Information"],
      ["contact", "Contact Information"],
      ["store", "Store Information"],
      ["security", "Account Security"],
      ["password", "Password Management"],
      ["team", "Team Members"],
      ["preferences", "Notification Preferences"],
      ["bank", "Bank & Settlement Details"],
      ["legal", "Legal Documents"],
    ],
  },
];

export function pathFor(moduleId, section) {
  return `/brand/${moduleId}/${section}`;
}

export function findCrumb(pathname) {
  const parts = pathname.split("/").filter(Boolean);
  const moduleId = parts[1];
  const section = parts[2];
  const group = menu.find((item) => item.id === moduleId);
  if (!group) return [];
  const child = group.items.find((item) => item[0] === section);
  return [group.label, child ? child[1] : "Details"];
}

export const orderSectionStatus = {
  new: "New",
  confirmed: "Confirmed",
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returns: "Return requested",
};

export { BadgePercent };
