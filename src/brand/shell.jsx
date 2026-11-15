import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  CircleDollarSign,
  LogOut,
  Megaphone,
  Menu,
  Moon,
  Package,
  PanelLeft,
  Search,
  Settings,
  ShoppingBag,
  Store,
  Sun,
  X,
} from "lucide-react";
import { findCrumb, menu, navGroups, pathFor } from "./nav";
import { formatDate, greeting } from "./lib/metrics";
import { usePartner } from "./store";
import { useAccessOptional } from "../access";
import { FilterChip } from "./ui";

const noticeMeta = {
  order: { label: "Order", icon: ShoppingBag, tone: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300" },
  product: { label: "Product", icon: Package, tone: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" },
  payment: { label: "Payment", icon: CircleDollarSign, tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" },
  store: { label: "Store", icon: Store, tone: "bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300" },
  announcement: { label: "Platform", icon: Megaphone, tone: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300" },
};

export default function Shell({ children, session, dark, onToggleDark, onLogout }) {
  const {
    brand,
    brands,
    notifications,
    orders,
    products,
    customers,
    tickets,
    switchBrand,
    lockToBrand,
    unlockDemoTenantSwitch,
    flash,
    clearFlash,
    markRead,
    markAllRead,
  } = usePartner();
  const [demoSwitch, setDemoSwitch] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const bellRef = useRef(null);
  const profileRef = useRef(null);
  const searchInputRef = useRef(null);
  const activeModule = location.pathname.split("/")[2] || "dashboard";
  const activeSection = location.pathname.split("/")[3] || "";
  const isDashboard = location.pathname.startsWith("/brand/dashboard");
  const hello = greeting(brand.contactName || brand.name);
  const sectionMenu = menu.find((group) => group.id === activeModule);
  const showSectionChips = Boolean(sectionMenu?.items?.length) && !location.pathname.includes("/item/");
  const unread = notifications.filter((note) => !note.read);
  const recentNotices = useMemo(
    () =>
      [...notifications]
        .sort((left, right) => Number(left.read) - Number(right.read) || right.at.localeCompare(left.at))
        .slice(0, 6),
    [notifications],
  );
  const openTickets = tickets.filter((ticket) => ticket.status === "Open").length;
  const access = useAccessOptional();
  const visibleNavGroups = useMemo(() => {
    if (!access?.canPath) return navGroups;
    return navGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => access.canPath(item.to)),
      }))
      .filter((group) => group.items.length > 0);
  }, [access]);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setBellOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!bellOpen && !profileOpen && !searchOpen && !mobileOpen) return undefined;
    function close(event) {
      if (bellRef.current && !bellRef.current.contains(event.target)) setBellOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
      if (!event.target.closest?.("[data-search-shell]")) setSearchOpen(false);
    }
    function onKey(event) {
      if (event.key === "Escape") {
        setBellOpen(false);
        setProfileOpen(false);
        setSearchOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [bellOpen, mobileOpen, profileOpen, searchOpen]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length < 2) return [];
    const pages = menu.flatMap((group) =>
      group.items
        .filter((item) => `${group.label} ${item[1]}`.toLowerCase().includes(needle))
        .map((item) => ({ kind: "Page", label: item[1], to: pathFor(group.id, item[0]) })),
    );
    const orderHits = orders
      .filter((order) => order.id.toLowerCase().includes(needle))
      .slice(0, 4)
      .map((order) => ({ kind: "Order", label: order.id, to: `/brand/orders/item/${order.id}` }));
    const productHits = products
      .filter((product) => `${product.name} ${product.sku}`.toLowerCase().includes(needle))
      .slice(0, 4)
      .map((product) => ({ kind: "Product", label: product.name, to: `/brand/products/item/${product.id}` }));
    const customerHits = customers
      .filter((customer) => `${customer.name} ${customer.email}`.toLowerCase().includes(needle))
      .slice(0, 4)
      .map((customer) => ({ kind: "Customer", label: customer.name, to: `/brand/customers/item/${customer.id}` }));
    return [...pages, ...orderHits, ...productHits, ...customerHits].slice(0, 8);
  }, [customers, orders, products, query]);

  const desktopWidth = collapsed ? 72 : 256;
  const drawerWidth = mobileOpen ? 288 : desktopWidth;
  const railGap = 14;
  const workspacePad = desktopWidth + railGap * 2;
  const mark = (brand.name || "B").slice(0, 1).toUpperCase();
  const crumbs = findCrumb(location.pathname);

  return (
    <div className="app-shell">
      <aside
        className={`app-rail fixed z-40 flex flex-col overflow-hidden transition-[width,transform,top,bottom,left] duration-200 max-lg:inset-y-0 max-lg:left-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full max-lg:pointer-events-none max-lg:invisible"
        } lg:top-3.5 lg:bottom-3.5 lg:left-3.5 lg:visible lg:translate-x-0 lg:pointer-events-auto`}
        style={{ width: drawerWidth }}
      >
        <div className="flex h-[4.25rem] shrink-0 items-center gap-1 px-3">
          <div className="flex min-w-0 flex-1 items-center gap-2.5 overflow-hidden">
            <div
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-semibold text-white shadow-sm shadow-pink-500/30"
              style={{ background: brand.color || "linear-gradient(135deg,#ec4899,#e11d48)" }}
            >
              {mark}
            </div>
            {collapsed && !mobileOpen ? null : (
              <div className="min-w-0">
                <span className="block truncate text-sm font-semibold whitespace-nowrap">{brand.name}</span>
                <span className="block truncate text-[11px] text-gray-500">Brand Partner</span>
              </div>
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
          <button type="button" className="icon-btn inline-grid shrink-0 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain py-2 pb-3">
          {visibleNavGroups.map((group) => (
            <div key={group.label} className="mb-1.5">
              {collapsed && !mobileOpen ? null : (
                <p className="px-4 pt-2.5 pb-1.5 text-[10px] font-semibold tracking-[0.14em] text-gray-400 uppercase dark:text-gray-500">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = activeModule === item.id;
                const badge =
                  item.id === "support"
                    ? openTickets
                    : item.id === "notifications"
                      ? unread.length
                      : 0;
                return (
                  <NavLink
                    key={item.id}
                    to={item.to}
                    title={item.label}
                    onClick={() => setMobileOpen(false)}
                    className={() => `nav-link ${active ? "nav-link-active" : ""}`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {collapsed && !mobileOpen ? null : <span className="min-w-0 truncate">{item.label}</span>}
                    {!(collapsed && !mobileOpen) && badge > 0 ? (
                      <span className="ml-auto shrink-0 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
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
        <button type="button" className="fixed inset-0 z-30 bg-black/40 lg:hidden" aria-label="Close menu" onClick={() => setMobileOpen(false)} />
      ) : null}

      <div className="app-workspace transition-[padding] duration-200 max-lg:!pl-3" style={{ paddingLeft: workspacePad }}>
        <header className="app-topbar relative sticky top-2 z-20 flex h-14 items-center gap-1 px-2 backdrop-blur sm:top-3.5 sm:h-[4.25rem] sm:gap-2 sm:px-3 lg:px-5">
          <div className="relative z-10 flex min-w-0 flex-1 items-center gap-1.5 lg:gap-2">
            <button type="button" className="icon-btn inline-grid shrink-0 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            {isDashboard ? (
              <p className="min-w-0 truncate text-sm font-bold tracking-tight sm:text-base lg:text-lg">
                <span className="text-gray-600 dark:text-gray-300">{hello.when}, </span>
                <span className="bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">{hello.name.split(" ")[0]}</span>
              </p>
            ) : (
              <div className="min-w-0">
                <p className="hidden truncate text-[11px] text-gray-500 sm:block sm:text-xs">{crumbs.join(" / ")}</p>
                <p className="truncate text-sm font-semibold">{crumbs[crumbs.length - 1] || brand.name}</p>
              </div>
            )}
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-[58%] hidden w-[min(28rem,calc(100%-24rem))] -translate-x-1/2 items-center lg:flex">
            <div className="pointer-events-auto relative w-full" data-search-shell>
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search orders, products, customers"
                className="search-pill"
              />
              {searchOpen && results.length > 0 ? (
                <div className="absolute top-full right-0 left-0 z-30 mt-2 max-h-72 overflow-hidden overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
                  {results.map((result) => (
                    <button
                      key={`${result.kind}-${result.label}`}
                      type="button"
                      className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                      onClick={() => {
                        navigate(result.to);
                        setQuery("");
                        setSearchOpen(false);
                      }}
                    >
                      <span className="truncate">{result.label}</span>
                      <span className="shrink-0 text-xs text-gray-400">{result.kind}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="relative z-10 flex h-10 shrink-0 items-center justify-end gap-0.5 sm:h-11 sm:gap-1 lg:gap-1.5">
            <div className="relative lg:hidden" data-search-shell>
              <button
                type="button"
                className="icon-btn"
                aria-label="Search"
                aria-expanded={searchOpen}
                onClick={() => {
                  setSearchOpen((value) => !value);
                  setBellOpen(false);
                  setProfileOpen(false);
                  window.setTimeout(() => searchInputRef.current?.focus(), 0);
                }}
              >
                <Search className="h-4 w-4" />
              </button>
              {searchOpen ? (
                <div className="absolute top-11 right-0 z-30 w-[min(20rem,calc(100vw-1.25rem))] overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-800">
                  <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      ref={searchInputRef}
                      value={query}
                      onChange={(event) => {
                        setQuery(event.target.value);
                        setSearchOpen(true);
                      }}
                      placeholder="Search orders, products…"
                      className="search-pill"
                    />
                  </div>
                  {results.length > 0 ? (
                    <div className="mt-2 max-h-64 overflow-y-auto">
                      {results.map((result) => (
                        <button
                          key={`${result.kind}-${result.label}`}
                          type="button"
                          className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                          onClick={() => {
                            navigate(result.to);
                            setQuery("");
                            setSearchOpen(false);
                          }}
                        >
                          <span className="truncate">{result.label}</span>
                          <span className="shrink-0 text-xs text-gray-400">{result.kind}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="px-3 py-2 text-xs text-gray-500">Type at least 2 characters</p>
                  )}
                </div>
              ) : null}
            </div>

            <div className="relative" ref={bellRef}>
              <button
                type="button"
                className="icon-btn relative"
                onClick={() => {
                  setBellOpen((value) => !value);
                  setProfileOpen(false);
                  setSearchOpen(false);
                }}
                aria-expanded={bellOpen}
                aria-haspopup="dialog"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unread.length > 0 ? (
                  <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                    {unread.length}
                  </span>
                ) : (
                  <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
                )}
              </button>
              {bellOpen ? (
                <NotificationPanel
                  unread={unread}
                  recentNotices={recentNotices}
                  markAllRead={markAllRead}
                  markRead={markRead}
                  navigate={navigate}
                  setBellOpen={setBellOpen}
                />
              ) : null}
            </div>

            <button type="button" className="icon-btn" onClick={onToggleDark} aria-label="Toggle color mode">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <span className="mx-1 hidden h-7 w-px bg-gray-200 lg:mx-1.5 lg:block dark:bg-gray-700" />

            <div className="relative" ref={profileRef}>
              <button
                type="button"
                className="flex h-9 items-center gap-2 rounded-full border border-transparent bg-transparent py-0.5 pr-0 pl-0 transition hover:border-pink-200 hover:bg-pink-50/40 lg:h-11 lg:border-gray-200/80 lg:bg-white lg:pr-2.5 lg:pl-1 lg:shadow-[0_1px_2px_rgba(17,24,39,0.04)] dark:lg:border-gray-700 dark:lg:bg-gray-900"
                onClick={() => {
                  setProfileOpen((value) => !value);
                  setBellOpen(false);
                  setSearchOpen(false);
                }}
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                aria-label="Account menu"
              >
                <span
                  className="grid h-9 w-9 place-items-center rounded-full text-[13px] font-semibold text-white shadow-sm ring-2 ring-white dark:ring-gray-900"
                  style={{ background: brand.color || "#ec4899" }}
                >
                  {(brand.contactName || brand.name).slice(0, 1)}
                </span>
                <span className="hidden text-left xl:block">
                  <span className="block text-[13px] leading-4 font-semibold text-gray-900 dark:text-white">
                    {brand.contactName || brand.name}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-3 text-gray-500">Brand Partner</span>
                </span>
                <ChevronDown className={`hidden h-3.5 w-3.5 text-gray-400 transition xl:block ${profileOpen ? "rotate-180" : ""}`} />
              </button>
              {profileOpen ? (
                <ProfileMenu
                  brand={brand}
                  brands={brands}
                  session={session}
                  demoSwitch={demoSwitch}
                  setDemoSwitch={setDemoSwitch}
                  switchBrand={switchBrand}
                  lockToBrand={lockToBrand}
                  unlockDemoTenantSwitch={unlockDemoTenantSwitch}
                  navigate={navigate}
                  onLogout={onLogout}
                  setProfileOpen={setProfileOpen}
                />
              ) : null}
            </div>
          </div>
        </header>

        <main className="app-main min-w-0 w-full">
          {flash ? (
            <button type="button" className="mb-3 w-full rounded-xl bg-gray-900 px-3 py-2 text-left text-sm text-white sm:mb-4" onClick={clearFlash}>
              {flash}
            </button>
          ) : null}
          {showSectionChips ? (
            <div className="chip-scroll mb-4">
              {sectionMenu.items.map(([id, label]) => (
                <FilterChip
                  key={id}
                  active={activeSection === id || (!activeSection && id === sectionMenu.items[0][0])}
                  onClick={() => navigate(pathFor(activeModule, id))}
                >
                  {label}
                </FilterChip>
              ))}
            </div>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}

function NotificationPanel({ unread, recentNotices, markAllRead, markRead, navigate, setBellOpen }) {
  return (
    <div
      role="dialog"
      aria-label="Notifications"
      className="absolute top-11 right-0 z-30 w-[min(24rem,calc(100vw-1.25rem))] overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-[0_12px_40px_rgba(17,24,39,0.14)] dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-3.5 py-3 sm:px-4 dark:border-gray-700">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</p>
          <p className="mt-0.5 text-xs text-gray-500">
            {unread.length ? `${unread.length} unread for this brand` : "You're caught up on this brand"}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-2">
          {unread.length > 0 ? (
            <button type="button" className="text-xs font-medium text-gray-500 hover:text-gray-800 dark:hover:text-gray-200" onClick={() => markAllRead()}>
              Mark all read
            </button>
          ) : null}
          <button
            type="button"
            className="text-xs font-semibold text-pink-600 hover:text-pink-700"
            onClick={() => {
              setBellOpen(false);
              navigate("/brand/notifications/all");
            }}
          >
            View all
          </button>
        </div>
      </div>
      <ul className="max-h-[min(22rem,60vh)] overflow-y-auto">
        {recentNotices.length === 0 ? (
          <li className="px-4 py-10 text-center">
            <span className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-700">
              <Bell className="h-4 w-4" />
            </span>
            <p className="text-sm font-medium text-gray-900 dark:text-white">No notices yet</p>
            <p className="mt-1 text-xs text-gray-500">Order and store updates will land here.</p>
          </li>
        ) : (
          recentNotices.map((note) => {
            const meta = noticeMeta[note.type] || noticeMeta.announcement;
            const Icon = meta.icon;
            return (
              <li key={note.id} className="border-b border-gray-50 last:border-0 dark:border-gray-700/60">
                <button
                  type="button"
                  className={`flex w-full gap-3 px-3.5 py-3 text-left transition hover:bg-gray-50 sm:px-4 dark:hover:bg-gray-700/40 ${
                    note.read ? "" : "bg-pink-50/70 dark:bg-pink-950/25"
                  }`}
                  onClick={() => {
                    if (!note.read) markRead(note.id, true);
                    setBellOpen(false);
                    navigate(`/brand/notifications/${note.type === "announcement" ? "announcement" : note.type}`);
                  }}
                >
                  <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full ${meta.tone}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span
                        className={`block text-sm leading-5 ${
                          note.read ? "font-medium text-gray-800 dark:text-gray-100" : "font-semibold text-gray-900 dark:text-white"
                        }`}
                      >
                        {note.title}
                      </span>
                      {!note.read ? <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" /> : null}
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-xs leading-4 text-gray-500">{note.body}</span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-400">
                      <span className="rounded-md bg-gray-100 px-1.5 py-0.5 font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                        {meta.label}
                      </span>
                      <span>·</span>
                      <span>{formatDate(note.at.slice(0, 10))}</span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })
        )}
      </ul>
      <div className="border-t border-gray-100 px-3.5 py-2 dark:border-gray-700">
        <button
          type="button"
          className="w-full rounded-xl py-2 text-center text-sm font-semibold text-pink-600 transition hover:bg-pink-50 dark:text-pink-400 dark:hover:bg-pink-950/20"
          onClick={() => {
            setBellOpen(false);
            navigate("/brand/notifications/all");
          }}
        >
          Open notifications desk
        </button>
      </div>
    </div>
  );
}

function ProfileMenu({
  brand,
  brands,
  session,
  demoSwitch,
  setDemoSwitch,
  switchBrand,
  lockToBrand,
  unlockDemoTenantSwitch,
  navigate,
  onLogout,
  setProfileOpen,
}) {
  return (
    <div
      role="menu"
      className="absolute top-12 right-0 z-30 w-[min(16rem,calc(100vw-1.25rem))] overflow-hidden rounded-2xl border border-gray-200 bg-white py-1 shadow-xl dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="flex items-center gap-3 border-b border-gray-100 px-3.5 py-3 dark:border-gray-700">
        <span
          className="grid h-10 w-10 place-items-center rounded-full text-sm font-semibold text-white"
          style={{ background: brand.color || "#ec4899" }}
        >
          {(brand.contactName || brand.name).slice(0, 1)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{brand.contactName || brand.name}</p>
          <p className="truncate text-xs text-gray-500">{brand.email}</p>
        </div>
      </div>
      <div className="border-b border-gray-100 px-3.5 py-3 dark:border-gray-700">
        <p className="mb-1.5 rounded-lg bg-amber-50 px-2 py-1.5 text-[10px] font-semibold leading-4 text-amber-900 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-100 dark:ring-amber-900">
          Demo only — not production access control. Backend must scope by membership.
        </p>
        <p className="mb-2 text-[11px] text-gray-500">
          Signed-in brand: <span className="font-semibold text-gray-700 dark:text-gray-200">{session?.brandId || brand.id}</span>
        </p>
        {import.meta.env.VITE_ALLOW_DEMO_TENANT_SWITCH === "true" ? (
          <>
            <label className="mb-2 flex items-center gap-2 text-[11px] font-semibold text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={demoSwitch}
                onChange={(event) => {
                  const on = event.target.checked;
                  setDemoSwitch(on);
                  if (on) unlockDemoTenantSwitch();
                  else if (session?.brandId) lockToBrand(session.brandId);
                }}
              />
              Enable demo tenant switcher
            </label>
            <label className="block text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
              Preview brand
              <select
                className="toolbar-field mt-1 w-full"
                value={brand.id}
                disabled={!demoSwitch}
                onChange={(event) => switchBrand(event.target.value, { demo: true })}
              >
                {brands.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : (
          <p className="text-[11px] text-gray-500">
            Tenant switching is disabled. Your session is locked to{" "}
            <span className="font-semibold text-gray-700 dark:text-gray-200">{session?.brandId || brand.id}</span>.
          </p>
        )}
      </div>
      <button
        type="button"
        role="menuitem"
        className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
        onClick={() => {
          setProfileOpen(false);
          navigate("/brand/settings/profile");
        }}
      >
        <Settings className="h-4 w-4 text-gray-400" />
        Settings
      </button>
      <button
        type="button"
        role="menuitem"
        className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
        onClick={() => {
          setProfileOpen(false);
          onLogout();
          navigate("/", { replace: true });
        }}
      >
        <LogOut className="h-4 w-4" />
        Log out
      </button>
    </div>
  );
}
