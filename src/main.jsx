import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { StoreProvider } from "./store.jsx";

const SESSION_KEY = "pahachan-session";
const THEME_KEY = "pahachan-theme";

function Root() {
  const [session, setSession] = useState(() => localStorage.getItem(SESSION_KEY));
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
          onLogin={(email) => {
            localStorage.setItem(SESSION_KEY, email);
            setSession(email);
          }}
          onLogout={() => {
            localStorage.removeItem(SESSION_KEY);
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
