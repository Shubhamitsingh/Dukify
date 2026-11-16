import { useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LoginModal } from "./login";

/**
 * Landing-only colors
 * 1. Background  2. Text (Ink)  3. Accent
 */
const C = {
  bg: "#F3F0EA",
  text: "#161815",
  muted: "#6E685F",
  accent: "#69ce11",
};

export function LandingPage({ onLogin }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const loginOpen = searchParams.get("login") === "1";

  const openLogin = useCallback(() => {
    navigate({ pathname: "/", search: "?login=1" }, { replace: false });
  }, [navigate]);

  const closeLogin = useCallback(() => {
    navigate("/", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-[100svh]" style={{ background: C.bg, color: C.text }}>
      <header className="mx-auto flex h-16 w-full max-w-[1100px] items-center justify-between px-6 sm:px-8">
        <button
          type="button"
          onClick={closeLogin}
          className="flex items-center gap-2.5"
          aria-label="Pahachan home"
        >
          <span
            className="grid h-8 w-8 place-items-center rounded-md text-sm font-extrabold text-[#161815]"
            style={{ background: C.accent }}
          >
            P
          </span>
          <span className="text-[1.35rem] font-bold tracking-tight">pahachan</span>
        </button>

        <button
          type="button"
          onClick={openLogin}
          className="text-[0.95rem] font-medium text-[#161815] transition hover:opacity-70"
        >
          Log in
        </button>
      </header>

      <main className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-[720px] flex-col items-center justify-center px-6 pb-20 text-center sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6E685F]">
          Clothing brand workspace
        </p>
        <h1 className="mt-4 text-[clamp(2.4rem,7vw,4.25rem)] font-bold leading-[1.08] tracking-[-0.04em] text-[#161815]">
          Start your clothing brand
        </h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-[#6E685F] sm:text-lg">
          Pick products, open your brand store, and run day-to-day work from one simple workspace.
        </p>

        <button
          type="button"
          onClick={openLogin}
          className="mt-10 inline-flex h-12 items-center justify-center rounded-full px-8 text-[0.95rem] font-bold text-[#161815] transition hover:brightness-110"
          style={{ background: C.accent }}
        >
          Log in
        </button>
      </main>

      <LoginModal
        open={loginOpen}
        onClose={closeLogin}
        onSuccess={(session) => {
          closeLogin();
          onLogin?.(session);
        }}
      />
    </div>
  );
}
