import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogIn,
  Megaphone,
  MessageSquare,
  Package,
  Shirt,
  Menu,
  Store,
  Truck,
  Users,
  Wallet,
  X,
} from "lucide-react";

/**
 * Landing-only colors
 * 1. Background  2. Text (white)  3. Card  4. Accent (CTA + highlight cards)
 */
const C = {
  bg: "#F7F9FC", // Paper — page background only
  text: "#1F2937", // Body text
  card: "#FFFFFF", // White cards on Paper
  accent: "#EE8802",
};

const landingNav = [
  { href: "#platform", label: "Platform" },
  { href: "#how", label: "How it works" },
  { href: "#results", label: "What you get" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

const muted = "#64748B";
const border = "#E2E8F0";
const soft = "#EEF3FA";

const featureTabs = [
  {
    id: "catalogue",
    label: "Clothing catalogue",
    sub: "Ready-to-sell styles",
    icon: Shirt,
    color: "#EE8802",
    tip: "Choose clothing from our catalogue and list it under your brand—no manufacturing setup required to start.",
    points: [
      { line: "Select styles from a ready clothing catalogue", Icon: Shirt, color: "#EE8802" },
      { line: "List picks under your own brand name", Icon: Store, color: "#001E55" },
      { line: "Start without factory or inventory setup", Icon: Package, color: "#001E55" },
    ],
  },
  {
    id: "store",
    label: "Brand storefront",
    sub: "Your brand store",
    icon: Store,
    color: "#001E55",
    tip: "Set up a branded storefront and present your clothing line under your own label.",
    points: [
      { line: "Publish a store that looks like your brand", Icon: Store, color: "#001E55" },
      { line: "Show selected clothing under your label", Icon: Shirt, color: "#EE8802" },
      { line: "Share one clean link with your audience", Icon: Megaphone, color: "#001E55" },
    ],
  },
  {
    id: "orders",
    label: "Order workspace",
    sub: "Orders you can track",
    icon: Truck,
    color: "#001E55",
    tip: "See your brand’s orders in one place. Central ops handle packing and shipping on the platform side.",
    points: [
      { line: "Track every brand order in one workspace", Icon: Truck, color: "#001E55" },
      { line: "Stay clear as new sales come in", Icon: Bell, color: "#001E55" },
      { line: "Fulfilment support handled on the platform side", Icon: Package, color: "#001E55" },
    ],
  },
  {
    id: "promote",
    label: "Share with audience",
    sub: "Your community",
    icon: Megaphone,
    color: "#001E55",
    tip: "Share your store link with Instagram followers and customers who already know you.",
    points: [
      { line: "Send your store link to Instagram followers", Icon: Megaphone, color: "#001E55" },
      { line: "Reach people who already trust your brand", Icon: Users, color: "#001E55" },
      { line: "Keep the relationship with your audience", Icon: Store, color: "#001E55" },
    ],
  },
  {
    id: "earn",
    label: "Sales & settlements",
    sub: "Brand earnings view",
    icon: Wallet,
    color: "#001E55",
    tip: "Review brand sales and settlement information in your brand workspace.",
    points: [
      { line: "Review sales for your brand in one place", Icon: Wallet, color: "#001E55" },
      { line: "Check settlement views as money moves", Icon: LayoutDashboard, color: "#001E55" },
      { line: "Stay clear without jumping across tools", Icon: Bell, color: "#001E55" },
    ],
  },
  {
    id: "support",
    label: "Brand support",
    sub: "Help desk access",
    icon: MessageSquare,
    color: "#001E55",
    tip: "Use support tools in your workspace when you need help with brand setup or day-to-day questions.",
    points: [
      { line: "Open support from your brand workspace", Icon: MessageSquare, color: "#001E55" },
      { line: "Get help on setup and day-to-day questions", Icon: Users, color: "#001E55" },
      { line: "Keep brand ops moving without guesswork", Icon: LayoutDashboard, color: "#001E55" },
    ],
  },
];

const howSteps = [
  {
    title: "Phase 1 · Choose products",
    body: "Browse the clothing catalogue and select styles for your brand. No manufacturing setup required to start.",
    icon: Package,
    color: "#001E55",
  },
  {
    title: "Phase 2 · Set up store",
    body: "Open your brand workspace, shape the storefront, and list selected clothing under your label.",
    icon: Store,
    color: "#001E55",
  },
  {
    title: "Phase 3 · Share & sell",
    body: "Send your store link to Instagram followers and customers. You keep the relationship with your audience.",
    icon: Megaphone,
    color: "#001E55",
  },
  {
    title: "Phase 4 · Run day to day",
    body: "Track orders and sales views in your workspace while platform ops support fulfilment on their side.",
    icon: Wallet,
    color: "#EE8802",
  },
];

const results = [
  {
    stat: "Products",
    label: "Clothing catalogue you can sell under your brand",
    Icon: Shirt,
    tone: "#EEF3FA",
  },
  {
    stat: "Storefront",
    label: "A brand store to present your clothing line",
    Icon: Store,
    tone: "#EEF3FA",
  },
  {
    stat: "Orders",
    label: "Brand order view with central fulfilment support",
    Icon: Truck,
    tone: "#EEF3FA",
  },
  {
    stat: "Workspace",
    label: "Dashboard for products, store, and sales views",
    Icon: LayoutDashboard,
    tone: "#EEF3FA",
  },
  {
    stat: "Team access",
    label: "Separate logins for brand owner, admin, and staff",
    Icon: Users,
    tone: "#EEF3FA",
  },
  {
    stat: "Next step",
    label: "Open your brand workspace when you’re ready",
    Icon: LogIn,
    tone: "#EE8802",
    featured: true,
  },
];

const faqs = [
  {
    q: "What is Dukify?",
    a: "Dukify helps Instagram creators and aspiring brand owners sell clothing under their own brand. We provide clothing products and a brand workspace with storefront, orders, and related tools—so you do not have to source or manufacture everything yourself to start.",
  },
  {
    q: "Who is it for?",
    a: "Creators and small brand owners who want a clothing label and an online store, and who already have (or are building) an audience to share it with.",
  },
  {
    q: "Do I need my own factory or inventory warehouse?",
    a: "To get started, no. You choose products from the platform catalogue. Stock is managed centrally; you focus on your brand, storefront, and audience.",
  },
  {
    q: "What can I do in the brand workspace?",
    a: "Depending on your role, you can work with products, storefront settings, orders, sales/settlement views, marketing tools in the workspace, and support. Exact screens follow the permissions on your account.",
  },
  {
    q: "How do I get started?",
    a: "Use Log in to open the existing Dukify sign-in page. After you sign in, you go to your brand or platform dashboard based on your account.",
  },
  {
    q: "Do you publish pricing on this site?",
    a: "Yes. There is no subscription fee, no website setup fee, and no monthly maintenance charge. Commission on your marketing budget is 0%. Dukify charges 3% + GST on delivered orders.",
  },
];

const audienceLabels = [
  "Instagram creators",
  "Aspiring brand owners",
  "Clothing labels",
  "Solo founders",
  "Small brand teams",
  "Creator-led stores",
];

/** Shopify-style rotating second line — completes “Start your clothing …” */
const heroRotatingLines = [
  { before: "brand", accent: "“from us”" },
  { before: "label", accent: "“your way”" },
  { before: "store", accent: "“today”" },
  { before: "drop", accent: "“this week”" },
  { before: "line", accent: "“with ease”" },
  { before: "shop", accent: "“for your fans”" },
];

/** Hero background playlist — D2C creator work → brand collab happiness */
const heroVideos = [
  "/landing/hero-2.mp4", // #1 creator at desk laptop — listing / inventory hard work
  "/landing/hero.mp4", // #2 brand / commerce mood
  "/landing/hero-3.mp4", // #3 happy collab on laptop — B2C brand partnership feel
];

const HERO_POSTER = {
  webp: "/landing/hero-poster.webp",
  webp640: "/landing/hero-poster-640.webp",
  jpg: "/landing/hero-poster.jpg",
  width: 864,
  height: 1152,
};

/** Foreign fashion storefronts — rotating demo screenshots (different brand types) */
const storeDemos = [
  {
    name: "Everlane",
    url: "everlane.com",
    href: "https://www.everlane.com/",
    img: "/landing/store-demo-1.webp",
    img800: "/landing/store-demo-1-800.webp",
    width: 1200,
    height: 750,
  },
  {
    name: "Reformation",
    url: "thereformation.com",
    href: "https://www.reformation.com/",
    img: "/landing/store-demo-2.webp",
    img800: "/landing/store-demo-2-800.webp",
    width: 1200,
    height: 750,
  },
  {
    name: "Allbirds",
    url: "allbirds.com",
    href: "https://www.allbirds.com/",
    img: "/landing/store-demo-3.webp",
    img800: "/landing/store-demo-3-800.webp",
    width: 1200,
    height: 750,
  },
];

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function prefersSaveData() {
  if (typeof navigator === "undefined") return false;
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  return Boolean(conn?.saveData || conn?.effectiveType === "slow-2g" || conn?.effectiveType === "2g");
}

function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (prefersReducedMotion()) {
      setShown(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShown(true);
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`lp-reveal ${shown ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function LandingPage() {
  const [tab, setTab] = useState(featureTabs[0].id);
  const [openFaq, setOpenFaq] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [heroLine, setHeroLine] = useState(0);
  const [heroAnim, setHeroAnim] = useState(true);
  const [storeDemo, setStoreDemo] = useState(0);
  const [heroVid, setHeroVid] = useState(0);
  const [heroVideoEnabled, setHeroVideoEnabled] = useState(false);
  const [heroVideoPlaying, setHeroVideoPlaying] = useState(false);
  const heroVideoRef = useRef(null);
  const storeSectionRef = useRef(null);
  const storeInViewRef = useRef(false);
  const prefetchedVideos = useRef(new Set());
  const active = featureTabs.find((t) => t.id === tab) || featureTabs[0];
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  const rotating = heroRotatingLines[heroLine];
  const liveStore = storeDemos[storeDemo];

  // Poster paints first; enable video after first paint unless reduced-motion / save-data.
  useEffect(() => {
    if (prefersReducedMotion() || prefersSaveData()) {
      setHeroVideoEnabled(false);
      return undefined;
    }
    let cancelled = false;
    const raf = window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        if (!cancelled) setHeroVideoEnabled(true);
      }, 50);
    });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
    };
  }, []);

  // Load only the active clip — no remount key (avoids blank flash + full reload thrash).
  useEffect(() => {
    const el = heroVideoRef.current;
    if (!el || !heroVideoEnabled) return undefined;

    const src = heroVideos[heroVid];
    const applySpeed = () => {
      try {
        el.playbackRate = 1.85;
      } catch {
        /* ignore */
      }
    };
    const onLoaded = () => applySpeed();
    const onPlaying = () => setHeroVideoPlaying(true);
    const onWaiting = () => setHeroVideoPlaying(false);
    const onError = () => setHeroVideoPlaying(false);

    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("playing", onPlaying);
    el.addEventListener("waiting", onWaiting);
    el.addEventListener("error", onError);

    if (el.getAttribute("src") !== src) {
      setHeroVideoPlaying(false);
      el.src = src;
      el.load();
    }
    applySpeed();
    const playAttempt = el.play();
    if (playAttempt?.catch) {
      playAttempt.catch(() => setHeroVideoPlaying(false));
    }

    return () => {
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("playing", onPlaying);
      el.removeEventListener("waiting", onWaiting);
      el.removeEventListener("error", onError);
    };
  }, [heroVid, heroVideoEnabled]);

  // Prefetch next hero clip only when current is nearly done — never preload all videos.
  useEffect(() => {
    const el = heroVideoRef.current;
    if (!el || !heroVideoEnabled) return undefined;

    const onTime = () => {
      if (!el.duration || !Number.isFinite(el.duration)) return;
      if (el.currentTime / el.duration < 0.82) return;
      const next = heroVideos[(heroVid + 1) % heroVideos.length];
      if (prefetchedVideos.current.has(next)) return;
      prefetchedVideos.current.add(next);
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.as = "video";
      link.href = next;
      document.head.appendChild(link);
    };

    el.addEventListener("timeupdate", onTime);
    return () => el.removeEventListener("timeupdate", onTime);
  }, [heroVid, heroVideoEnabled]);

  useEffect(() => {
    // Refresh / revisit always opens on first slide (hero), not a mid-page restore
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    if (window.location.hash && window.location.hash !== "#top") {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    setHeroVid(0);
    setHeroLine(0);

    const jumpTop = () => window.scrollTo(0, 0);
    jumpTop();
    // Browser may scroll to old hash after paint — pin hero again
    const t1 = window.setTimeout(jumpTop, 0);
    const t2 = window.setTimeout(jumpTop, 50);

    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      setPastHero(window.scrollY > Math.min(window.innerHeight * 0.72, 640));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const id = setInterval(() => {
      setHeroAnim(false);
      window.setTimeout(() => {
        setHeroLine((i) => (i + 1) % heroRotatingLines.length);
        setHeroAnim(true);
      }, 280);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  // Rotate store demos only while the showcase is near the viewport.
  useEffect(() => {
    const root = storeSectionRef.current;
    if (!root) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        storeInViewRef.current = entry.isIntersecting;
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(root);
    const id = setInterval(() => {
      if (!storeInViewRef.current) return;
      setStoreDemo((i) => (i + 1) % storeDemos.length);
    }, 4200);
    return () => {
      io.disconnect();
      clearInterval(id);
    };
  }, []);

  return (
    <div className="landing-3c min-h-screen" style={{ background: C.bg, color: C.text }}>
      <style>{`
        .landing-3c {
          --lp-bg: ${C.bg};
          --lp-text: ${C.text};
          --lp-card: ${C.card};
          --lp-accent: ${C.accent};
          --lp-muted: ${muted};
          --lp-border: ${border};
          font-family: "Plus Jakarta Sans", Inter, system-ui, sans-serif;
          letter-spacing: -0.01em;
          color-scheme: light;
        }
        .lp-shell {
          width: 100%;
          max-width: 1280px;
          margin-left: auto;
          margin-right: auto;
          padding-left: clamp(1.5rem, 6vw, 4rem);
          padding-right: clamp(1.5rem, 6vw, 4rem);
        }
        .landing-3c h1,
        .landing-3c h2,
        .landing-3c h3 {
          letter-spacing: -0.035em;
        }
        .lp-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          border-radius: 999px;
          background: var(--lp-accent);
          color: #001E55;
          font-weight: 700;
          font-size: 0.9375rem;
          padding: 0.85rem 1.4rem;
          transition: transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease;
        }
        .lp-btn-primary:hover {
          transform: translateY(-2px);
          filter: brightness(1.06);
          box-shadow: 0 12px 28px rgba(238, 136, 2, 0.28);
        }
        .lp-btn-primary:focus-visible {
          outline: 2px solid #001E55;
          outline-offset: 4px;
        }
        #advantage .lp-btn-primary:focus-visible,
        #advantage .lp-btn-primary:focus {
          outline: 2px solid #ffffff;
          outline-offset: 4px;
        }
        .lp-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-weight: 600;
          font-size: 0.9375rem;
          color: var(--lp-text);
          transition: gap 0.2s ease, opacity 0.2s ease;
        }
        .lp-btn-ghost:hover { gap: 0.55rem; color: #001E55; opacity: 1; }
        .lp-btn-outline {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          border: 1px solid var(--lp-border);
          background: transparent;
          color: var(--lp-text);
          font-weight: 600;
          font-size: 0.875rem;
          padding: 0.65rem 1.1rem;
          transition: background 0.2s ease;
        }
        .lp-btn-outline:hover { background: var(--lp-card); }
        .lp-reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1);
        }
        .lp-reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .lp-card {
          transition: transform 0.25s ease, border-color 0.25s ease;
        }
        .lp-card:hover {
          transform: translateY(-4px);
          border-color: rgba(238, 136, 2, 0.45);
        }
        .lp-card-accent {
          background: var(--lp-accent) !important;
          color: var(--lp-text);
          border-color: transparent !important;
        }
        .lp-card-accent p,
        .lp-card-accent .lp-card-title { color: #001E55 !important; }
        .lp-marquee-wrap {
          position: relative;
          overflow: hidden;
          mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
        }
        .lp-marquee {
          display: flex;
          width: max-content;
          gap: 1.75rem;
          animation: lp-marquee 32s linear infinite;
        }
        .lp-marquee-wrap:hover .lp-marquee {
          animation-play-state: paused;
        }
        .lp-marquee-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
          white-space: nowrap;
          border: none;
          background: transparent;
          border-radius: 0;
          padding: 0.35rem 0.85rem;
          font-size: 0.95rem;
          font-weight: 600;
          color: #001E55;
          letter-spacing: -0.01em;
        }
        .lp-marquee-dot {
          width: 0.45rem;
          height: 0.45rem;
          border-radius: 999px;
          background: var(--lp-accent);
          flex-shrink: 0;
        }
        @keyframes lp-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .lp-hero-glow {
          background: radial-gradient(ellipse 70% 45% at 50% -5%, rgba(0, 30, 85, 0.08), transparent 60%);
        }
        .lp-panel {
          border-radius: 1.75rem;
          border: 1px solid var(--lp-border);
          background: var(--lp-card);
          overflow: hidden;
        }
        .lp-3d-stage {
          position: relative;
          display: grid;
          place-items: center;
          overflow: hidden;
          border-radius: 1.25rem;
          background:
            radial-gradient(ellipse at 50% 80%, rgba(105, 206, 17, 0.18), transparent 55%),
            linear-gradient(180deg, rgba(255,255,255,0.04), transparent 40%);
        }
        .lp-3d-stage img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 18px 28px rgba(0,0,0,0.55));
          transition: transform 0.35s ease;
        }
        .lp-3d-stage:hover img {
          transform: translateY(-6px) scale(1.04);
        }
        .lp-3d-float {
          animation: lp-float 4.5s ease-in-out infinite;
        }
        .lp-3d-float-delay {
          animation: lp-float 4.5s ease-in-out infinite 0.8s;
        }
        @keyframes lp-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .lp-hero-rotate {
          display: block;
          min-height: 2.15em;
          overflow: visible;
        }
        @media (min-width: 640px) {
          .lp-hero-rotate {
            min-height: 1.15em;
            overflow: hidden;
          }
        }
        .lp-hero-rotate-inner {
          display: inline-block;
          transition: opacity 0.28s ease, transform 0.28s ease;
        }
        .lp-hero-rotate-inner.is-in {
          opacity: 1;
          transform: translateY(0);
        }
        .lp-hero-rotate-inner.is-out {
          opacity: 0;
          transform: translateY(0.45em);
        }
        @keyframes lp-store-pulse {
          0%, 100% { opacity: 0.45; }
          50% { opacity: 1; }
        }
        .lp-store-live {
          animation: lp-store-pulse 1.6s ease-in-out infinite;
        }
        .lp-store-shot {
          transition: opacity 0.55s ease, transform 0.55s ease;
        }
        .lp-store-shot.is-active {
          opacity: 1;
          transform: scale(1);
        }
        .lp-store-shot.is-idle {
          opacity: 0;
          transform: scale(1.03);
          pointer-events: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .lp-reveal { opacity: 1; transform: none; transition: none; }
          .lp-marquee { animation: none; }
          .lp-card:hover, .lp-btn-primary:hover { transform: none; }
          .lp-hero-rotate-inner { transition: none; }
          .lp-store-live { animation: none; }
          .lp-store-shot { transition: none; }
        }
      `}</style>

      <header
        className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
        style={{
          background: menuOpen ? "#F7F9FC" : scrolled ? "rgba(247,249,252,0.96)" : "transparent",
          backdropFilter: menuOpen ? "none" : scrolled ? "blur(10px)" : "none",
          borderBottom: menuOpen || scrolled ? "1px solid #E2E8F0" : "1px solid transparent",
        }}
      >
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center gap-6 px-4 sm:px-10 md:px-14 lg:h-[4.25rem] lg:px-16 xl:px-20">
          {/* Left: logo + nav links (Shopify layout) */}
          <div className="flex min-w-0 flex-1 items-center gap-6 lg:gap-8">
            <a href="#top" className="inline-flex shrink-0 items-center" onClick={() => setMenuOpen(false)}>
              <img
                src={menuOpen || scrolled ? "/logo/logo-ducku-2.png" : "/logo/logo-ducku-light.png"}
                alt="Dukify"
                className="h-8 w-auto sm:h-10"
              />
            </a>

            <nav
              className={`hidden items-center rounded-full p-1 text-[0.9rem] font-medium md:flex lg:text-[0.95rem] ${
                scrolled
                  ? "border border-[#E2E8F0] bg-[#EEF3FA]/70 text-[#001E55]/75"
                  : "border border-white/10 bg-white/[0.04] text-white/75"
              }`}
            >
              {landingNav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-1.5 transition ${scrolled ? "hover:bg-[#EEF3FA]" : "hover:bg-white/10 hover:text-white"}`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-5">
            <Link
              to="/login"
              className={`hidden text-[1rem] font-medium transition-opacity hover:opacity-70 sm:inline lg:text-[1.05rem] ${scrolled ? "text-[#001E55]" : "text-white"}`}
            >
              Log in
            </Link>
            <Link
              to="/login"
              className="hidden items-center justify-center rounded-full px-5 py-2.5 text-[0.95rem] font-bold text-[#001E55] transition hover:brightness-110 sm:inline-flex sm:px-6"
              style={{ background: C.accent }}
            >
              Start for free
            </Link>
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-full md:hidden"
              style={{ color: menuOpen || scrolled ? "#001E55" : "#FFFFFF" }}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X className="h-6 w-6" strokeWidth={2.25} /> : <Menu className="h-6 w-6" strokeWidth={2.25} />}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div className="md:hidden">
            <nav className="fixed inset-x-0 top-16 bottom-0 z-50 overflow-y-auto border-t border-[#E2E8F0] bg-[#F7F9FC] px-4 pb-8 pt-2">
              {landingNav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex h-12 items-center border-b border-[#E2E8F0] text-base font-semibold text-[#001E55]"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="mt-4 flex flex-col gap-3">
                <Link
                  to="/login"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full border border-[#001E55] bg-white text-[0.95rem] font-bold text-[#001E55]"
                  onClick={() => setMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/login"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full text-[0.95rem] font-bold text-[#001E55]"
                  style={{ background: C.accent }}
                  onClick={() => setMenuOpen(false)}
                >
                  Start for free
                </Link>
              </div>
            </nav>
          </div>
        ) : null}
      </header>

      <main id="top">
        <section className="relative isolate min-h-[78svh] overflow-hidden sm:min-h-[100svh]">
          {/* Layer 1a — poster paints immediately (LCP). Never lazy-load. */}
          <picture>
            <source
              type="image/webp"
              srcSet={`${HERO_POSTER.webp640} 640w, ${HERO_POSTER.webp} 1200w`}
              sizes="100vw"
            />
            <img
              src={HERO_POSTER.jpg}
              alt=""
              width={HERO_POSTER.width}
              height={HERO_POSTER.height}
              decoding="async"
              fetchPriority="high"
              className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-center"
              style={{ opacity: heroVideoPlaying ? 0 : 1, transition: "opacity 400ms ease" }}
              aria-hidden="true"
            />
          </picture>

          {/* Layer 1b — hero video loads after paint; only one clip at a time */}
          {heroVideoEnabled ? (
            <video
              ref={heroVideoRef}
              className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-center"
              style={{ opacity: heroVideoPlaying ? 1 : 0, transition: "opacity 400ms ease" }}
              muted
              playsInline
              preload="metadata"
              poster={HERO_POSTER.jpg}
              onEnded={() => setHeroVid((i) => (i + 1) % heroVideos.length)}
            />
          ) : null}

          {/* Layer 2 — dark overlay so text stays readable */}
          <div
            className="absolute inset-0 z-[1] sm:hidden"
            style={{
              background:
                "radial-gradient(120% 70% at 50% 46%, rgba(9,9,11,0.62) 0%, rgba(9,9,11,0.38) 58%, rgba(9,9,11,0.22) 100%)",
            }}
          />
          <div
            className="absolute inset-0 z-[1] hidden sm:block"
            style={{
              background:
                "linear-gradient(180deg, rgba(9,9,11,0.55) 0%, rgba(9,9,11,0.72) 45%, rgba(9,9,11,0.85) 100%)",
            }}
          />

          {/* Layer 3 — phone and desktop: copy centered on the first screen */}
          <div className="lp-shell relative z-[2] flex min-h-[78svh] items-center justify-center py-16 text-center sm:min-h-[100svh] sm:py-32">
            <div className="mx-auto flex w-full max-w-4xl flex-col items-center">
              <h1 className="font-bold tracking-[-0.04em] text-white">
                <span className="block text-[2.85rem] leading-[1.02] min-[420px]:text-[3.05rem] sm:text-[clamp(3rem,8.5vw,6.25rem)] sm:leading-[1.05]">Start your clothing</span>
                <span className="lp-hero-rotate mt-1.5 block min-h-[2.15em] overflow-visible text-[2.3rem] leading-[1.05] min-[420px]:text-[2.5rem] sm:min-h-[1.15em] sm:overflow-hidden sm:text-[clamp(2.35rem,6.5vw,4.75rem)]">
                  <span className={`lp-hero-rotate-inner ${heroAnim ? "is-in" : "is-out"}`}>
                    {rotating.before}{" "}
                    <span style={{ color: C.accent }}>{rotating.accent}</span>
                  </span>
                </span>
              </h1>

              <p className="mt-4 max-w-[17.5rem] text-[0.92rem] font-medium leading-snug text-white/80 sm:mt-6 sm:max-w-xl sm:text-[clamp(1rem,2vw,1.2rem)] sm:leading-relaxed">
                Your workspace to pick clothing, launch a branded store, and sell to the audience you already have.
              </p>

              <div className="mt-6 flex w-full max-w-[16.25rem] flex-col items-stretch gap-2.5 sm:mt-16 sm:w-auto sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
                <Link
                  to="/login"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full px-8 text-[0.95rem] font-bold leading-none tracking-tight text-[#001E55] transition hover:brightness-110 sm:w-auto"
                  style={{ background: C.accent }}
                >
                  Start for free
                </Link>
                <Link
                  to="/support"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 text-[0.95rem] font-semibold leading-none tracking-tight text-white transition hover:border-white/40 hover:bg-white/15 sm:w-auto"
                >
                  Book a demo
                  <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2.25} />
                </Link>
              </div>
            </div>
          </div>

        </section>

        <section className="relative z-10 -mt-8 rounded-t-[2rem] py-12 sm:mt-0 sm:rounded-none sm:py-16" style={{ background: C.bg }}>
          <div className="mb-8 flex flex-col items-center gap-2 px-4 text-center">
            <h2 className="max-w-xl text-[clamp(1.5rem,3vw,2.1rem)] font-bold tracking-[-0.03em] text-[#001E55]">
              Creators and brand owners who want their own clothing label
            </h2>
          </div>

          <div className="lp-marquee-wrap">
            <div className="lp-marquee">
              {[...audienceLabels, ...audienceLabels].map((name, i) => (
                <span key={`${name}-${i}`} className="lp-marquee-chip">
                  <span className="lp-marquee-dot" />
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Wishlink-style statement + floating UI over visual */}
        <section className="py-16 sm:py-24" style={{ background: C.bg }}>
          <div className="lp-shell">
            <Reveal>
              <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="max-w-xl">
                  <h2 className="text-[clamp(2.1rem,4.5vw,3.5rem)] font-bold leading-[1.12] tracking-[-0.035em] text-[#001E55]">
                    Empowering creators to launch, sell and{" "}
                    <em className="not-italic font-bold" style={{ color: C.accent }}>
                      grow
                    </em>
                  </h2>
                  <p className="mt-5 text-base leading-relaxed text-[#64748B] sm:text-lg">
                    Pick clothing from our catalogue, open a branded storefront, and run day-to-day brand work from one
                    workspace—built for Instagram creators and aspiring labels.
                  </p>
                  <a href="#platform" className="lp-btn-outline mt-8">
                    See the platform <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                </div>

                <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
                  {/* Wishlink-style: lifestyle creator image, no heavy border */}
                  <div className="relative overflow-hidden rounded-[1.75rem] bg-[#EEF3FA]">
                    <img
                      src="/landing/lp-creator.webp"
                      srcSet="/landing/lp-creator-640.webp 640w, /landing/lp-creator.webp 900w"
                      sizes="(max-width: 1024px) 100vw, 480px"
                      alt="Creator shopping for a clothing brand"
                      width={900}
                      height={600}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[4/5] w-full object-cover object-[center_20%]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#001E55]/25 via-transparent to-transparent" />
                  </div>

                  {/* Floating chips — simple, soft shadow, no thick borders */}
                  <div className="absolute left-3 top-6 z-10 flex max-w-[12.5rem] items-center gap-2 rounded-2xl bg-[#FFFFFF] p-2 shadow-[0_12px_32px_rgba(0,30,85,0.16)] sm:left-4 sm:top-8 sm:max-w-[13.5rem] sm:p-2.5">
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[#001E55]"
                      style={{ background: C.accent }}
                    >
                      <Shirt className="h-4 w-4" strokeWidth={2.25} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold leading-tight text-[#001E55]">Style listed</p>
                      <p className="mt-0.5 text-[10px] leading-tight text-[#64748B]">From your catalogue</p>
                    </div>
                  </div>

                  <div className="absolute right-3 top-[38%] z-10 flex max-w-[13rem] items-center gap-2 rounded-2xl bg-[#FFFFFF] p-2 shadow-[0_12px_32px_rgba(0,30,85,0.16)] sm:right-0 sm:max-w-[14rem] sm:p-2.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#001E55] text-[#FFFFFF]">
                      <Store className="h-4 w-4" strokeWidth={2.25} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold leading-tight text-[#001E55]">Store live</p>
                      <p className="mt-0.5 text-[10px] leading-tight text-[#64748B]">Under your brand name</p>
                    </div>
                  </div>

                  <div className="absolute bottom-5 left-3 z-10 flex items-center gap-2 rounded-full bg-[#FFFFFF] py-1.5 pl-1.5 pr-3 shadow-[0_12px_32px_rgba(0,30,85,0.14)] sm:bottom-6 sm:left-4">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-[#001E55]/15 text-[#001E55]">
                      <Truck className="h-3.5 w-3.5" strokeWidth={2.25} />
                    </span>
                    <p className="text-[11px] font-semibold text-[#001E55]">
                      New order <span className="font-medium text-[#64748B]">in workspace</span>
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Free brand website — section heading + 80% site / 20% side copy */}
        <section id="website" ref={storeSectionRef} className="pb-6 pt-12 sm:py-24" style={{ background: C.bg }}>
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.12] tracking-[-0.035em] text-[#001E55]">
                  Your clothing storefront, included free
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#64748B] sm:text-lg">
                  Example clothing storefronts below — the kind of live brand site you get with Dukify, under your
                  own name.
                </p>
              </div>
            </Reveal>

            <Reveal delay={40}>
              <div className="mt-10 grid items-stretch gap-4 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.28fr)] lg:gap-5 xl:gap-6">
                {/* ~80% — storefront examples showcase */}
                <div className="flex min-h-[320px] flex-col overflow-hidden rounded-[1.25rem] bg-[#1a1814] shadow-[0_28px_70px_rgba(0,30,85,0.16)] sm:min-h-[420px] sm:rounded-[1.4rem] lg:min-h-[560px]">
                  <div className="flex shrink-0 items-center gap-2 border-b border-white/10 bg-[#2a2620] px-3 py-2.5 sm:px-4">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                    <a
                      href={liveStore.href}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-2 flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-black/35 px-3 py-1.5 transition hover:bg-black/50"
                    >
                      <span className="lp-store-live h-1.5 w-1.5 shrink-0 rounded-full bg-[#EE8802]" />
                      <span className="truncate text-[11px] font-medium text-white/70 sm:text-xs">
                        Example · {liveStore.name} · {liveStore.url}
                      </span>
                    </a>
                    <div className="hidden gap-1 sm:flex">
                      {storeDemos.map((demo, i) => (
                        <button
                          key={demo.url}
                          type="button"
                          aria-label={`Show ${demo.name} example`}
                          onClick={() => setStoreDemo(i)}
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: i === storeDemo ? 14 : 6,
                            background: i === storeDemo ? "#EEF3FA" : "rgba(255,255,255,0.35)",
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="relative min-h-0 flex-1 overflow-hidden bg-[#111]">
                    {/* Only mount nearby demos so we don't download all large shots on first paint */}
                    {storeDemos.map((demo, i) => {
                      const near = i === storeDemo || i === (storeDemo + 1) % storeDemos.length;
                      if (!near) return null;
                      return (
                        <img
                          key={demo.url}
                          src={demo.img}
                          srcSet={`${demo.img800} 800w, ${demo.img} 1200w`}
                          sizes="(max-width: 1024px) 100vw, 72vw"
                          alt={`${demo.name} storefront example`}
                          width={demo.width}
                          height={demo.height}
                          loading="lazy"
                          decoding="async"
                          className={`lp-store-shot absolute inset-0 h-full w-full object-cover object-top ${
                            i === storeDemo ? "is-active" : "is-idle"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Side copy — one clear text card, no code blocks */}
                <div className="flex h-full flex-col justify-center rounded-[1.25rem] border border-[#E2E8F0] bg-[#FFFFFF] px-5 py-6 sm:px-6 sm:py-8 lg:px-7 lg:py-10">
                  <h3 className="text-[1.45rem] font-extrabold leading-tight tracking-tight text-[#001E55] sm:text-[1.65rem]">
                    Your clothing website is completely free
                  </h3>
                  <p className="mt-4 text-[0.95rem] leading-relaxed text-[#64748B] sm:text-base">
                    Dukify provides a full brand website at zero cost. There is no setup fee and no monthly charge
                    for the site — you get a live clothing store under your own brand name.
                  </p>
                  <p className="mt-4 text-[0.95rem] leading-relaxed text-[#64748B] sm:text-base">
                    Share one link with your Instagram audience. They shop your collection while you stay focused on
                    your brand.
                  </p>
                  <p className="mt-5 text-sm font-semibold leading-relaxed text-[#001E55]">
                    Free website. Your brand. Ready to share.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="platform" className="scroll-mt-20 pb-16 pt-6 sm:py-28" style={{ background: C.bg }}>
          <div className="lp-shell">
            <Reveal>
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.12] tracking-[-0.035em] text-[#001E55]">
                  What you get to run your brand
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#64748B] sm:text-lg">
                  Products, storefront, orders, and earnings views—in one creator workspace.
                </p>
              </div>
            </Reveal>

            {/* Soft offering tabs — white active, no green text */}
            <Reveal delay={40}>
              <div className="mt-10 flex gap-2 overflow-x-auto pb-1 sm:justify-center sm:gap-3">
                {featureTabs.map((item) => {
                  const Icon = item.icon;
                  const on = item.id === tab;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTab(item.id)}
                      className="inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition"
                      style={{
                        background: on ? C.accent : soft,
                        color: on ? "#001E55" : muted,
                      }}
                    >
                      <Icon className="h-4 w-4" style={{ color: on ? "#001E55" : item.color }} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </Reveal>

            {/* Clean split: copy + real dashboard — same text scale as other content bands */}
            <Reveal delay={80}>
              <div className="mt-10 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="max-w-lg">
                  <h3 className="text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.1] tracking-[-0.035em] text-[#001E55]">
                    {active.sub}
                  </h3>
                  <p className="mt-5 text-base leading-relaxed text-[#64748B] sm:text-lg">
                    {active.tip}
                  </p>
                  <ul className="mt-8 space-y-4">
                    {active.points.map(({ line, Icon, color }) => (
                      <li key={line} className="flex items-center gap-3.5 text-[0.95rem] font-medium text-[#001E55]">
                        <span
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
                          style={{ background: `${color}1a`, color }}
                        >
                          <Icon className="h-4 w-4" strokeWidth={2} />
                        </span>
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Product-style media — image only, no nested chrome card */}
                <div className="overflow-hidden rounded-[1.5rem]">
                  <img
                    src="/landing/brand-dashboard.png"
                    alt="Dukify workspace dashboard"
                    width={1917}
                    height={938}
                    loading="lazy"
                    decoding="async"
                    className="h-auto w-full"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Open on Paper bg — no outer card wrapper */}
        <section id="brand-flow" className="py-16 sm:py-24" style={{ background: C.bg }}>
          <div className="lp-shell space-y-20 sm:space-y-28">
              <Reveal>
                <div className="mx-auto max-w-3xl text-center">
                  <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.12] tracking-[-0.035em] text-[#001E55]">
                    From products to selling, clearly laid out
                  </h2>
                  <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#64748B] sm:text-lg">
                    Three clear steps: pick clothing, share with your audience, and stay on top of orders in one place.
                  </p>
                </div>
              </Reveal>

              {/* Band 1 — copy + images only */}
              <Reveal>
                <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                  <div className="max-w-lg">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#64748B]">
                      01 · Catalogue & storefront
                    </p>
                    <h3 className="mt-4 text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.1] tracking-[-0.035em] text-[#001E55]">
                      Start with products.{" "}
                      <span className="text-[#64748B]">Build your label.</span>
                    </h3>
                    <p className="mt-5 text-base leading-relaxed text-[#64748B] sm:text-lg">
                      Launch a clothing brand with catalogue styles we provide—then run storefront and workspace
                      without building a factory first.
                    </p>
                    <ul className="mt-8 space-y-4">
                      {[
                        { line: "Select clothing from our product catalogue", Icon: Shirt, color: "#EE8802" },
                        { line: "Build and publish your brand storefront", Icon: Store, color: "#001E55" },
                        { line: "Manage brand activity from one workspace", Icon: LayoutDashboard, color: "#001E55" },
                      ].map(({ line, Icon, color }) => (
                        <li key={line} className="flex items-center gap-3.5 text-[0.95rem] font-medium text-[#001E55]">
                          <span
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
                            style={{ background: `${color}1a`, color }}
                          >
                            <Icon className="h-4 w-4" strokeWidth={2} />
                          </span>
                          {line}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="relative">
                    <div className="grid grid-cols-12 gap-3 sm:gap-4">
                      <div className="relative col-span-12 overflow-hidden rounded-[1.5rem] sm:col-span-7 sm:row-span-2 sm:rounded-[1.75rem]">
                        <img
                          src="/landing/lp-d2c-rack.webp"
                          alt="Clothing rack ready for a brand line"
                          width={1000}
                          height={667}
                          loading="lazy"
                          decoding="async"
                          className="h-full min-h-[280px] w-full object-cover sm:min-h-[420px]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#001E55]/50 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5">
                          <p className="text-sm font-semibold text-white">Catalogue styles</p>
                          <p className="mt-0.5 text-xs text-white/70">Pick looks for your brand store</p>
                        </div>
                      </div>

                      <div className="relative col-span-6 overflow-hidden rounded-[1.25rem] sm:col-span-5">
                        <img
                          src="/landing/lp-d2c-flatlay.webp"
                          alt="Apparel flat lay for brand merchandising"
                          width={800}
                          height={1200}
                          loading="lazy"
                          decoding="async"
                          className="aspect-[4/3] h-full w-full object-cover sm:aspect-auto sm:min-h-[200px]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#001E55]/45 to-transparent" />
                        <p className="absolute bottom-3 left-3 text-xs font-semibold text-white">Ready to list</p>
                      </div>

                      <div className="relative col-span-6 overflow-hidden rounded-[1.25rem] sm:col-span-5">
                        <img
                          src="/landing/lp-d2c-store.webp"
                          alt="Retail clothing display"
                          width={800}
                          height={534}
                          loading="lazy"
                          decoding="async"
                          className="aspect-[4/3] h-full w-full object-cover sm:aspect-auto sm:min-h-[200px]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#001E55]/45 to-transparent" />
                        <p className="absolute bottom-3 left-3 text-xs font-semibold text-white">Brand storefront</p>
                      </div>
                    </div>

                    <div className="absolute -left-2 top-6 z-10 hidden items-center gap-2 rounded-2xl bg-[#FFFFFF] p-2.5 shadow-[0_14px_36px_rgba(0,30,85,0.14)] sm:flex">
                      <span
                        className="grid h-8 w-8 place-items-center rounded-xl text-[#001E55]"
                        style={{ background: C.accent }}
                      >
                        <Shirt className="h-3.5 w-3.5" strokeWidth={2.25} />
                      </span>
                      <div>
                        <p className="text-[11px] font-bold text-[#001E55]">Style selected</p>
                        <p className="text-[10px] text-[#64748B]">Under your label</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Band 2 — open layout, no nested cards */}
              <Reveal delay={40}>
                <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                  <div className="order-2 space-y-6 lg:order-1">
                    {[
                      {
                        row: "Share with Instagram followers",
                        hint: "Send your store link to people who already know you",
                        Icon: Megaphone,
                        color: "#001E55",
                      },
                      {
                        row: "Send people to your brand store",
                        hint: "Present selected clothing under your own label",
                        Icon: Store,
                        color: "#001E55",
                      },
                      {
                        row: "Follow new orders in your workspace",
                        hint: "Stay on top of brand activity as sales come in",
                        Icon: Bell,
                        color: "#001E55",
                      },
                    ].map(({ row, hint, Icon, color }, i) => (
                      <div key={row} className="flex items-start gap-4">
                        <span
                          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
                          style={{ background: `${color}22`, color }}
                        >
                          <Icon className="h-5 w-5" strokeWidth={1.75} />
                        </span>
                        <div className="min-w-0 pt-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-[#64748B]/70">0{i + 1}</span>
                            <p className="text-sm font-semibold text-[#001E55] sm:text-[0.95rem]">{row}</p>
                          </div>
                          <p className="mt-1 text-sm leading-relaxed text-[#64748B]">{hint}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="order-1 max-w-lg lg:order-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#64748B]">
                      02 · Share & sell
                    </p>
                    <h3 className="mt-4 text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.1] tracking-[-0.035em] text-[#001E55]">
                      You bring the brand.{" "}
                      <span className="text-[#64748B]">We bring the products.</span>
                    </h3>
                    <p className="mt-5 text-base leading-relaxed text-[#64748B] sm:text-lg">
                      You bring audience and identity. We provide clothing and the workspace to list, sell, and stay
                      clear on brand activity.
                    </p>
                  </div>
                </div>
              </Reveal>

              {/* Band 3 — dashboard image only, no chrome card stack */}
              <Reveal delay={40}>
                <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                  <div className="max-w-lg">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#64748B]">
                      03 · Orders & sales
                    </p>
                    <h3 className="mt-4 text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.1] tracking-[-0.035em] text-[#001E55]">
                      Orders and brand sales{" "}
                      <span className="text-[#64748B]">in one place.</span>
                    </h3>
                    <p className="mt-5 text-base leading-relaxed text-[#64748B] sm:text-lg">
                      Review orders, listed products, and sales views in your brand workspace—without jumping across
                      scattered tools.
                    </p>
                    <ul className="mt-8 space-y-4">
                      {[
                        { line: "Track orders for your brand", Icon: Truck, color: "#001E55" },
                        { line: "Review products listed on your store", Icon: Shirt, color: "#EE8802" },
                        { line: "Open support when you need help", Icon: MessageSquare, color: "#001E55" },
                      ].map(({ line, Icon, color }) => (
                        <li key={line} className="flex items-center gap-3.5 text-[0.95rem] font-medium text-[#001E55]">
                          <span
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
                            style={{ background: `${color}1a`, color }}
                          >
                            <Icon className="h-4 w-4" strokeWidth={2} />
                          </span>
                          {line}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="overflow-hidden rounded-[1.5rem] shadow-[0_24px_60px_rgba(0,30,85,0.12)]">
                    <img
                      src="/landing/brand-dashboard.png"
                      alt="Dukify orders and sales dashboard"
                      width={1917}
                      height={938}
                      loading="lazy"
                      decoding="async"
                      className="h-auto w-full"
                    />
                  </div>
                </div>
              </Reveal>
          </div>
        </section>

        {/* What you get — phone-style feature cards + warm yellow accents */}
        <section id="results" className="scroll-mt-20 py-16 sm:py-24" style={{ background: C.bg }}>
          <div className="lp-shell">
            <Reveal>
              <div className="mb-12 max-w-2xl">
                <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-bold tracking-[-0.035em] text-[#001E55]">
                  Everything to run your clothing brand
                </h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-[#64748B] sm:text-lg">
                  Catalogue, storefront, orders, workspace, and team access—each piece named clearly below.
                </p>
              </div>
            </Reveal>

            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
              {results.map((item, i) => {
                const Icon = item.Icon;
                const featured = Boolean(item.featured);
                return (
                  <Reveal key={item.stat} delay={i * 50}>
                    <div
                      className={`group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border transition duration-300 hover:-translate-y-1 ${
                        featured
                          ? "border-transparent shadow-[0_18px_40px_rgba(0, 30, 85, 0.16)]"
                          : "border-[#E2E8F0] bg-[#FFFFFF] shadow-[0_10px_28px_rgba(0,30,85,0.05)] hover:border-[#EEF3FA]/70 hover:shadow-[0_16px_36px_rgba(238,136,2,0.16)]"
                      }`}
                      style={
                        featured
                          ? { background: "#FFF4E5" }
                          : undefined
                      }
                    >
                      {/* Phone notch bar — soft device cue */}
                      <div className="flex items-center justify-center pt-3">
                        <span
                          className="h-1 w-10 rounded-full"
                          style={{ background: featured ? "rgba(0,30,85,0.2)" : "#EEF3FA" }}
                        />
                      </div>

                      <div className="flex flex-1 flex-col px-5 pb-6 pt-4 sm:px-6 sm:pb-7 sm:pt-5">
                        <div className="flex items-start justify-between gap-3">
                          <span
                            className="grid h-12 w-12 place-items-center rounded-2xl text-[#001E55] transition duration-300 group-hover:scale-105"
                            style={{
                              background: featured ? "rgba(0,30,85,0.12)" : item.tone,
                            }}
                          >
                            <Icon className="h-5 w-5" strokeWidth={1.9} />
                          </span>
                          <span
                            className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]"
                            style={{
                              background: featured ? "rgba(0,30,85,0.1)" : "#FFF4E5",
                              color: featured ? "#001E55" : "#001E55",
                            }}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        </div>

                        <h3 className="mt-5 text-xl font-extrabold tracking-tight text-[#001E55] sm:text-[1.35rem]">
                          {item.stat}
                        </h3>
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-[#1F2937] sm:text-[0.95rem]">
                          {item.label}
                        </p>

                        <div
                          className="mt-6 h-1 w-12 rounded-full transition-all duration-300 group-hover:w-16"
                          style={{ background: featured ? "#001E55" : item.tone }}
                        />
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section id="how" className="scroll-mt-20 py-16 sm:py-24" style={{ background: C.bg }}>
          <div className="lp-shell">
            <Reveal>
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-bold tracking-[-0.035em] text-[#001E55]">
                  Steps to set up and sell
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-base text-[#64748B] sm:text-lg">
                  From catalogue to storefront to day-to-day brand work—without nested tool chaos.
                </p>
              </div>
            </Reveal>

            <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {howSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <Reveal key={step.title} delay={i * 60}>
                    <div>
                      <div className="flex items-center gap-3">
                        <span
                          className="grid h-11 w-11 place-items-center rounded-full"
                          style={{ background: `${step.color}22`, color: step.color }}
                        >
                          <Icon className="h-5 w-5" strokeWidth={1.75} />
                        </span>
                        <span className="text-xs font-bold tracking-[0.14em] text-[#64748B]">0{i + 1}</span>
                      </div>
                      <h3 className="mt-5 text-lg font-bold text-[#001E55]">{step.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{step.body}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>

          </div>
        </section>

        <section id="advantage" className="bg-[#001E55] py-16 text-white sm:py-20">
          <div className="lp-shell">
            <Reveal>
              <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-bold tracking-[-0.035em] text-white">
                    Your audience can become your next brand.
                  </h2>
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
                    Launch your own branded storefront and sell ready-to-launch products. Dukify helps manage the inventory and order operations behind your brand.
                  </p>
                </div>
                <Link
                  to="/support"
                  className="lp-btn-primary shrink-0 self-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white lg:self-auto"
                >
                  Book a demo <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>

            <div className="mt-10 overflow-hidden rounded-3xl border border-white/12 sm:mt-12">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    step: "Source",
                    icon: Shirt,
                    title: "Ready-to-sell product catalogue",
                    body: "Pick clothing from the catalogue and list it as your label. No factory setup to start.",
                  },
                  {
                    step: "Stock",
                    icon: Package,
                    title: "Inventory managed by Dukify",
                    body: "Stock sits with Dukify. You stay on the brand, not the warehouse.",
                  },
                  {
                    step: "Store",
                    icon: Store,
                    title: "Your brand, your storefront",
                    body: "A store under your name, ready to share with the audience you already have.",
                  },
                  {
                    step: "Ship",
                    icon: Truck,
                    title: "Orders packed and delivered",
                    body: "When an order comes in, Dukify packs it and sends it out.",
                  },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <article
                      key={item.step}
                      className={`flex h-full flex-col p-6 sm:p-7 ${
                        index > 0 ? "border-t border-white/12 lg:border-t-0" : ""
                      } ${index % 2 === 1 ? "sm:border-l sm:border-white/12" : ""} ${
                        index >= 2 ? "sm:border-t sm:border-white/12 lg:border-t-0" : ""
                      } ${index > 0 ? "lg:border-l lg:border-white/12" : ""}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-full bg-[#EE8802]/15 text-[#EE8802]">
                          <Icon className="h-5 w-5" strokeWidth={1.75} />
                        </span>
                        <span className="text-xs font-bold tracking-[0.16em] text-[#EE8802] uppercase">
                          {item.step}
                        </span>
                      </div>
                      <h3 className="mt-5 text-lg font-bold text-white">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/70">{item.body}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-20 py-16 sm:py-24" style={{ background: C.bg }}>
          <div className="lp-shell">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
              <Reveal>
                <h2 className="max-w-lg text-[clamp(2.25rem,4.6vw,3.75rem)] font-bold leading-[1.08] tracking-[-0.04em] text-[#001E55]">
                  No upfront cost, only success based fees
                </h2>
              </Reveal>

              <Reveal delay={60}>
                <div>
                  <p className="text-center text-[clamp(1.75rem,3vw,2.5rem)] font-bold tracking-[-0.03em] text-[#001E55]">
                    Pricing
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
                    {[
                      { value: "₹0", label: "Subscription Fee", featured: true },
                      { value: "₹0", label: "Website Setup & Maintenance Cost" },
                      { value: "0%", label: "Commission on Marketing Budget" },
                      { value: "3%", label: "+ GST, on Delivered Orders" },
                    ].map((item) => (
                      <article
                        key={item.label}
                        className={`flex h-full min-h-[9.5rem] flex-col justify-between rounded-2xl p-5 sm:min-h-[11.5rem] sm:p-6 ${
                          item.featured
                            ? "bg-[#001E55] text-white"
                            : "border border-[#E2E8F0] bg-white text-[#001E55]"
                        }`}
                      >
                        <p className={`text-[clamp(2.25rem,4vw,3.25rem)] font-bold leading-none tracking-[-0.04em] ${item.featured ? "text-white" : "text-[#001E55]"}`}>
                          {item.value}
                        </p>
                        <p className={`mt-6 max-w-[12rem] text-sm leading-snug sm:text-[0.95rem] ${item.featured ? "text-white/80" : "text-[#64748B]"}`}>
                          {item.label}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-20 py-16 sm:py-24" style={{ background: C.bg }}>
          <Reveal>
            <div className="lp-shell max-w-[820px]">
              <div className="text-center">
                <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-bold tracking-[-0.035em] text-[#001E55]">
                  Frequently asked questions
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-base text-[#64748B] sm:text-lg">
                  Clear answers on what Dukify is, who it is for, and how you get started.
                </p>
              </div>
              <div className="mt-12 divide-y divide-[#E2E8F0] border-y border-[#E2E8F0]">
                {faqs.map((item, index) => {
                  const open = openFaq === index;
                  return (
                    <div key={item.q}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-4 py-5 text-left sm:py-6"
                        onClick={() => setOpenFaq(open ? -1 : index)}
                      >
                        <span className="text-base font-bold text-[#001E55] sm:text-lg">{item.q}</span>
                        <ChevronDown
                          className={`h-5 w-5 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                          style={{ color: open ? C.accent : muted }}
                        />
                      </button>
                      <div
                        className="grid transition-[grid-template-rows] duration-300 ease-out"
                        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
                      >
                        <div className="overflow-hidden">
                          <p className="pb-5 text-sm leading-relaxed text-[#64748B] sm:pb-6 sm:text-base">{item.a}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </section>

        <section id="start" className="pb-20 sm:pb-28" style={{ background: C.bg }}>
          <Reveal>
            <div className="lp-shell text-center">
              <h2 className="text-[clamp(2rem,4vw,3.25rem)] font-bold tracking-[-0.035em] text-[#001E55]">
                Ready when you are
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-[#64748B] sm:text-lg">
                Start a clothing brand with Dukify products—then continue in your brand workspace.
              </p>
              <Link to="/login" className="lp-btn-primary mt-9">
                Start for free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      {/* Sticky CTA — single persistent action */}
      <div className={`pointer-events-none fixed inset-x-0 bottom-4 z-40 justify-center px-4 sm:bottom-6 ${pastHero ? "flex" : "hidden"}`}>
        <div className="pointer-events-auto flex w-full max-w-xl items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF]/95 px-3 py-2.5 shadow-[0_20px_60px_rgba(0,30,85,0.12)] backdrop-blur-md sm:gap-4 sm:px-4 sm:py-3">
          <img src="/logo/logo-dukify.png" alt="" className="hidden h-10 w-10 shrink-0 object-contain sm:block" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#001E55]">Book a demo</p>
            <p className="truncate text-[11px] text-[#64748B]">We’ll call and walk you through Dukify</p>
          </div>
          <Link
            to="/support"
            className="inline-flex shrink-0 items-center justify-center rounded-full px-4 py-2.5 text-sm font-bold text-[#001E55] transition hover:brightness-110 sm:px-5"
            style={{ background: C.accent }}
          >
            Book a demo
          </Link>
        </div>
      </div>

      <footer className="overflow-x-hidden bg-[#001E55] pb-28 text-white">
        <div className="flex flex-col gap-10 px-6 pt-10 sm:px-10 sm:pt-12 lg:flex-row lg:items-start lg:justify-between lg:px-14">
          <div className="flex flex-wrap gap-3">
            <Link
              to="/support"
              className="inline-flex items-center gap-2 rounded-full border border-white/80 px-5 py-2.5 text-[11px] font-semibold tracking-[0.14em] uppercase transition hover:bg-white hover:text-[#001E55]"
            >
              Book a call
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
            </Link>
            <a
              href="mailto:ops@dukify.example"
              className="inline-flex items-center rounded-full border border-white/80 px-5 py-2.5 text-[11px] font-semibold tracking-[0.14em] uppercase transition hover:bg-white hover:text-[#001E55]"
            >
              Drop us an email
            </a>
          </div>
          <nav className="flex flex-col items-start gap-2 text-sm font-medium lg:items-end">
            <a href="#platform" className="transition hover:text-[#EE8802]">Platform</a>
            <a href="#pricing" className="transition hover:text-[#EE8802]">Pricing</a>
            <a href="#faq" className="transition hover:text-[#EE8802]">FAQ</a>
            <Link to="/support" className="transition hover:text-[#EE8802]">Support</Link>
            <Link to="/login" className="transition hover:text-[#EE8802]">Log in</Link>
          </nav>
        </div>

        <p
          aria-label="Dukify"
          className="mt-8 px-2 text-center font-black uppercase leading-[0.78] tracking-[-0.07em] text-white select-none sm:mt-12"
          style={{ fontSize: "clamp(4.6rem, 21.5vw, 22rem)" }}
        >
          Dukify
        </p>

        <div className="flex flex-col gap-2 px-6 py-5 text-[11px] text-white/65 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-14">
          <p>© {new Date().getFullYear()} Dukify</p>
          <p>Clothing brands for creators</p>
        </div>
      </footer>

    </div>
  );
}
