import { useState } from "react";
import { LogIn } from "lucide-react";
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

export function Login({ onSuccess }) {
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
    <div className="flex min-h-screen bg-white">
      <div className="relative hidden w-2/3 overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 lg:block">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-20 -left-20 h-96 w-96 rounded-full border border-gray-300" />
          <div className="absolute top-10 left-10 h-80 w-80 rounded-full border border-gray-300" />
          <div className="absolute top-32 left-32 h-64 w-64 rounded-full border border-gray-300" />
        </div>
        <div className="absolute top-24 left-24 h-32 w-32 rounded-full bg-pink-300 opacity-30 blur-3xl" />
        <div className="absolute right-24 bottom-32 h-40 w-40 rounded-full bg-purple-300 opacity-30 blur-3xl" />
        <div className="absolute top-16 left-16">
          <div className="mb-8 flex items-center gap-2">
            <span className="h-6 w-1 rounded-full bg-pink-500" />
            <span className="text-sm font-semibold">Pahachan</span>
          </div>
          <div className="w-64 rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm">
            <p className="text-xs text-gray-500">Privilege-based admin</p>
            <p className="mt-2 text-sm font-semibold text-gray-900">Six roles · permissions · brand scope</p>
            <p className="mt-1 text-xs text-gray-400">
              {demoOn ? "Demo login enabled — click an account to sign in" : "Configure Supabase Auth to sign in"}
            </p>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 left-0 h-40 bg-gradient-to-t from-pink-400/80 to-transparent" />
      </div>
      <div className="flex w-full items-center justify-center px-6 lg:w-1/3">
        <form className="w-full max-w-sm" onSubmit={submit}>
          <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
          <p className="mt-1 text-sm text-gray-500">
            {demoOn
              ? "Use any demo account below — email and password are filled for you."
              : "Demo login is off. Set VITE_DEMO_MODE=true or configure Supabase Auth."}
          </p>
          <label className="mt-6 block text-sm font-medium text-gray-700">
            Email
            <input
              className="input-field mt-1.5 w-full"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="mt-4 block text-sm font-medium text-gray-700">
            Password
            <div className="relative mt-1.5">
              <input
                className="input-field w-full pr-14"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"
                onClick={() => setShow((value) => !value)}
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
          </label>
          {message ? <p className="mt-3 text-sm text-rose-600">{message}</p> : null}
          <button type="submit" className="btn-primary mt-5 w-full" disabled={!ready}>
            <LogIn className="h-4 w-4" />
            Login
          </button>

          {picks.length ? (
            <div className="mt-5 max-h-64 space-y-2 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50 p-3 text-xs text-gray-700">
              <p className="font-semibold text-gray-900">
                Demo accounts — click to fill ({DEMO_USERS.length} users)
              </p>
              {picks.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  className="flex w-full flex-col rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-left hover:border-pink-300"
                  onClick={() => useAccount(account)}
                >
                  <span className="font-medium text-gray-900">{account.label}</span>
                  <span className="text-gray-600">{account.email}</span>
                  <span className="mt-0.5 font-mono text-[11px] text-pink-700">
                    password: {account.password}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}
