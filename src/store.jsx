import { createContext, useContext, useState } from "react";
import { seed } from "./data";
import { cascade, nextId } from "./local";

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [db, setDb] = useState(() => structuredClone(seed));
  const [toasts, setToasts] = useState([]);

  const toast = (message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, type }]);
    setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3200);
  };

  const patch = (collection, id, changes, note) => {
    setDb((current) => {
      const before = current[collection].find((row) => row.id === id);
      const updated = current[collection].map((row) => (row.id === id ? { ...row, ...changes } : row));
      const after = updated.find((row) => row.id === id);
      const result = cascade({ ...current, [collection]: updated }, collection, before, after);
      return {
        ...result.db,
        audit: [
          {
            id: `AUD-${Date.now()}`,
            when: "Just now",
            actor: "Platform owner",
            what: note || `${collection} ${id} updated`,
            detail: [Object.entries(changes).map(([key, value]) => `${key}: ${value}`).join(", "), result.note]
              .filter(Boolean)
              .join(" · "),
          },
          ...result.db.audit,
        ],
      };
    });
    toast("Saved in this browser session. Nothing was written to a database.");
  };

  const add = (collection, fields) => {
    let created = "";
    setDb((current) => {
      created = nextId(current[collection]);
      const row = { id: created, ...fields };
      let next = { ...current, [collection]: [row, ...current[collection]] };
      if (collection === "orders") {
        next = {
          ...next,
          payments: [
            {
              id: nextId(current.payments),
              order: row.id,
              method: row.method,
              amount: Number(row.value) || 0,
              status: row.payment === "Captured" ? "Captured" : row.payment === "Failed" ? "Failed" : "Pending",
              reference: `LOCAL-${row.id}`,
            },
            ...current.payments,
          ],
        };
      }
      return {
        ...next,
        audit: [
          {
            id: `AUD-${Date.now()}`,
            when: "Just now",
            actor: "Platform owner",
            what: `${collection} ${created} added`,
            detail: "Local session only",
          },
          ...next.audit,
        ],
      };
    });
    toast("Added in this browser session. Nothing was written to a database.");
    return created;
  };

  const saveSettings = (settings) => {
    setDb((current) => ({
      ...current,
      settings,
      audit: [
        {
          id: `AUD-${Date.now()}`,
          when: "Just now",
          actor: "Platform owner",
          what: "Company settings updated",
          detail: settings.company,
        },
        ...current.audit,
      ],
    }));
    toast("Settings kept in this browser session only.");
  };

  return (
    <StoreContext.Provider value={{ db, patch, add, saveSettings, toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex w-[min(100%,320px)] flex-col gap-2">
        {toasts.map((item) => (
          <div
            key={item.id}
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 shadow-sm"
          >
            {item.message}
          </div>
        ))}
      </div>
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
