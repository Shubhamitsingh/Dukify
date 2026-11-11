import { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Bell,
  Box,
  Boxes,
  ClipboardList,
  CreditCard,
  Factory,
  Globe,
  GraduationCap,
  IdCard,
  IndianRupee,
  Landmark,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Megaphone,
  Menu,
  Moon,
  Package,
  PackageCheck,
  PanelLeft,
  Search,
  Settings,
  Shield,
  Stamp,
  Store,
  Sun,
  Tags,
  Truck,
  Undo2,
  UserRound,
  Users,
  Wallet,
  Warehouse,
  X,
} from "lucide-react";
import { useStore } from "./store";

export const navGroups = [
  {
    label: "Command",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/brands", label: "Brands", icon: Store },
      { to: "/partners", label: "Partners", icon: Users },
      { to: "/websites", label: "Websites", icon: Globe },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { to: "/products", label: "Products", icon: Package },
      { to: "/categories", label: "Categories", icon: Tags },
      { to: "/pricing", label: "Pricing", icon: IndianRupee },
    ],
  },
  {
    label: "Supply",
    items: [
      { to: "/suppliers", label: "Suppliers", icon: Factory },
      { to: "/purchasing", label: "Purchasing", icon: ClipboardList },
      { to: "/warehouses", label: "Warehouses", icon: Warehouse },
      { to: "/inventory", label: "Inventory", icon: Boxes },
    ],
  },
  {
    label: "Orders",
    items: [
      { to: "/orders", label: "Orders", icon: ClipboardList },
      { to: "/fulfilment", label: "Fulfilment", icon: PackageCheck },
      { to: "/shipping", label: "Shipping", icon: Truck },
      { to: "/private-label", label: "Private label", icon: Stamp },
      { to: "/packaging", label: "Packaging", icon: Box },
      { to: "/returns", label: "Returns", icon: Undo2 },
    ],
  },
  {
    label: "Commercial",
    items: [
      { to: "/customers", label: "Customers", icon: UserRound },
      { to: "/payments", label: "Payments", icon: CreditCard },
      { to: "/finance", label: "Finance", icon: Landmark },
      { to: "/settlements", label: "Settlements", icon: Wallet },
      { to: "/marketing", label: "Marketing", icon: Megaphone },
    ],
  },
  {
    label: "Partner success",
    items: [
      { to: "/academy", label: "Academy", icon: GraduationCap },
      { to: "/support", label: "Support", icon: LifeBuoy },
      { to: "/notifications", label: "Notifications", icon: Bell },
    ],
  },
  {
    label: "Platform",
    items: [
      { to: "/reports", label: "Reports", icon: BarChart3 },
      { to: "/staff", label: "Staff", icon: IdCard },
      { to: "/roles", label: "Roles", icon: Shield },
      { to: "/settings", label: "Settings", icon: Settings },
      { to: "/security", label: "Security", icon: Activity },
    ],
  },
];

const links = navGroups.flatMap((group) => group.items);

