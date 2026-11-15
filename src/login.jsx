import { useState } from "react";
import { LogIn } from "lucide-react";
import { authenticate, SUPER_ADMIN_USERS } from "./auth";

export function Login({ onSuccess }) {
  const [email, setEmail] = useState("owner@pahachan.example");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [showHints, setShowHints] = useState(false);
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

  return (
    <div className="flex min-h-screen bg-white">
      <div className="relative hidden w-2/3 overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 lg:block">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-20 -left-20 h-96 w-96 rounded-full border border-gray-300" />
          <div className="absolute top-10 left-10 h-80 w-80 rounded-full border border-gray-300" />
          <div className="absolute top-32 left-32 h-64 w-64 rounded-full border border-gray-300" />
          <div className="absolute right-20 bottom-20 h-96 w-96 rounded-full border border-gray-300" />
          <div className="absolute top-1/2 left-1/4 h-72 w-72 -translate-y-1/2 rounded-full border border-gray-300" />
        </div>
        <div className="absolute top-24 left-24 h-32 w-32 rounded-full bg-pink-300 opacity-30 blur-3xl" />
        <div className="absolute right-24 bottom-32 h-40 w-40 rounded-full bg-purple-300 opacity-30 blur-3xl" />
        <div className="absolute top-16 left-16">
          <div className="mb-8 flex items-center gap-2">
            <span className="h-6 w-1 rounded-full bg-pink-500" />
            <span className="text-sm font-semibold">Pahachan</span>
          </div>
          <div className="w-56 rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm">
            <p className="text-xs text-gray-500">Unified platform</p>
            <p className="mt-2 text-sm font-semibold text-gray-900">Super Admin + Brand</p>
            <p className="mt-1 text-xs text-gray-400">Browser mock demo — not production auth</p>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 left-0 h-40 bg-gradient-to-t from-pink-400/80 to-transparent" />
      </div>
      <div className="flex w-full items-center justify-center px-6 lg:w-1/3">
        <form className="w-full max-w-sm" onSubmit={submit}>
          <p className="mb-2 text-xs font-semibold tracking-wide text-amber-700 uppercase">Demo mode</p>
          <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
          <p className="mt-1 text-sm text-gray-500">Mock session stays in this browser only.</p>
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
          <button
            type="button"
            className="mt-4 w-full text-left text-xs font-semibold text-pink-700 hover:text-pink-800"
            onClick={() => setShowHints((value) => !value)}
          >
            {showHints ? "Hide demo account hints" : "Show demo account hints"}
          </button>
          {showHints ? (
            <div className="mt-3 space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
              <p className="font-semibold">Synthetic demo accounts only — never use in production.</p>
              <div>
                <p className="font-semibold">Super Admin</p>
                <p>
                  {SUPER_ADMIN_USERS[0].email} · password shown after you open hints (demo)
                </p>
                <p className="mt-1 font-mono text-[11px]">{SUPER_ADMIN_USERS[0].password}</p>
              </div>
              <div>
                <p className="font-semibold">Brand Admin</p>
                <p>brandk@pahachan.test · demo1234</p>
                <p className="text-amber-800/70">Also: meera@auraloom.test, ananya@nivastudio.test</p>
              </div>
              <div>
                <p className="font-semibold">Brand Staff</p>
                <p>neel@brandk.test · demo1234</p>
              </div>
            </div>
          ) : null}
          <p className="mt-4 text-xs leading-5 text-gray-500">
            Mock auth only — not hashed, not server-side, not MFA. Do not treat this login as secure.
          </p>
        </form>
      </div>
    </div>
  );
}
