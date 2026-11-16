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
  Store,
  Truck,
  Users,
  Wallet,
} from "lucide-react";

/**
 * Landing-only colors
 * 1. Background  2. Text (white)  3. Card  4. Accent (CTA + highlight cards)
 */
const C = {
  bg: "#F3F0EA", // Paper — page background only
  text: "#161815", // Ink — readable on Paper
  card: "#FBFAF7", // White cards on Paper
  accent: "#69ce11",
};

const muted = "#6E685F";
const border = "#DDD6CB";
const soft = "#E6E0D6";

const featureTabs = [
  {
    id: "catalogue",
    label: "Clothing catalogue",
    sub: "Ready-to-sell styles",
    icon: Shirt,
    color: "#69ce11",
    tip: "Choose clothing from our catalogue and list it under your brand—no manufacturing setup required to start.",
    points: [
      { line: "Select styles from a ready clothing catalogue", Icon: Shirt, color: "#69ce11" },
      { line: "List picks under your own brand name", Icon: Store, color: "#0ea5e9" },
      { line: "Start without factory or inventory setup", Icon: Package, color: "#1F5C40" },
    ],
  },
  {
    id: "store",
    label: "Brand storefront",
    sub: "Your brand store",
    icon: Store,
    color: "#60a5fa",
    tip: "Set up a branded storefront and present your clothing line under your own label.",
    points: [
      { line: "Publish a store that looks like your brand", Icon: Store, color: "#60a5fa" },
      { line: "Show selected clothing under your label", Icon: Shirt, color: "#69ce11" },
      { line: "Share one clean link with your audience", Icon: Megaphone, color: "#f472b6" },
    ],
  },
  {
    id: "orders",
    label: "Order workspace",
    sub: "Orders you can track",
    icon: Truck,
    color: "#f59e0b",
    tip: "See your brand’s orders in one place. Central ops handle packing and shipping on the platform side.",
    points: [
      { line: "Track every brand order in one workspace", Icon: Truck, color: "#f59e0b" },
      { line: "Stay clear as new sales come in", Icon: Bell, color: "#E0AC00" },
      { line: "Fulfilment support handled on the platform side", Icon: Package, color: "#1F5C40" },
    ],
  },
  {
    id: "promote",
    label: "Share with audience",
    sub: "Your community",
    icon: Megaphone,
    color: "#f472b6",
    tip: "Share your store link with Instagram followers and customers who already know you.",
    points: [
      { line: "Send your store link to Instagram followers", Icon: Megaphone, color: "#f472b6" },
      { line: "Reach people who already trust your brand", Icon: Users, color: "#60a5fa" },
      { line: "Keep the relationship with your audience", Icon: Store, color: "#0ea5e9" },
    ],
  },
  {
    id: "earn",
    label: "Sales & settlements",
    sub: "Brand earnings view",
    icon: Wallet,
    color: "#2dd4bf",
    tip: "Review brand sales and settlement information in your brand workspace.",
    points: [
      { line: "Review sales for your brand in one place", Icon: Wallet, color: "#2dd4bf" },
      { line: "Check settlement views as money moves", Icon: LayoutDashboard, color: "#1F5C40" },
      { line: "Stay clear without jumping across tools", Icon: Bell, color: "#E0AC00" },
    ],
  },
  {
    id: "support",
    label: "Brand support",
    sub: "Help desk access",
    icon: MessageSquare,
    color: "#a78bfa",
    tip: "Use support tools in your workspace when you need help with brand setup or day-to-day questions.",
    points: [
      { line: "Open support from your brand workspace", Icon: MessageSquare, color: "#a78bfa" },
      { line: "Get help on setup and day-to-day questions", Icon: Users, color: "#60a5fa" },
      { line: "Keep brand ops moving without guesswork", Icon: LayoutDashboard, color: "#1F5C40" },
    ],
  },
];

const howSteps = [
  {
    title: "Phase 1 · Choose products",
    body: "Browse the clothing catalogue and select styles for your brand. No manufacturing setup required to start.",
    icon: Package,
    color: "#fb923c",
  },
  {
    title: "Phase 2 · Set up store",
    body: "Open your brand workspace, shape the storefront, and list selected clothing under your label.",
    icon: Store,
    color: "#60a5fa",
  },
  {
    title: "Phase 3 · Share & sell",
    body: "Send your store link to Instagram followers and customers. You keep the relationship with your audience.",
    icon: Megaphone,
    color: "#f472b6",
  },
  {
    title: "Phase 4 · Run day to day",
    body: "Track orders and sales views in your workspace while platform ops support fulfilment on their side.",
    icon: Wallet,
    color: "#69ce11",
  },
];

