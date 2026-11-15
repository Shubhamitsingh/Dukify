import { useState } from "react";
import { usePartner } from "../store";

export default function Login({ onLogin }) {
  const { brandByEmail, passwordFor } = usePartner();
  const [email, setEmail] = useState("brandk@pahachan.test");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();
    const brand = brandByEmail(email);
    if (!brand || passwordFor(email) !== password) {
      setError("Those demo credentials do not match a brand partner.");
      return;
    }
    onLogin(brand);
  }

  return (
    <div className="app-shell grid min-h-screen place-items-center px-4 py-8 sm:px-6">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[var(--app-shadow)] sm:p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-sm font-semibold text-white">P</div>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-pink-600 uppercase">Pahachan</p>
            <h1 className="text-lg font-semibold tracking-tight sm:text-xl">Brand Partner</h1>
          </div>
        </div>
        <p className="mb-4 text-sm leading-5 text-gray-500">Sign in to the demo portal. Default partner is Brand K. Password for every seeded brand is demo1234 until you change it.</p>
        <label className="mb-3 block text-sm">
          <span className="mb-1 block text-xs font-medium text-gray-500">Email</span>
          <input className="input-field" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" />
        </label>
        <label className="mb-3 block text-sm">
          <span className="mb-1 block text-xs font-medium text-gray-500">Password</span>
          <input className="input-field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
        </label>
        {error ? <p className="mb-3 text-xs text-rose-600">{error}</p> : null}
        <button className="btn-primary w-full" type="submit">
          Enter dashboard
        </button>
        <ul className="mt-4 space-y-1 text-xs text-gray-500">
          <li>brandk@pahachan.test</li>
          <li>meera@auraloom.test</li>
          <li>ananya@nivastudio.test</li>
          <li>rhea@lumen.test</li>
          <li>ishaan@mogra.test</li>
        </ul>
      </form>
    </div>
  );
}
