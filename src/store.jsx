import { createContext, useCallback, useContext, useState } from "react";
import { seed } from "./data";
import { cascade, nextId } from "./local";
import { normalizeSettings } from "./settings/data/defaults";

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
      if (!Array.isArray(current[collection])) return current;
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

  const load = (next) => {
    const payload = next && typeof next === "object"
      ? { ...next, settings: normalizeSettings(next.settings) }
      : next;
    setDb(payload);
    toast("Loaded into this browser session. Nothing was written to a database.");
  };

  /** Silent merge for module seed hydration (no toast). */
  const mergeSilent = useCallback((partial) => {
    setDb((current) => ({ ...current, ...partial }));
  }, []);

  const bulkUpsert = (collection, rows, note) => {
    if (!Array.isArray(rows) || !rows.length) return { created: 0, updated: 0 };
    let created = 0;
    let updated = 0;
    setDb((current) => {
      if (!Array.isArray(current[collection])) return current;
      let list = [...current[collection]];
      rows.forEach((row) => {
        const matchIndex = row.sku
          ? list.findIndex((item) => item.sku === row.sku)
          : row.id
            ? list.findIndex((item) => item.id === row.id)
            : -1;
        if (matchIndex >= 0) {
          list[matchIndex] = { ...list[matchIndex], ...row, id: list[matchIndex].id };
          updated += 1;
        } else {
          const id = row.id || nextId(list);
          list = [{ ...row, id }, ...list];
          created += 1;
        }
      });
      return {
        ...current,
        [collection]: list,
        audit: [
          {
            id: `AUD-${Date.now()}`,
            when: "Just now",
            actor: "Platform owner",
            what: note || `${collection} bulk upsert`,
            detail: `${created} created · ${updated} updated · session only`,
          },
          ...current.audit,
        ],
      };
    });
    toast(`Bulk saved ${rows.length} ${collection} in this browser session.`);
    return { created, updated };
  };

  const removeMany = (collection, ids, note) => {
    const idSet = new Set(ids);
    setDb((current) => {
      if (!Array.isArray(current[collection])) return current;
      return {
        ...current,
        [collection]: current[collection].filter((row) => !idSet.has(row.id)),
        audit: [
          {
            id: `AUD-${Date.now()}`,
            when: "Just now",
            actor: "Platform owner",
            what: note || `${collection} removed`,
            detail: `${ids.length} rows · session only`,
          },
          ...current.audit,
        ],
      };
    });
    toast(`Removed ${ids.length} ${collection} from this browser session.`);
  };

  const saveSettings = (settings, note = "Platform settings updated") => {
    const normalized = normalizeSettings(settings);
    setDb((current) => ({
      ...current,
      settings: normalized,
      audit: [
        {
          id: `AUD-${Date.now()}`,
          when: "Just now",
          actor: "Platform owner",
          what: note,
          module: "Settings",
          detail: normalized.company?.name || "Settings",
        },
        ...current.audit,
      ],
    }));
    toast("Settings kept in this browser session only.");
  };

  return (
    <StoreContext.Provider value={{ db, patch, add, load, mergeSilent, bulkUpsert, removeMany, saveSettings, toast }}>
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
