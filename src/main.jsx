import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { StoreProvider } from "./store.jsx";
import { clearSession, readSession, THEME_KEY, writeSession } from "./auth";

function Root() {
  const [session, setSession] = useState(() => readSession());
  const [dark, setDark] = useState(() => localStorage.getItem(THEME_KEY) === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  }, [dark]);

  return (
    <BrowserRouter>
      <StoreProvider>
        <App
          session={session}
          dark={dark}
          onLogin={(next) => {
            writeSession(next);
            setSession(next);
          }}
          onLogout={() => {
            clearSession();
            setSession(null);
          }}
          onToggleDark={() => setDark((value) => !value)}
        />
      </StoreProvider>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
