import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LogOut,
  Mail,
  Megaphone,
  Menu,
  MessageSquare,
  Moon,
  PanelLeft,
  Search,
  Settings,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import { useStore } from "./store";
import { useAccess } from "./access";
import { approvals, exceptions } from "./work";
import { navGroups } from "./adminNav";

function isSupportNavActive(to, pathname) {
  if (to === "/support") {
    return pathname === "/support" || pathname.startsWith("/support/ticket");
  }
  return pathname === to;
}

function dayGreeting(name = "Platform owner") {
  const hour = new Date().getHours();
  const when = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return { when, name };
}

export function Shell({ children, onLogout, dark, onToggleDark }) {
  const { db: rawDb } = useStore();
  const { principal, canPath, scopeOrders, scopeRows, roleLabel } = useAccess();
  const db = useMemo(() => {
    const brands = scopeRows(rawDb.brands, (b) => b.id);
    const brandNameById = Object.fromEntries(rawDb.brands.map((b) => [b.id, b.name]));
    const orders = scopeOrders(rawDb.orders, brandNameById);
    const brandNames = new Set(brands.map((b) => b.name));
    const orderIds = new Set(orders.map((o) => o.id));
    return {
      ...rawDb,
      brands,
      orders,
      products: (rawDb.products || []).filter((p) => !p.brandId || brands.some((b) => b.id === p.brandId) || brandNames.has(p.brand)),
      partners: rawDb.partners,
      tickets: (rawDb.tickets || []).filter((t) => !t.brandId || brands.some((b) => b.id === t.brandId) || brandNames.has(t.brand)),
      shipments: (rawDb.shipments || []).filter((s) => !s.order || orderIds.has(s.order)),
      notices: rawDb.notices || [],
    };
  }, [rawDb, scopeOrders, scopeRows]);

  const visibleNavGroups = useMemo(
    () =>
      navGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => canPath(item.to)),
        }))
        .filter((group) => group.items.length > 0),
    [canPath],
  );

  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const bellRef = useRef(null);
  const openTickets = db.tickets.filter((ticket) => ticket.status === "Open").length;
  const attentionNotices = db.notices.filter((notice) => notice.status === "Failed" || notice.status === "Draft");
  const recentNotices = [...db.notices].sort((left, right) => {
    const rank = (row) => (row.status === "Failed" ? 0 : row.status === "Draft" ? 1 : 2);
    return rank(left) - rank(right);
  }).slice(0, 5);

  useEffect(() => {
    if (!profileOpen && !bellOpen) return undefined;
    const onPointer = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
      if (bellRef.current && !bellRef.current.contains(event.target)) setBellOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setBellOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [profileOpen, bellOpen]);
  const openExceptions = exceptions(db).length;
  const openApprovals = approvals(db).length;
  const openNdr = (db.shipments || []).filter((row) => row.status === "NDR").length;

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    const navLinks = visibleNavGroups.flatMap((g) => g.items);
    const pages = navLinks
      .filter((item) => item.label.toLowerCase().includes(needle))
      .map((item) => ({ kind: "Page", label: item.label, to: item.to }));
    // Search only scoped rows — never leak out-of-scope brand data
    const orders = db.orders
      .filter((order) => `${order.id} ${order.brand} ${order.product}`.toLowerCase().includes(needle))
      .slice(0, 4)
      .map((order) => ({ kind: "Order", label: `${order.id} · ${order.brand}`, to: "/orders", record: order.id }));
    const brands = db.brands
      .filter((brand) => brand.name.toLowerCase().includes(needle))
      .map((brand) => ({ kind: "Brand", label: brand.name, to: "/brands", record: brand.id }));
    const products = db.products
      .filter((product) => `${product.name} ${product.sku} ${product.barcode || ""}`.toLowerCase().includes(needle))
      .map((product) => ({ kind: "Product", label: product.name, to: "/products", record: product.id }));
    const partners = canPath("/partners")
      ? db.partners
          .filter((partner) => partner.name.toLowerCase().includes(needle))
          .map((partner) => ({ kind: "Partner", label: partner.name, to: "/partners", record: partner.id }))
      : [];
    const shipments = db.shipments
      .filter((row) => `${row.awb} ${row.order}`.toLowerCase().includes(needle))
      .slice(0, 3)
      .map((row) => ({ kind: "Shipment", label: `${row.awb} · ${row.order}`, to: "/shipping", record: row.id }));
    const tickets = db.tickets
      .filter((ticket) =>
        `${ticket.id} ${ticket.from || ""} ${ticket.topic || ""} ${ticket.subject || ""} ${ticket.requesterName || ""}`
          .toLowerCase()
          .includes(needle),
      )
      .slice(0, 3)
      .map((ticket) => ({
        kind: "Ticket",
        label: `${ticket.id} · ${ticket.subject || ticket.topic}`,
        to: `/support/ticket/${ticket.id}`,
      }));
    return [...pages, ...brands, ...partners, ...products, ...orders, ...shipments, ...tickets].slice(0, 8);
  }, [canPath, db.brands, db.orders, db.partners, db.products, db.shipments, db.tickets, query, visibleNavGroups]);

  const width = collapsed ? 64 : 220;
  const railGap = 0;
  const workspacePad = width + 8;

  return (
    <div className="app-shell">
      <aside
        className={`app-rail fixed top-2 bottom-0 left-0 z-40 flex flex-col overflow-hidden transition-[width,transform] duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 max-lg:top-0`}
        style={{ width }}
      >
        <div className="flex h-14 shrink-0 items-center gap-1 px-2.5">
          <div className="flex min-w-0 flex-1 items-center gap-2.5 overflow-hidden">
            {collapsed ? (
              <img src="/logo/logo-dukify.png" alt="Dukify" className="h-9 w-9 shrink-0 object-contain" />
            ) : (
              <img src="/logo/logo-ducku-2.png" alt="Dukify" className="h-8 w-auto max-w-[9.5rem] rounded-md bg-white object-contain object-left px-1.5" />
            )}
          </div>
          <button
            type="button"
            className="icon-btn hidden shrink-0 lg:inline-grid"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <PanelLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="icon-btn inline-grid shrink-0 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-2 pb-3">
          {visibleNavGroups.flatMap((group) => group.items).map((item) => {
            const Icon = item.icon;
            const badge =
              item.badge === "tickets" || item.to === "/support"
                ? openTickets
                : item.to === "/exceptions"
                  ? openExceptions
                  : item.to === "/approvals"
                    ? openApprovals
                    : item.to === "/ndr"
                      ? openNdr
                      : 0;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={item.label}
                end={item.to === "/support"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => {
                  const supportActive = item.to.startsWith("/support")
                    ? isSupportNavActive(item.to, location.pathname)
                    : isActive;
                  return `nav-link ${supportActive ? "nav-link-active" : ""}`;
                }}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {collapsed ? null : <span className="min-w-0 truncate">{item.label}</span>}
                {!collapsed && badge > 0 ? (
                  <span className="ml-auto shrink-0 rounded-full bg-[#EE8802] px-1.5 py-0.5 text-[10px] font-semibold text-[#001E55]">
                    {badge}
                  </span>
                ) : null}
              </NavLink>
            );
          })}
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

      <div className="app-workspace transition-[padding] duration-200 max-lg:!pl-2" style={{ paddingLeft: workspacePad }}>
        <header className="app-topbar sticky top-2 z-20 grid h-14 grid-cols-[1fr_minmax(12rem,36rem)_0.7fr] items-center gap-2 px-2.5 backdrop-blur sm:px-4">
          <div className="flex min-w-0 items-center justify-start gap-2 pl-10 sm:pl-14">
            <button
              type="button"
              className="icon-btn inline-grid shrink-0 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <p className="min-w-0 truncate text-base font-bold tracking-tight sm:text-lg">
              {(() => {
                const { when, name } = dayGreeting(principal?.name || roleLabel || "there");
                return (
                  <>
                    <span className="text-gray-900 dark:text-white">{when}, </span>
                    <span className="font-semibold text-gray-900 dark:text-white">{name}</span>
                  </>
                );
              })()}
            </p>
          </div>

          <div className="relative w-full justify-self-center">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search brands, orders, pages"
              className="search-pill"
            />
            {searchOpen && results.length > 0 ? (
              <div className="absolute top-full right-0 left-0 z-30 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
                {results.map((result) => (
                  <button
                    key={`${result.kind}-${result.label}`}
                    type="button"
                    className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
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

          <div className="flex h-11 min-w-0 items-center justify-end gap-1 sm:gap-1.5">
            <div className="relative" ref={bellRef}>
              <button
                type="button"
                className="icon-btn relative"
                onClick={() => {
                  setBellOpen((value) => !value);
                  setProfileOpen(false);
                }}
                aria-expanded={bellOpen}
                aria-haspopup="dialog"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {attentionNotices.length > 0 ? (
                  <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                    {attentionNotices.length}
                  </span>
                ) : (
                  <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
                )}
              </button>
              {bellOpen ? (
                <div
                  role="dialog"
                  aria-label="Notifications"
                  className="absolute top-11 right-0 z-30 w-[22rem] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 px-3.5 py-2.5 dark:border-gray-700">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Notifications</p>
                      <p className="text-xs text-gray-500">
                        {attentionNotices.length
                          ? `${attentionNotices.length} need a look in this session`
                          : "Latest local notices"}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-xs font-medium text-leaf-600 hover:text-leaf-700"
                      onClick={() => {
                        setBellOpen(false);
                        navigate("/notifications");
                      }}
                    >
                      View all
                    </button>
                  </div>
                  <ul className="max-h-80 overflow-y-auto py-1">
                    {recentNotices.map((notice) => {
                      const urgent = notice.status === "Failed" || notice.status === "Draft";
                      const ChannelIcon =
                        notice.channel === "Email" ? Mail : notice.channel === "SMS" ? MessageSquare : Megaphone;
                      return (
                        <li key={notice.id}>
                          <button
                            type="button"
                            className={`flex w-full gap-3 px-3.5 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                              urgent ? "bg-rose-50/60 dark:bg-rose-950/20" : ""
                            }`}
                            onClick={() => {
                              setBellOpen(false);
                              navigate(`/notifications?record=${notice.id}`);
                            }}
                          >
                            <span
                              className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                                notice.status === "Failed"
                                  ? "bg-rose-100 text-rose-600"
                                  : notice.status === "Draft"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300"
                              }`}
                            >
                              <ChannelIcon className="h-3.5 w-3.5" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex items-start justify-between gap-2">
                                <span className={`block text-sm leading-5 ${urgent ? "font-medium text-gray-900 dark:text-white" : "text-gray-800 dark:text-gray-100"}`}>
                                  {notice.title}
                                </span>
                                {urgent ? <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" /> : null}
                              </span>
                              <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
                                <span>{notice.audience}</span>
                                <span>·</span>
                                <span>{notice.channel}</span>
                                <span
                                  className={`rounded-md px-1.5 py-0.5 font-medium ${
                                    notice.status === "Failed"
                                      ? "bg-rose-100 text-rose-700"
                                      : notice.status === "Draft"
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-emerald-50 text-emerald-700"
                                  }`}
                                >
                                  {notice.status}
                                </span>
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="border-t border-gray-100 px-3.5 py-2 dark:border-gray-700">
                    <button
                      type="button"
                      className="w-full rounded-lg py-2 text-center text-sm font-medium text-leaf-600 hover:bg-leaf-50 dark:text-leaf-400 dark:hover:bg-leaf-950/20"
                      onClick={() => {
                        setBellOpen(false);
                        navigate("/notifications");
                      }}
                    >
                      Open notifications desk
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
            <button
              type="button"
              className="icon-btn"
              onClick={onToggleDark}
              aria-label="Toggle color mode"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <span className="mx-1 hidden h-7 w-px bg-gray-200 sm:mx-1.5 sm:block dark:bg-gray-700" />
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                className="flex h-11 items-center gap-2.5 rounded-full border border-gray-200/80 bg-white py-1 pr-2.5 pl-1 shadow-[0_1px_2px_rgba(17,24,39,0.04)] transition hover:border-leaf-200 hover:bg-leaf-50/40 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-leaf-900/50 dark:hover:bg-leaf-950/20"
                onClick={() => {
                  setProfileOpen((value) => !value);
                  setBellOpen(false);
                }}
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                aria-label="Account menu"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-leaf-50 text-[12px] font-semibold tracking-tight text-leaf-700 ring-1 ring-leaf-100 dark:bg-leaf-950/40 dark:text-leaf-300 dark:ring-leaf-900/50">
                  {(principal?.name || "P").slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-[13px] leading-4 font-semibold text-gray-900 dark:text-white">{principal?.name || "User"}</span>
                  <span className="mt-0.5 block text-[11px] leading-3 text-gray-500">{roleLabel}</span>
                </span>
                <ChevronDown className={`hidden h-3.5 w-3.5 text-gray-400 transition sm:block ${profileOpen ? "rotate-180" : ""}`} />
              </button>
              {profileOpen ? (
                <div
                  role="menu"
                  className="absolute top-12 right-0 z-30 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-xl dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex items-center gap-3 border-b border-gray-100 px-3.5 py-3 dark:border-gray-700">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-leaf-50 text-[13px] font-semibold tracking-tight text-leaf-700 ring-1 ring-leaf-100 dark:bg-leaf-950/40 dark:text-leaf-300 dark:ring-leaf-900/50">
                      {(principal?.name || "P").slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{principal?.name || "User"}</p>
                      <p className="text-xs text-gray-500">{roleLabel}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/settings");
                    }}
                  >
                    <Settings className="h-4 w-4 text-gray-400" />
                    Settings
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/staff");
                    }}
                  >
                    <UserRound className="h-4 w-4 text-gray-400" />
                    Staff & desks
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                    onClick={() => {
                      setProfileOpen(false);
                      onLogout();
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <main className="app-main min-w-0 w-full">{children}</main>
      </div>
    </div>
  );
}
