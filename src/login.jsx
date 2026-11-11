import { useState } from "react";
import { LogIn } from "lucide-react";

export function Login({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");

  const ready = email.trim().length > 3 && password.trim().length > 0;

  const submit = (event) => {
    event.preventDefault();
    if (!ready) return;
    onSuccess(email.trim());
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
          <div className="w-52 rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm">
            <p className="text-xs text-gray-500">Sales</p>
            <p className="text-xs text-gray-400">Sample month</p>
            <p className="mt-2 text-2xl font-semibold">₹21.3k</p>
            <p className="text-xs font-medium text-emerald-600">Central fulfilment</p>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 left-0 h-40 bg-gradient-to-t from-pink-400/80 to-transparent" />
      </div>
      <div className="flex w-full items-center justify-center px-6 lg:w-1/3">
        <form onSubmit={submit} className="w-full max-w-sm">
          <h1 className="mb-6 text-lg font-semibold tracking-tight">
            Welcome to Pahachan <span className="text-2xl">👋</span>
          </h1>
          {message ? (
            <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {message}
            </p>
          ) : null}
          <label className="mb-4 block text-sm">
            <span className="mb-1 block font-medium">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="owner@pahachan.example"
              className="input-field border-2 py-3"
            />
          </label>
          <label className="mb-4 block text-sm">
            <span className="mb-1 block font-medium">Password</span>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="input-field border-2 py-3 pr-16"
              />
              <button
                type="button"
                className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-gray-500"
                onClick={() => setShow((value) => !value)}
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
          </label>
          <div className="mb-5 flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-600">
              <input type="checkbox" className="accent-pink-500" />
              Remember me
            </label>
            <button
              type="button"
              className="font-medium text-pink-500"
              onClick={() =>
                setMessage("Mail is not connected. Any email and password opens this local panel.")
              }
            >
              Forgot password?
            </button>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={!ready}>
            <LogIn className="h-4 w-4" />
            Login
          </button>
          <p className="mt-4 text-xs leading-5 text-gray-500">
            This sign-in stays in the browser. It does not check a database.
          </p>
        </form>
      </div>
    </div>
  );
}