const results = [
  {
    stat: "Products",
    label: "Clothing catalogue you can sell under your brand",
    Icon: Shirt,
    tone: "#F5D76E",
  },
  {
    stat: "Storefront",
    label: "A brand store to present your clothing line",
    Icon: Store,
    tone: "#F0C94A",
  },
  {
    stat: "Orders",
    label: "Brand order view with central fulfilment support",
    Icon: Truck,
    tone: "#E8B84A",
  },
  {
    stat: "Workspace",
    label: "Dashboard for products, store, and sales views",
    Icon: LayoutDashboard,
    tone: "#F5D76E",
  },
  {
    stat: "Team access",
    label: "Separate logins for brand owner, admin, and staff",
    Icon: Users,
    tone: "#F0C94A",
  },
  {
    stat: "Next step",
    label: "Open your brand workspace when you’re ready",
    Icon: LogIn,
    tone: "#69ce11",
    featured: true,
  },
];

const faqs = [
  {
    q: "What is Pahachan?",
    a: "Pahachan helps Instagram creators and aspiring brand owners sell clothing under their own brand. We provide clothing products and a brand workspace with storefront, orders, and related tools—so you do not have to source or manufacture everything yourself to start.",
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
    a: "Use Log in to open the existing Pahachan sign-in page. After you sign in, you go to your brand or platform dashboard based on your account.",
  },
  {
    q: "Do you publish pricing on this site?",
    a: "Not yet. Pricing and fee details are shared during onboarding with your account. This page does not list subscription or commission numbers.",
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

/** Foreign fashion storefronts — rotating demo screenshots (different brand types) */
const storeDemos = [
  {
    name: "Everlane",
    url: "everlane.com",
    href: "https://www.everlane.com/",
    img: "/landing/store-demo-1.png",
  },
  {
    name: "Reformation",
    url: "thereformation.com",
    href: "https://www.reformation.com/",
    img: "/landing/store-demo-2.png",
  },
  {
    name: "Allbirds",
    url: "allbirds.com",
    href: "https://www.allbirds.com/",
    img: "/landing/store-demo-3.png",
  },
];

function Reveal({ children, className = "", delay = 0 }) {
  return (
    <div className={`lp-reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function LandingPage() {
  const [tab, setTab] = useState(featureTabs[0].id);
  const [openFaq, setOpenFaq] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [heroLine, setHeroLine] = useState(0);
  const [heroAnim, setHeroAnim] = useState(true);
  const [storeDemo, setStoreDemo] = useState(0);
  const [heroVid, setHeroVid] = useState(0);
  const heroVideoRef = useRef(null);
  const active = featureTabs.find((t) => t.id === tab) || featureTabs[0];
  const rotating = heroRotatingLines[heroLine];
  const liveStore = storeDemos[storeDemo];

  useEffect(() => {
    const el = heroVideoRef.current;
    if (!el) return;
    const applySpeed = () => {
      el.playbackRate = 1.85; // faster so playlist cycles sooner
    };
    applySpeed();
    el.addEventListener("loadedmetadata", applySpeed);
    el.load();
    const play = el.play();
    if (play?.catch) play.catch(() => {});
    return () => el.removeEventListener("loadedmetadata", applySpeed);
  }, [heroVid]);

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

    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setHeroAnim(false);
      window.setTimeout(() => {
        setHeroLine((i) => (i + 1) % heroRotatingLines.length);
        setHeroAnim(true);
      }, 280);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setStoreDemo((i) => (i + 1) % storeDemos.length);
    }, 4200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const nodes = document.querySelectorAll(".lp-reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
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
          color: #161815;
          font-weight: 700;
          font-size: 0.9375rem;
          padding: 0.85rem 1.4rem;
          transition: transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease;
        }
        .lp-btn-primary:hover {
          transform: translateY(-2px);
          filter: brightness(1.06);
          box-shadow: 0 12px 28px rgba(105, 206, 17, 0.28);
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
        .lp-btn-ghost:hover { gap: 0.55rem; color: var(--lp-accent); opacity: 1; }
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
          border-color: rgba(105, 206, 17, 0.45);
        }
        .lp-card-accent {
          background: var(--lp-accent) !important;
          color: var(--lp-text);
          border-color: transparent !important;
        }
        .lp-card-accent p { color: rgba(255, 255, 255, 0.85) !important; }
        .lp-card-accent .lp-card-title { color: var(--lp-text) !important; }
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
          color: #161815;
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
          background: radial-gradient(ellipse 70% 45% at 50% -5%, rgba(105, 206, 17, 0.12), transparent 60%);
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
          min-height: 1.15em;
          overflow: hidden;
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
          background: scrolled ? "rgba(243,240,234,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(10px)" : "none",
          borderBottom: scrolled ? "1px solid #DDD6CB" : "1px solid transparent",
        }}
      >
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center gap-6 px-6 sm:px-10 md:px-14 lg:h-[4.25rem] lg:px-16 xl:px-20">
          {/* Left: logo + nav links (Shopify layout) */}
          <div className="flex min-w-0 flex-1 items-center gap-6 lg:gap-8">
            <a
              href="#top"
              className={`flex shrink-0 items-center gap-2.5 text-[1.45rem] font-bold tracking-tight sm:text-[1.55rem] ${scrolled ? "text-[#161815]" : "text-white"}`}
            >
              <span
                className="grid h-8 w-8 place-items-center rounded-md text-sm font-extrabold text-[#161815]"
                style={{ background: C.accent }}
              >
                P
              </span>
              pahachan
            </a>

            <nav
              className={`hidden items-center rounded-full p-1 text-[0.9rem] font-medium md:flex lg:text-[0.95rem] ${
                scrolled
                  ? "border border-[#DDD6CB] bg-[#E6E0D6]/70 text-[#161815]/75"
                  : "border border-white/10 bg-white/[0.04] text-white/75"
              }`}
            >
              <a href="#platform" className={`rounded-full px-4 py-1.5 transition ${scrolled ? "hover:bg-[#E6E0D6]" : "hover:bg-white/10 hover:text-white"}`}>
                Platform
              </a>
              <a href="#how" className={`rounded-full px-4 py-1.5 transition ${scrolled ? "hover:bg-[#E6E0D6]" : "hover:bg-white/10 hover:text-white"}`}>
                How it works
              </a>
              <a href="#results" className={`rounded-full px-4 py-1.5 transition ${scrolled ? "hover:bg-[#E6E0D6]" : "hover:bg-white/10 hover:text-white"}`}>
                What you get
              </a>
              <a href="#faq" className={`rounded-full px-4 py-1.5 transition ${scrolled ? "hover:bg-[#E6E0D6]" : "hover:bg-white/10 hover:text-white"}`}>
                FAQ
              </a>
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-4 sm:gap-5">
            <Link
              to="/login"
              className={`hidden text-[1rem] font-medium sm:inline transition-opacity hover:opacity-70 lg:text-[1.05rem] ${scrolled ? "text-[#161815]" : "text-white"}`}
            >
              Log in
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-[0.95rem] font-bold text-[#161815] transition hover:brightness-110 sm:px-6"
              style={{ background: C.accent }}
            >
              Open workspace
            </Link>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="relative isolate min-h-[100svh] overflow-hidden">
          {/* Layer 1 — 3 ecommerce videos in sequence, then loop */}
          <video
            ref={heroVideoRef}
            key={heroVideos[heroVid]}
            className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
            autoPlay
            muted
            playsInline
            poster="/landing/lp-3d-tee.jpg"
            onEnded={() => setHeroVid((i) => (i + 1) % heroVideos.length)}
          >
            <source src={heroVideos[heroVid]} type="video/mp4" />
          </video>

          {/* Layer 2 — dark overlay so text stays readable */}
          <div
            className="absolute inset-0 z-[1]"
            style={{
              background:
                "linear-gradient(180deg, rgba(9,9,11,0.55) 0%, rgba(9,9,11,0.72) 45%, rgba(9,9,11,0.85) 100%)",
            }}
          />

          {/* Layer 3 — centered SaaS-style hero type (reference format) */}
          <div className="lp-shell relative z-[2] flex min-h-[100svh] items-center justify-center py-28 text-center sm:py-32">
            <div className="mx-auto flex w-full max-w-4xl flex-col items-center">
              <h1 className="font-bold leading-[1.05] tracking-[-0.04em] text-white">
                <span className="block text-[clamp(3rem,8.5vw,6.25rem)]">Start your clothing</span>
                <span className="lp-hero-rotate mt-1 text-[clamp(2.35rem,6.5vw,4.75rem)]">
                  <span className={`lp-hero-rotate-inner ${heroAnim ? "is-in" : "is-out"}`}>
                    {rotating.before}{" "}
                    <span style={{ color: C.accent }}>{rotating.accent}</span>
                  </span>
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-[clamp(1rem,2vw,1.2rem)] font-medium leading-relaxed text-white/75">
                Your workspace to pick clothing, launch a branded store, and sell to the audience you already have.
              </p>

              <div className="mt-16 flex flex-wrap items-center justify-center gap-3 sm:mt-20 sm:gap-4">
                <Link
                  to="/login"
                  className="inline-flex h-12 items-center justify-center rounded-full px-8 text-[0.95rem] font-bold leading-none tracking-tight text-[#161815] transition hover:brightness-110"
                  style={{ background: C.accent }}
                >
                  Open workspace
                </Link>
                <a
                  href="#platform"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 text-[0.95rem] font-semibold leading-none tracking-tight text-white transition hover:border-white/40 hover:bg-white/10"
                >
                  See the platform
                  <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2.25} />
                </a>
              </div>
            </div>
          </div>

        </section>

        <section className="relative py-12 sm:py-16" style={{ background: C.bg }}>
          <div className="mb-8 flex flex-col items-center gap-2 px-4 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6E685F]">
              Built for
            </p>
            <h2 className="max-w-xl text-[clamp(1.5rem,3vw,2.1rem)] font-bold tracking-[-0.03em] text-[#161815]">
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
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6E685F]">
                    Why Pahachan
                  </p>
                  <h2 className="mt-3 text-[clamp(2.1rem,4.5vw,3.5rem)] font-bold leading-[1.12] tracking-[-0.035em] text-[#161815]">
                    Empowering creators to launch, sell and{" "}
                    <em className="not-italic font-bold" style={{ color: C.accent }}>
                      grow
                    </em>
                  </h2>
                  <p className="mt-5 text-base leading-relaxed text-[#6E685F] sm:text-lg">
                    Pick clothing from our catalogue, open a branded storefront, and run day-to-day brand work from one
                    workspace—built for Instagram creators and aspiring labels.
                  </p>
                  <a href="#platform" className="lp-btn-outline mt-8">
                    See the platform <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                </div>

                <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
                  {/* Wishlink-style: lifestyle creator image, no heavy border */}
                  <div className="relative overflow-hidden rounded-[1.75rem] bg-[#E6E0D6]">
                    <img
                      src="/landing/lp-creator.jpg"
                      alt="Creator shopping for a clothing brand"
                      className="aspect-[4/5] w-full object-cover object-[center_20%]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#161815]/25 via-transparent to-transparent" />
                  </div>

                  {/* Floating chips — simple, soft shadow, no thick borders */}
                  <div className="absolute left-3 top-6 z-10 flex max-w-[12.5rem] items-center gap-2 rounded-2xl bg-[#FBFAF7] p-2 shadow-[0_12px_32px_rgba(22,24,21,0.16)] sm:left-4 sm:top-8 sm:max-w-[13.5rem] sm:p-2.5">
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[#161815]"
                      style={{ background: C.accent }}
                    >
                      <Shirt className="h-4 w-4" strokeWidth={2.25} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold leading-tight text-[#161815]">Style listed</p>
                      <p className="mt-0.5 text-[10px] leading-tight text-[#6E685F]">From your catalogue</p>
                    </div>
                  </div>

                  <div className="absolute right-3 top-[38%] z-10 flex max-w-[13rem] items-center gap-2 rounded-2xl bg-[#FBFAF7] p-2 shadow-[0_12px_32px_rgba(22,24,21,0.16)] sm:right-0 sm:max-w-[14rem] sm:p-2.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#161815] text-[#FBFAF7]">
                      <Store className="h-4 w-4" strokeWidth={2.25} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold leading-tight text-[#161815]">Store live</p>
                      <p className="mt-0.5 text-[10px] leading-tight text-[#6E685F]">Under your brand name</p>
                    </div>
                  </div>

                  <div className="absolute bottom-5 left-3 z-10 flex items-center gap-2 rounded-full bg-[#FBFAF7] py-1.5 pl-1.5 pr-3 shadow-[0_12px_32px_rgba(22,24,21,0.14)] sm:bottom-6 sm:left-4">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-[#0ea5e9]/15 text-[#0ea5e9]">
                      <Truck className="h-3.5 w-3.5" strokeWidth={2.25} />
                    </span>
                    <p className="text-[11px] font-semibold text-[#161815]">
                      New order <span className="font-medium text-[#6E685F]">in workspace</span>
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Free brand website — section heading + 80% site / 20% side copy */}
        <section id="website" className="py-16 sm:py-24" style={{ background: C.bg }}>
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="mx-auto max-w-3xl text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6E685F]">
                  Free brand website
                </p>
                <h2 className="mt-3 text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.12] tracking-[-0.035em] text-[#161815]">
                  Your clothing storefront, included free
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#6E685F] sm:text-lg">
                  Example clothing storefronts below — the kind of live brand site you get with Pahachan, under your
                  own name.
                </p>
              </div>
            </Reveal>

            <Reveal delay={40}>
              <div className="mt-10 grid items-stretch gap-4 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.28fr)] lg:gap-5 xl:gap-6">
                {/* ~80% — storefront examples showcase */}
                <div className="flex min-h-[320px] flex-col overflow-hidden rounded-[1.25rem] bg-[#1a1814] shadow-[0_28px_70px_rgba(22,24,21,0.16)] sm:min-h-[420px] sm:rounded-[1.4rem] lg:min-h-[560px]">
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
                      <span className="lp-store-live h-1.5 w-1.5 shrink-0 rounded-full bg-[#69ce11]" />
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
                            background: i === storeDemo ? "#F5D76E" : "rgba(255,255,255,0.35)",
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="relative min-h-0 flex-1 overflow-hidden bg-[#111]">
                    {storeDemos.map((demo, i) => (
                      <img
                        key={demo.url}
                        src={demo.img}
                        alt={`${demo.name} storefront example`}
                        className={`lp-store-shot absolute inset-0 h-full w-full object-cover object-top ${
                          i === storeDemo ? "is-active" : "is-idle"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Side copy — one clear text card, no code blocks */}
                <div className="flex h-full flex-col justify-center rounded-[1.25rem] border border-[#E8DFD0] bg-[#FBFAF7] px-5 py-6 sm:px-6 sm:py-8 lg:px-7 lg:py-10">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6E685F]">
                    What you get
                  </p>
                  <h3 className="mt-3 text-[1.45rem] font-extrabold leading-tight tracking-tight text-[#161815] sm:text-[1.65rem]">
                    Your clothing website is completely free
                  </h3>
                  <p className="mt-4 text-[0.95rem] leading-relaxed text-[#6E685F] sm:text-base">
                    Pahachan provides a full brand website at zero cost. There is no setup fee and no monthly charge
                    for the site — you get a live clothing store under your own brand name.
                  </p>
                  <p className="mt-4 text-[0.95rem] leading-relaxed text-[#6E685F] sm:text-base">
                    Share one link with your Instagram audience. They shop your collection while you stay focused on
                    your brand.
                  </p>
                  <p className="mt-5 text-sm font-semibold leading-relaxed text-[#161815]">
                    Free website. Your brand. Ready to share.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="platform" className="py-20 sm:py-28" style={{ background: C.bg }}>
          <div className="lp-shell">
            <Reveal>
              <div className="mx-auto max-w-3xl text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6E685F]">
                  Our offerings
                </p>
                <h2 className="mt-3 text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.12] tracking-[-0.035em] text-[#161815]">
                  What you get to run your brand
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#6E685F] sm:text-lg">
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
                        color: on ? "#161815" : muted,
                      }}
                    >
                      <Icon className="h-4 w-4" style={{ color: on ? "#161815" : item.color }} />
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
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6E685F]">
                    {active.label}
                  </p>
                  <h3 className="mt-4 text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.1] tracking-[-0.035em] text-[#161815]">
                    {active.sub}
                  </h3>
                  <p className="mt-5 text-base leading-relaxed text-[#6E685F] sm:text-lg">
                    {active.tip}
                  </p>
                  <ul className="mt-8 space-y-4">
                    {active.points.map(({ line, Icon, color }) => (
                      <li key={line} className="flex items-center gap-3.5 text-[0.95rem] font-medium text-[#161815]">
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
                    alt="Pahachan brand workspace dashboard"
                    className="h-auto w-full object-cover object-top"
                    style={{ maxHeight: 440 }}
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
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6E685F]">
                    How your brand runs
                  </p>
                  <h2 className="mt-3 text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.12] tracking-[-0.035em] text-[#161815]">
                    From products to selling, clearly laid out
                  </h2>
                  <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#6E685F] sm:text-lg">
                    Three clear steps: pick clothing, share with your audience, and stay on top of orders in one place.
                  </p>
                </div>
              </Reveal>

              {/* Band 1 — copy + images only */}
              <Reveal>
                <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                  <div className="max-w-lg">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6E685F]">
                      01 · Catalogue & storefront
                    </p>
                    <h3 className="mt-4 text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.1] tracking-[-0.035em] text-[#161815]">
                      Start with products.{" "}
                      <span className="text-[#6E685F]">Build your label.</span>
                    </h3>
                    <p className="mt-5 text-base leading-relaxed text-[#6E685F] sm:text-lg">
                      Launch a clothing brand with catalogue styles we provide—then run storefront and workspace
                      without building a factory first.
                    </p>
                    <ul className="mt-8 space-y-4">
                      {[
                        { line: "Select clothing from our product catalogue", Icon: Shirt, color: "#69ce11" },
                        { line: "Build and publish your brand storefront", Icon: Store, color: "#0ea5e9" },
                        { line: "Manage brand activity from one workspace", Icon: LayoutDashboard, color: "#1F5C40" },
                      ].map(({ line, Icon, color }) => (
                        <li key={line} className="flex items-center gap-3.5 text-[0.95rem] font-medium text-[#161815]">
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
                          src="/landing/lp-d2c-rack.jpg"
                          alt="Clothing rack ready for a brand line"
                          className="h-full min-h-[280px] w-full object-cover sm:min-h-[420px]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#161815]/50 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5">
                          <p className="text-sm font-semibold text-white">Catalogue styles</p>
                          <p className="mt-0.5 text-xs text-white/70">Pick looks for your brand store</p>
                        </div>
                      </div>

                      <div className="relative col-span-6 overflow-hidden rounded-[1.25rem] sm:col-span-5">
                        <img
                          src="/landing/lp-d2c-flatlay.jpg"
                          alt="Apparel flat lay for brand merchandising"
                          className="aspect-[4/3] h-full w-full object-cover sm:aspect-auto sm:min-h-[200px]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#161815]/45 to-transparent" />
                        <p className="absolute bottom-3 left-3 text-xs font-semibold text-white">Ready to list</p>
                      </div>

                      <div className="relative col-span-6 overflow-hidden rounded-[1.25rem] sm:col-span-5">
                        <img
                          src="/landing/lp-d2c-store.jpg"
                          alt="Retail clothing display"
                          className="aspect-[4/3] h-full w-full object-cover sm:aspect-auto sm:min-h-[200px]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#161815]/45 to-transparent" />
                        <p className="absolute bottom-3 left-3 text-xs font-semibold text-white">Brand storefront</p>
                      </div>
                    </div>

                    <div className="absolute -left-2 top-6 z-10 hidden items-center gap-2 rounded-2xl bg-[#FBFAF7] p-2.5 shadow-[0_14px_36px_rgba(22,24,21,0.14)] sm:flex">
                      <span
                        className="grid h-8 w-8 place-items-center rounded-xl text-[#161815]"
                        style={{ background: C.accent }}
                      >
                        <Shirt className="h-3.5 w-3.5" strokeWidth={2.25} />
                      </span>
                      <div>
                        <p className="text-[11px] font-bold text-[#161815]">Style selected</p>
                        <p className="text-[10px] text-[#6E685F]">Under your label</p>
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
                        color: "#f472b6",
                      },
                      {
                        row: "Send people to your brand store",
                        hint: "Present selected clothing under your own label",
                        Icon: Store,
                        color: "#0ea5e9",
                      },
                      {
                        row: "Follow new orders in your workspace",
                        hint: "Stay on top of brand activity as sales come in",
                        Icon: Bell,
                        color: "#E0AC00",
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
                            <span className="text-[11px] font-bold text-[#6E685F]/70">0{i + 1}</span>
                            <p className="text-sm font-semibold text-[#161815] sm:text-[0.95rem]">{row}</p>
                          </div>
                          <p className="mt-1 text-sm leading-relaxed text-[#6E685F]">{hint}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="order-1 max-w-lg lg:order-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6E685F]">
                      02 · Share & sell
                    </p>
                    <h3 className="mt-4 text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.1] tracking-[-0.035em] text-[#161815]">
                      You bring the brand.{" "}
                      <span className="text-[#6E685F]">We bring the products.</span>
                    </h3>
                    <p className="mt-5 text-base leading-relaxed text-[#6E685F] sm:text-lg">
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
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6E685F]">
                      03 · Orders & sales
                    </p>
                    <h3 className="mt-4 text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.1] tracking-[-0.035em] text-[#161815]">
                      Orders and brand sales{" "}
                      <span className="text-[#6E685F]">in one place.</span>
                    </h3>
                    <p className="mt-5 text-base leading-relaxed text-[#6E685F] sm:text-lg">
                      Review orders, listed products, and sales views in your brand workspace—without jumping across
                      scattered tools.
                    </p>
                    <ul className="mt-8 space-y-4">
                      {[
                        { line: "Track orders for your brand", Icon: Truck, color: "#f59e0b" },
                        { line: "Review products listed on your store", Icon: Shirt, color: "#69ce11" },
                        { line: "Open support when you need help", Icon: MessageSquare, color: "#a78bfa" },
                      ].map(({ line, Icon, color }) => (
                        <li key={line} className="flex items-center gap-3.5 text-[0.95rem] font-medium text-[#161815]">
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

                  <div className="overflow-hidden rounded-[1.5rem] shadow-[0_24px_60px_rgba(22,24,21,0.12)]">
                    <img
                      src="/landing/brand-dashboard.png"
                      alt="Brand workspace dashboard"
                      className="h-auto w-full object-cover object-top"
                      style={{ maxHeight: 400 }}
                    />
                  </div>
                </div>
              </Reveal>
          </div>
        </section>

        {/* What you get — phone-style feature cards + warm yellow accents */}
        <section id="results" className="py-16 sm:py-24" style={{ background: C.bg }}>
          <div className="lp-shell">
            <Reveal>
              <div className="mb-12 max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6E685F]">
                  What you get
                </p>
                <h2 className="mt-3 text-[clamp(2rem,4vw,3.25rem)] font-bold tracking-[-0.035em] text-[#161815]">
                  Everything to run your clothing brand
                </h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-[#6E685F] sm:text-lg">
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
                          ? "border-transparent shadow-[0_18px_40px_rgba(105,206,17,0.22)]"
                          : "border-[#E8DFD0] bg-[#FBFAF7] shadow-[0_10px_28px_rgba(22,24,21,0.05)] hover:border-[#F0C94A]/70 hover:shadow-[0_16px_36px_rgba(240,201,74,0.18)]"
                      }`}
                      style={
                        featured
                          ? { background: "linear-gradient(160deg, #F7E7A1 0%, #F5D76E 45%, #E8C547 100%)" }
                          : undefined
                      }
                    >
                      {/* Phone notch bar — soft device cue */}
                      <div className="flex items-center justify-center pt-3">
                        <span
                          className="h-1 w-10 rounded-full"
                          style={{ background: featured ? "rgba(22,24,21,0.2)" : "#E6E0D6" }}
                        />
                      </div>

                      <div className="flex flex-1 flex-col px-5 pb-6 pt-4 sm:px-6 sm:pb-7 sm:pt-5">
                        <div className="flex items-start justify-between gap-3">
                          <span
                            className="grid h-12 w-12 place-items-center rounded-2xl text-[#161815] transition duration-300 group-hover:scale-105"
                            style={{
                              background: featured ? "rgba(22,24,21,0.12)" : item.tone,
                            }}
                          >
                            <Icon className="h-5 w-5" strokeWidth={1.9} />
                          </span>
                          <span
                            className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]"
                            style={{
                              background: featured ? "rgba(22,24,21,0.1)" : "#FFF8E1",
                              color: featured ? "#161815" : "#8A6A12",
                            }}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        </div>

                        <h3 className="mt-5 text-xl font-extrabold tracking-tight text-[#161815] sm:text-[1.35rem]">
                          {item.stat}
                        </h3>
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-[#5C564E] sm:text-[0.95rem]">
                          {item.label}
                        </p>

                        <div
                          className="mt-6 h-1 w-12 rounded-full transition-all duration-300 group-hover:w-16"
                          style={{ background: featured ? "#161815" : item.tone }}
                        />
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section id="how" className="py-16 sm:py-24" style={{ background: C.bg }}>
          <div className="lp-shell">
            <Reveal>
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6E685F]">
                  How it works
                </p>
                <h2 className="mt-3 text-[clamp(2rem,4vw,3.25rem)] font-bold tracking-[-0.035em] text-[#161815]">
                  Steps to set up and sell
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-base text-[#6E685F] sm:text-lg">
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
                        <span className="text-xs font-bold tracking-[0.14em] text-[#9A948A]">0{i + 1}</span>
                      </div>
                      <h3 className="mt-5 text-lg font-bold text-[#161815]">{step.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#6E685F]">{step.body}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>

          </div>
        </section>

        <section id="roles" className="py-16 sm:py-24" style={{ background: C.bg }}>
          <Reveal>
            <div className="lp-shell max-w-[900px] text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6E685F]">
                Team access
              </p>
              <h2 className="mt-3 text-[clamp(2rem,4vw,3.25rem)] font-bold tracking-[-0.035em] text-[#161815]">
                One brand. Individual logins.
              </h2>
              <p className="mt-4 text-base text-[#6E685F] sm:text-lg">
                Brand owners, admins, and staff each sign in with their own account. Access follows the role and
                permissions assigned to them.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-x-6 gap-y-3">
                {["Brand owner", "Brand admin", "Brand staff", "Platform team"].map((role) => (
                  <span key={role} className="text-sm font-semibold text-[#161815]">
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        <section id="faq" className="py-16 sm:py-24" style={{ background: C.bg }}>
          <Reveal>
            <div className="lp-shell max-w-[820px]">
              <div className="text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6E685F]">
                  FAQ
                </p>
                <h2 className="mt-3 text-[clamp(2rem,4vw,3.25rem)] font-bold tracking-[-0.035em] text-[#161815]">
                  Frequently asked questions
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-base text-[#6E685F] sm:text-lg">
                  Clear answers on what Pahachan is, who it is for, and how you get started.
                </p>
              </div>
              <div className="mt-12 divide-y divide-[#DDD6CB] border-y border-[#DDD6CB]">
                {faqs.map((item, index) => {
                  const open = openFaq === index;
                  return (
                    <div key={item.q}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-4 py-5 text-left sm:py-6"
                        onClick={() => setOpenFaq(open ? -1 : index)}
                      >
                        <span className="text-base font-bold text-[#161815] sm:text-lg">{item.q}</span>
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
                          <p className="pb-5 text-sm leading-relaxed text-[#6E685F] sm:pb-6 sm:text-base">{item.a}</p>
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
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6E685F]">
                Get started
              </p>
              <h2 className="mt-3 text-[clamp(2rem,4vw,3.25rem)] font-bold tracking-[-0.035em] text-[#161815]">
                Ready when you are
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-[#6E685F] sm:text-lg">
                Start a clothing brand with Pahachan products—then continue in your brand workspace.
              </p>
              <Link to="/login" className="lp-btn-primary mt-9">
                Open workspace <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      {/* Sticky CTA — single persistent action */}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 sm:bottom-6">
        <div className="pointer-events-auto flex w-full max-w-xl items-center gap-3 rounded-2xl border border-[#DDD6CB] bg-[#FBFAF7]/95 px-3 py-2.5 shadow-[0_20px_60px_rgba(22,24,21,0.12)] backdrop-blur-md sm:gap-4 sm:px-4 sm:py-3">
          <span
            className="hidden h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-extrabold text-[#161815] sm:grid"
            style={{ background: C.accent }}
          >
            P
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#161815]">Start your clothing brand</p>
            <p className="truncate text-[11px] text-[#6E685F]">Catalogue, store & orders in one place</p>
          </div>
          <Link
            to="/login"
            className="inline-flex shrink-0 items-center justify-center rounded-full px-4 py-2.5 text-sm font-bold text-[#161815] transition hover:brightness-110 sm:px-5"
            style={{ background: C.accent }}
          >
            Open workspace
          </Link>
        </div>
      </div>

      <footer className="pb-28" style={{ background: C.bg }}>
        <div className="lp-shell pt-16 sm:pt-20">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.6fr)] lg:gap-16 xl:gap-24">
            {/* Left — mark + newsletter (Funner layout) */}
            <div className="max-w-sm">
              <div className="flex flex-wrap items-center gap-1.5" aria-label="Pahachan">
                {[
                  { ch: "P", bg: "#60a5fa", ink: "#161815" },
                  { ch: "A", bg: "#fb923c", ink: "#161815" },
                  { ch: "H", bg: "#facc15", ink: "#161815" },
                  { ch: "A", bg: "#f472b6", ink: "#161815" },
                  { ch: "C", bg: "#69ce11", ink: "#161815" },
                  { ch: "H", bg: "#2dd4bf", ink: "#161815" },
                  { ch: "A", bg: "#a78bfa", ink: "#FBFAF7" },
                  { ch: "N", bg: "#f87171", ink: "#161815" },
                ].map((cell, i) => (
                  <span
                    key={`${cell.ch}-${i}`}
                    className="grid h-8 w-8 place-items-center rounded-full text-[0.7rem] font-extrabold tracking-tight sm:h-9 sm:w-9 sm:text-xs"
                    style={{ background: cell.bg, color: cell.ink }}
                  >
                    {cell.ch}
                  </span>
                ))}
              </div>

              <p className="mt-8 text-[1.35rem] font-extrabold tracking-tight text-[#161815] sm:text-[1.5rem]">
                Pahachan in your inbox
              </p>
              <form
                className="mt-5 flex items-end gap-2 border-b border-[#161815] pb-2"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="min-w-0 flex-1 bg-transparent text-[0.95rem] text-[#161815] outline-none placeholder:text-[#9A948A]"
                  aria-label="Email for updates"
                />
                <button
                  type="submit"
                  className="grid h-8 w-8 shrink-0 place-items-center text-[#161815] transition hover:opacity-60"
                  aria-label="Subscribe"
                >
                  <ArrowRight className="h-5 w-5" strokeWidth={2.25} />
                </button>
              </form>
            </div>

            {/* Right — link columns */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 sm:gap-x-6">
              {[
                {
                  title: "Discover",
                  links: [
                    { label: "Platform", href: "#platform" },
                    { label: "How it works", href: "#how" },
                    { label: "What you get", href: "#results" },
                    { label: "Catalogue", href: "#platform" },
                    { label: "Log in", to: "/login" },
                  ],
                },
                {
                  title: "Learn",
                  links: [
                    { label: "FAQ", href: "#faq" },
                    { label: "Brand workspace", to: "/login" },
                  ],
                },
                {
                  title: "Contact",
                  links: [
                    { label: "Instagram", href: "#top" },
                    { label: "Support", href: "#faq" },
                  ],
                },
                {
                  title: "Legal",
                  links: [
                    { label: "Privacy Policy", href: "#top" },
                    { label: "Terms", href: "#top" },
                  ],
                },
              ].map((col) => (
                <div key={col.title}>
                  <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.14em] text-[#161815]">
                    {col.title}
                  </p>
                  <ul className="mt-4 space-y-2.5">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        {link.to ? (
                          <Link
                            to={link.to}
                            className="text-[0.9rem] text-[#161815]/75 transition hover:text-[#161815]"
                          >
                            {link.label}
                          </Link>
                        ) : (
                          <a
                            href={link.href}
                            className="text-[0.9rem] text-[#161815]/75 transition hover:text-[#161815]"
                          >
                            {link.label}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Large brand wordmark graphic — Funner-style, on Paper, no cards */}
          <div className="relative mt-14 overflow-hidden sm:mt-20" aria-hidden="true">
            <svg
              viewBox="0 0 1440 340"
              className="h-auto w-full select-none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMid meet"
            >
              <text
                x="720"
                y="215"
                textAnchor="middle"
                fill="none"
                stroke="#161815"
                strokeWidth="6"
                strokeLinejoin="round"
                style={{
                  fontFamily: "ui-sans-serif, system-ui, sans-serif",
                  fontWeight: 800,
                  fontSize: "168px",
                  letterSpacing: "-0.04em",
                }}
              >
                pahachan
              </text>
              {/* Stem rings */}
              <circle cx="180" cy="285" r="20" fill="none" stroke="#161815" strokeWidth="5" />
              <circle cx="420" cy="285" r="16" fill="none" stroke="#161815" strokeWidth="5" />
              <circle cx="720" cy="285" r="18" fill="none" stroke="#161815" strokeWidth="5" />
              <circle cx="1020" cy="285" r="22" fill="none" stroke="#161815" strokeWidth="5" />
              <circle cx="1260" cy="285" r="17" fill="none" stroke="#161815" strokeWidth="5" />
              {/* Colored accent orbs */}
              <circle cx="175" cy="72" r="36" fill="#60a5fa" />
              <circle cx="175" cy="72" r="11" fill="#fb923c" />
              <circle cx="390" cy="278" r="40" fill="#a78bfa" />
              <circle cx="390" cy="278" r="12" fill="#facc15" />
              <circle cx="560" cy="68" r="30" fill="#fb923c" />
              <circle cx="560" cy="68" r="10" fill="#60a5fa" />
              <circle cx="780" cy="285" r="38" fill="#69ce11" />
              <circle cx="780" cy="285" r="12" fill="#f472b6" />
              <circle cx="980" cy="75" r="28" fill="#facc15" />
              <circle cx="980" cy="75" r="9" fill="#a78bfa" />
              <circle cx="1145" cy="278" r="42" fill="#f472b6" />
              <circle cx="1145" cy="278" r="13" fill="#69ce11" />
              <circle cx="1320" cy="90" r="26" fill="#2dd4bf" />
              <circle cx="1320" cy="90" r="8" fill="#161815" />
            </svg>
          </div>

          <p className="mt-6 pb-2 text-center text-xs tracking-wide text-[#9A948A] sm:text-left">
            © {new Date().getFullYear()} Pahachan · Clothing brands for creators
          </p>
        </div>
      </footer>
    </div>
  );
}
