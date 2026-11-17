import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, LogIn } from "lucide-react";
import { authenticate } from "./auth";
import { DEMO_USERS, isDemoMode } from "./access";

/** Always show clickable demo accounts while demo mode is on (default). */
const DEMO_PICKS = [
  { label: "Platform Owner", email: "owner@pahachan.demo", password: "OwnerDemo!2026" },
  { label: "Platform Admin", email: "admin@pahachan.demo", password: "AdminDemo!2026" },
  { label: "Orders Staff (2 brands)", email: "orders.staff@pahachan.demo", password: "StaffDemo!2026" },
  { label: "Finance Staff", email: "finance.staff@pahachan.demo", password: "FinanceDemo!2026" },
  { label: "Unscoped Staff", email: "new.staff@pahachan.demo", password: "EmptyDemo!2026" },
  { label: "Brand Owner", email: "owner@aisa.demo", password: "BrandOwner!2026" },
  { label: "Brand Admin", email: "admin@aisa.demo", password: "BrandAdmin!2026" },
  { label: "Brand Staff", email: "staff@aisa.demo", password: "BrandStaff!2026" },
];

const LOOKS = [
  { src: "/landing/lp-d2c-flatlay.webp", alt: "Shirt on a studio stand" },
  { src: "/landing/lp-d2c-rack.webp", alt: "Clothing on a store rack" },
  { src: "/landing/lp-d2c-store.webp", alt: "Clothes hanging in a shop" },
];

/** Icon file ships on a black canvas. Knock out near-black so the mark can sit on a photo. */
function DukifyMark({ className }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.drawImage(image, 0, 0);
      const frame = context.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = frame.data;
      for (let index = 0; index < pixels.length; index += 4) {
        if (pixels[index] < 24 && pixels[index + 1] < 24 && pixels[index + 2] < 24) {
          pixels[index + 3] = 0;
        }
      }
      context.putImageData(frame, 0, 0);
      let minX = canvas.width;
      let minY = canvas.height;
      let maxX = 0;
      let maxY = 0;
      for (let y = 0; y < canvas.height; y += 1) {
        for (let x = 0; x < canvas.width; x += 1) {
          if (pixels[(y * canvas.width + x) * 4 + 3] < 16) continue;
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
      const cropWidth = Math.max(1, maxX - minX + 1);
      const cropHeight = Math.max(1, maxY - minY + 1);
      const cropped = document.createElement("canvas");
      cropped.width = cropWidth;
      cropped.height = cropHeight;
      cropped.getContext("2d").drawImage(canvas, minX, minY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
      setSrc(cropped.toDataURL("image/png"));
    };
    image.src = "/logo/logo-dukify.png";
  }, []);

  if (!src) return <span className={`inline-block ${className}`} aria-hidden="true" />;
  return <img src={src} alt="Dukify" className={className} />;
}