export function Shell({ children, onLogout, dark, onToggleDark }) {
  const { db } = useStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const openTickets = db.tickets.filter((ticket) => ticket.status === "Open").length;

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    const pages = links
      .filter((item) => item.label.toLowerCase().includes(needle))
      .map((item) => ({ kind: "Page", label: item.label, to: item.to }));
    const orders = db.orders
      .filter((order) => `${order.id} ${order.brand} ${order.product}`.toLowerCase().includes(needle))
      .slice(0, 4)
      .map((order) => ({ kind: "Order", label: `${order.id} · ${order.brand}`, to: "/orders", record: order.id }));
    const brands = db.brands
      .filter((brand) => brand.name.toLowerCase().includes(needle))
      .map((brand) => ({ kind: "Brand", label: brand.name, to: "/brands", record: brand.id }));
    const products = db.products
      .filter((product) => `${product.name} ${product.sku}`.toLowerCase().includes(needle))
      .map((product) => ({ kind: "Product", label: product.name, to: "/products", record: product.id }));
    return [...pages, ...brands, ...products, ...orders].slice(0, 8);
  }, [db.brands, db.orders, db.products, query]);

  const width = collapsed ? 72 : 256;

  return (
    <div className="min-h-screen bg-[#F6F8FB] text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <aside
        className={`fixed top-0 left-0 z-40 flex h-screen flex-col border-r border-gray-200 bg-white transition-transform dark:border-gray-700 dark:bg-gray-800 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
        style={{ width }}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-3 dark:border-gray-700">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-pink-500 text-xs font-bold text-white">
              P
            </div>
            {collapsed ? null : (
              <span className="truncate text-sm font-semibold">Pahachan Admin</span>
            )}
          </div>
          <button
            type="button"
            className="hidden h-8 w-8 place-items-center rounded-lg text-gray-500 hover:bg-gray-100 lg:grid dark:hover:bg-gray-700"
            onClick={() => setCollapsed((value) => !value)}
            aria-label="Collapse sidebar"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-3">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-2">
              {collapsed ? null : (
                <p className="px-4 pt-3 pb-1 text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const badge = item.to === "/support" ? openTickets : 0;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={item.label}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `mx-2 mb-0.5 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium ${
                        isActive
                          ? "bg-pink-500 text-white"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/60"
                      }`
                    }
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {collapsed ? null : <span className="truncate">{item.label}</span>}
                    {!collapsed && badge > 0 ? (
                      <span className="ml-auto rounded-md bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        {badge}
                      </span>
                    ) : null}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className={collapsed ? "lg:pl-[72px]" : "lg:pl-64"}>
          <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-5 dark:border-gray-700 dark:bg-gray-800">
            <button
              type="button"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden dark:text-gray-300 dark:hover:bg-gray-700"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search brands, orders, pages"
                className="h-9 w-full rounded-lg border border-transparent bg-gray-100 pr-3 pl-9 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-pink-300 focus:bg-white dark:bg-gray-900 dark:text-white dark:focus:bg-gray-900"
              />
              {searchOpen && results.length > 0 ? (
                <div className="absolute top-full right-0 left-0 z-30 mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                  {results.map((result) => (
                    <button
                      key={`${result.kind}-${result.label}`}
                      type="button"
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                      onClick={() => {
                        navigate(result.record ? `${result.to}?record=${result.record}` : result.to);
                        setQuery("");
                        setSearchOpen(false);
                      }}
                    >
                      <span>{result.label}</span>
                      <span className="text-xs text-gray-400">{result.kind}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="ml-auto flex h-9 items-center gap-1">
              <div className="relative">
                <button
                  type="button"
                  className="grid h-9 w-9 place-items-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => setBellOpen((value) => !value)}
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
                </button>
                {bellOpen ? (
                  <div className="absolute top-11 right-0 z-30 w-72 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    {db.notices.slice(0, 4).map((notice) => (
                      <button
                        key={notice.id}
                        type="button"
                        className="block w-full border-b border-gray-100 px-3 py-2 text-left last:border-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                        onClick={() => {
                          setBellOpen(false);
                          navigate("/notifications");
                        }}
                      >
                        <span className="block text-sm font-medium">{notice.title}</span>
                        <span className="text-xs text-gray-500">{notice.channel} · {notice.status}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={onToggleDark}
                aria-label="Toggle color mode"
              >
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <span className="mx-2 h-5 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="flex items-center gap-2 pr-1">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-pink-500 text-xs font-semibold text-white">
                  P
                </div>
                <div className="hidden leading-none sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Platform owner</p>
                  <p className="mt-1 text-[11px] text-gray-500">Super Admin</p>
                </div>
              </div>
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={onLogout}
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </header>
          <main className="min-w-0 p-3 lg:p-4">{children}</main>
      </div>
    </div>
  );
}
