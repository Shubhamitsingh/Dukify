import { useState } from "react";
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
      <h1 className="text-2xl font-bold tracking-tight text-[#161815]">Sign in</h1>
      <p className="mt-1.5 text-sm leading-relaxed text-[#6E685F]">
        {demoOn
          ? "Use any demo account below — email and password are filled for you."
          : "Demo login is off. Set VITE_DEMO_MODE=true or configure Supabase Auth."}
      </p>

      <label className="mt-6 block text-sm font-medium text-[#161815]">
        Email
        <input
          className="mt-1.5 w-full rounded-xl border border-[#DDD6CB] bg-white px-3.5 py-2.5 text-[#161815] outline-none transition focus:border-[#69ce11]"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>

      <label className="mt-4 block text-sm font-medium text-[#161815]">
        Password
        <div className="relative mt-1.5">
          <input
            className="w-full rounded-xl border border-[#DDD6CB] bg-white px-3.5 py-2.5 pr-14 text-[#161815] outline-none transition focus:border-[#69ce11]"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            type="button"
            className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-[#6E685F]"
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
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-[#161815] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        style={{ background: "#69ce11" }}
      >
        <LogIn className="h-4 w-4" />
        Login
      </button>

      {picks.length ? (
        <div className="mt-5 max-h-44 space-y-2 overflow-y-auto rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] p-3 text-xs text-[#6E685F] sm:max-h-52">
          <p className="font-semibold text-[#161815]">
            Demo accounts — click to fill ({DEMO_USERS.length} users)
          </p>
          {picks.map((account) => (
            <button
              key={account.email}
              type="button"
              className="flex w-full flex-col rounded-lg border border-[#E5E5E5] bg-white px-2.5 py-2 text-left transition hover:border-[#69ce11]"
              onClick={() => useAccount(account)}
            >
              <span className="font-medium text-[#161815]">{account.label}</span>
              <span className="text-[#6E685F]">{account.email}</span>
              <span className="mt-0.5 font-mono text-[11px] text-[#1F5C40]">
                password: {account.password}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </form>
  );
}

/**
 * Dedicated login page: blank white background + centered popup-style card.
 */
export function Login({ onSuccess }) {
  return (
    <div className="relative flex min-h-[100svh] items-center justify-center bg-white px-4 py-10 sm:px-6">
      <Link
        to="/"
        className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-[#161815] transition hover:bg-black/5 sm:left-6 sm:top-6"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2.25} />
        Back to home
      </Link>

      <div className="relative w-full max-w-md rounded-2xl border border-[#E8E8E8] bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.12)] sm:p-8">
        <LoginForm onSuccess={onSuccess} />
      </div>
    </div>
  );
}