export function LoginForm({ onSuccess }) {
  const demoOn = isDemoMode();
  const picks = demoOn ? DEMO_PICKS : [];
  const [email, setEmail] = useState(picks[0]?.email || "");
  const [password, setPassword] = useState(picks[0]?.password || "");
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");

  const ready = email.trim().length > 3 && password.trim().length > 0;

  const submit = (event) => {
    event.preventDefault();
    if (!ready) return;
    const result = authenticate(email, password);
    if (result.error) {
      setMessage(result.error);
      return;
    }
    setMessage("");
    onSuccess(result.session);
  };

  const useAccount = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setMessage("");
  };

  return (
    <form className="w-full" onSubmit={submit}>
      <img src="/logo/logo-ducku-2.png" alt="Dukify" className="mb-8 h-9 w-auto max-w-[180px] object-contain object-left" />
      <h1 className="text-[2rem] leading-none font-bold tracking-tight text-[#001E55]">Sign in</h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#64748B]">
        {demoOn
          ? "Email and password are already filled. Pick another demo account if you need a different desk."
          : "Demo login is off. Set VITE_DEMO_MODE=true or configure Supabase Auth."}
      </p>

      <label className="mt-8 block text-sm font-medium text-[#001E55]">
        Email
        <input
          className="mt-1.5 w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3.5 text-[#1F2937] outline-none transition focus:border-[#EE8802] focus:ring-4 focus:ring-[#EE8802]/15"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>

      <label className="mt-4 block text-sm font-medium text-[#001E55]">
        Password
        <div className="relative mt-1.5">
          <input
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3.5 pr-16 text-[#1F2937] outline-none transition focus:border-[#EE8802] focus:ring-4 focus:ring-[#EE8802]/15"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            type="button"
            className="absolute top-1/2 right-4 -translate-y-1/2 text-sm font-medium text-[#64748B]"
            onClick={() => setShow((value) => !value)}
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>
      </label>

      {message ? <p className="mt-3 text-sm text-rose-600">{message}</p> : null}

      <button
        type="submit"
        disabled={!ready}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-bold text-[#001E55] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        style={{ background: "#EE8802" }}
      >
        <LogIn className="h-4 w-4" />
        Login
      </button>

      {picks.length ? (
        <div className="mt-9">
          <p className="text-xs font-semibold tracking-[0.14em] text-[#64748B] uppercase">
            Demo accounts · {DEMO_USERS.length}
          </p>
          <ul className="mt-3 max-h-44 space-y-1 overflow-y-auto pr-1">
            {picks.map((account) => {
              const active = email === account.email;
              return (
                <li key={account.email}>
                  <button
                    type="button"
                    aria-pressed={active}
                    className={`flex w-full flex-col rounded-xl px-3 py-2.5 text-left transition ${
                      active ? "bg-[#EEF3FA]" : "hover:bg-[#F7F9FC]"
                    }`}
                    onClick={() => useAccount(account)}
                  >
                    <span className="text-sm font-medium text-[#001E55]">{account.label}</span>
                    <span className="mt-0.5 truncate text-xs text-[#64748B]">
                      {account.email}
                      <span className="px-1.5 text-[#E2E8F0]">·</span>
                      <span className="font-mono">{account.password}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </form>
  );
}

/** Split sign-in: campaign photo + one form. */
export function Login({ onSuccess }) {
  return (
    <div className="grid min-h-[100svh] bg-white lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]">
      <aside className="relative hidden min-h-[100svh] lg:block">
        <img
          src="/landing/lp-creator.webp"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#001E55] via-[#001E55]/25 to-[#001E55]/10" />
        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          <span className="inline-flex w-fit rounded-2xl bg-white p-2.5 shadow-lg shadow-[#001E55]/25">
            <DukifyMark className="h-11 w-11 object-contain" />
          </span>
          <div className="max-w-lg">
            <div className="mb-6 flex gap-2">
              {LOOKS.map((look) => (
                <img
                  key={look.src}
                  src={look.src}
                  alt={look.alt}
                  className="h-16 w-16 rounded-2xl object-cover ring-2 ring-white/80 sm:h-[4.5rem] sm:w-[4.5rem]"
                />
              ))}
            </div>
            <p className="text-4xl leading-[1.05] font-bold tracking-tight text-white xl:text-5xl">
              Your brand workspace, in one place.
            </p>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-white/80">
              Catalogue, storefront, and orders for every label on the desk.
            </p>
          </div>
        </div>
      </aside>

      <main className="flex min-h-[100svh] flex-col px-5 py-6 sm:px-10 lg:px-12 xl:px-16">
        <Link
          to="/"
          className="inline-flex w-fit items-center gap-1.5 rounded-full px-1 py-2 text-sm font-semibold text-[#001E55] transition hover:bg-[#EEF3FA]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.25} />
          Back to home
        </Link>
        <div className="mx-auto my-auto w-full max-w-md py-6">
          <LoginForm onSuccess={onSuccess} />
        </div>
      </main>
    </div>
  );
}
