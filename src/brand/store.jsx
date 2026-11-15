import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  brands,
  coupons as seedCoupons,
  customers as seedCustomers,
  defaultStorefront,
  notifications as seedNotes,
  orders as seedOrders,
  products,
  tickets as seedTickets,
  traffic as seedTraffic,
  campaigns as seedCampaigns,
} from "./data/seed";
import { priceError } from "./lib/metrics";
import { brandFormToSaTicket, pushBrandRaisedTicket } from "../support/bridge";

const KEY = "pahachan-partner-demo-v1";
const StoreContext = createContext(null);

const emptyState = {
  brandId: "brand-k",
  /** When set, switchBrand without { demo: true } cannot leave this brand (session membership). */
  lockedBrandId: null,
  selections: {},
  storefronts: {},
  read: {},
  tickets: [],
  coupons: [],
  campaigns: [],
  requests: [],
  profiles: {},
  passwords: {},
  teamAdded: {},
  teamRemoved: {},
  prefs: {},
  lessons: {},
  twoFa: {},
  banks: {},
};

function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...emptyState, ...JSON.parse(raw) } : emptyState;
  } catch {
    return emptyState;
  }
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(loadState);
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!flash) return undefined;
    const timer = setTimeout(() => setFlash(null), 2600);
    return () => clearTimeout(timer);
  }, [flash]);

  const api = useMemo(() => {
    const brand = brands.find((item) => item.id === state.brandId) || brands[0];
    const profile = { ...brand, ...(state.profiles[brand.id] || {}) };
    const bank = { ...brand.bank, ...(state.banks[brand.id] || {}) };

    const selectionFor = (product) => {
      const extra = state.selections[brand.id]?.[product.id];
      return {
        selected: extra?.selected ?? brand.productIds.includes(product.id),
        retail: extra?.retail ?? brand.pricing[product.id] ?? product.suggestedRetail,
        promo: extra?.promo ?? null,
        featured: extra?.featured ?? brand.featured.includes(product.id),
      };
    };

    const catalogue = products.map((product) => {
      const selection = selectionFor(product);
      const selling = selection.promo ?? selection.retail;
      return {
        ...product,
        ...selection,
        selling,
        grossMargin: selling - product.supplyPrice,
        availability: product.stock <= 0 ? "Out of stock" : product.stock < 8 ? "Low" : "In stock",
      };
    });

    const patchSelection = (productId, patch) => {
      const product = products.find((item) => item.id === productId);
      const prev = selectionFor(product);
      if (patch.selected === true && product.approval !== "Approved") {
        setFlash("This style is waiting for central approval, so it cannot be listed yet.");
        return;
      }
      if (patch.featured && !(patch.selected ?? prev.selected)) {
        setFlash("List the product before featuring it.");
        return;
      }
      const next = { ...prev, ...patch };
      setState((current) => ({
        ...current,
        selections: {
          ...current.selections,
          [brand.id]: { ...current.selections[brand.id], [productId]: next },
        },
      }));
    };

    const orders = seedOrders.filter((order) => order.brandId === brand.id);
    const customers = seedCustomers.filter((customer) => customer.brandId === brand.id);
    const traffic = seedTraffic.filter((row) => row.brandId === brand.id);
    const baseNotes = seedNotes.filter((note) => note.brandId === brand.id).map((note) => ({
      ...note,
      read: state.read[note.id] ?? note.read,
    }));
    const tickets = [...seedTickets.filter((ticket) => ticket.brandId === brand.id), ...state.tickets.filter((ticket) => ticket.brandId === brand.id)];
    const couponRows = [...seedCoupons.filter((coupon) => coupon.brandId === brand.id), ...state.coupons.filter((coupon) => coupon.brandId === brand.id)];
    const campaignRows = [...seedCampaigns.filter((campaign) => campaign.brandId === brand.id), ...state.campaigns.filter((campaign) => campaign.brandId === brand.id)];
    const removed = new Set(state.teamRemoved[brand.id] || []);
    const team = [...brand.team, ...(state.teamAdded[brand.id] || [])].filter((member) => !removed.has(member.id));
    const savedStore = state.storefronts[brand.id];
    const published = savedStore?.published || defaultStorefront(brand);
    const draft = savedStore?.draft || published;

    return {
      brands,
      brand: { ...profile, bank, team },
      products: catalogue,
      orders,
      customers,
      traffic,
      notifications: baseNotes,
      tickets,
      coupons: couponRows,
      campaigns: campaignRows,
      requests: state.requests.filter((request) => request.brandId === brand.id),
      prefs: state.prefs[brand.id] || { orders: true, products: true, payments: true, store: true, announcements: true },
      lessons: state.lessons,
      twoFa: Boolean(state.twoFa[brand.id]),
      draft,
      published,
      flash,
      clearFlash: () => setFlash(null),
      notify: (message) => setFlash(message),
      /**
       * Demo-only tenant switch. Pass { demo: true } to leave the authenticated brand.
       * Production must never allow this without server-side membership checks.
       */
      switchBrand: (brandId, options = {}) => {
        setState((current) => {
          const locked = current.lockedBrandId;
          if (locked && brandId !== locked && !options.demo) {
            setFlash("Demo: tenant locked to your signed-in brand. Enable demo switcher to preview others.");
            return current;
          }
          return { ...current, brandId };
        });
      },
      lockToBrand: (brandId) =>
        setState((current) => ({
          ...current,
          brandId: brandId || current.brandId,
          lockedBrandId: brandId || null,
        })),
      unlockDemoTenantSwitch: () => setState((current) => ({ ...current, lockedBrandId: null })),
      toggleSelected: (productId, selected) => patchSelection(productId, selected ? { selected: true } : { selected: false, featured: false }),
      savePrice: (product, retail, promo) => {
        const error = priceError(product, retail, promo);
        if (error) return error;
        patchSelection(product.id, { retail: Number(retail), promo: promo === "" || promo == null ? null : Number(promo) });
        setFlash("Demo price saved for this brand only.");
        return "";
      },
      bulkRetail: (ids, retail) => {
        let applied = 0;
        ids.forEach((id) => {
          const product = products.find((item) => item.id === id);
          if (!priceError(product, retail, null)) {
            patchSelection(id, { retail: Number(retail) });
            applied += 1;
          }
        });
        setFlash(applied ? `Demo retail price applied to ${applied} products.` : "None of the selected products accepted that price.");
      },
      toggleFeatured: (productId, featured) => patchSelection(productId, { featured }),
      saveDraft: (draftNext) => {
        setState((current) => ({
          ...current,
          storefronts: {
            ...current.storefronts,
            [brand.id]: { published, draft: draftNext },
          },
        }));
        setFlash("Draft saved in this browser. Nothing is live until you publish.");
      },
      publish: (draftNext) => {
        setState((current) => ({
          ...current,
          storefronts: {
            ...current.storefronts,
            [brand.id]: { draft: draftNext, published: { ...draftNext, publishedAt: new Date().toISOString() } },
          },
        }));
        setFlash("Demo publish complete. Checkout and shipping settings were not changed.");
      },
      markRead: (id, read = true) => setState((current) => ({ ...current, read: { ...current.read, [id]: read } })),
      markAllRead: () => {
        const read = { ...state.read };
        baseNotes.forEach((note) => {
          read[note.id] = true;
        });
        setState((current) => ({ ...current, read }));
      },
      addTicket: (ticket) => {
        const saTicket = brandFormToSaTicket(ticket, brand);
        pushBrandRaisedTicket(saTicket);
        const row = {
          ...ticket,
          id: saTicket.id,
          brandId: brand.id,
          status: "Open",
          createdAt: saTicket.createdAt,
          message: ticket.message || ticket.description || "",
          replies: [],
        };
        setState((current) => ({ ...current, tickets: [...current.tickets, row] }));
        setFlash("Ticket raised. Super Admin Support inbox can see it in this browser.");
        return row.id;
      },
      addCoupon: (coupon) => {
        const exists = couponRows.some((row) => row.code.toLowerCase() === coupon.code.toLowerCase());
        if (exists) return "That code already exists for this brand.";
        if (coupon.type === "percent" && Number(coupon.value) > brand.maxDiscount * 100) {
          return `This brand's demo cap is ${brand.maxDiscount * 100}%.`;
        }
        setState((current) => ({
          ...current,
          coupons: [...current.coupons, { ...coupon, id: `cp-${Date.now()}`, brandId: brand.id, uses: 0, status: "Active" }],
        }));
        setFlash("Demo coupon saved. It does not rewrite past orders.");
        return "";
      },
      addCampaign: (campaign) => {
        setState((current) => ({
          ...current,
          campaigns: [...current.campaigns, { ...campaign, id: `cm-${Date.now()}`, brandId: brand.id, status: "Scheduled" }],
        }));
        setFlash("Demo campaign saved for this brand.");
      },
      addRequest: (request) => {
        setState((current) => ({
          ...current,
          requests: [...current.requests, { ...request, id: `req-${Date.now()}`, brandId: brand.id, status: "Sent to Pahachan" }],
        }));
        setFlash("Catalogue request sent as a demo record.");
      },
      saveProfile: (patch) => {
        setState((current) => ({
          ...current,
          profiles: { ...current.profiles, [brand.id]: { ...current.profiles[brand.id], ...patch } },
        }));
        setFlash("Brand profile updated in this demo.");
      },
      saveBank: (nextBank) => {
        setState((current) => ({ ...current, banks: { ...current.banks, [brand.id]: nextBank } }));
        setFlash("Settlement account updated in this demo only.");
      },
      savePrefs: (prefs) => setState((current) => ({ ...current, prefs: { ...current.prefs, [brand.id]: prefs } })),
      changePassword: (next, confirm, currentPassword) => {
        const expected = state.passwords[brand.id] || "demo1234";
        if (currentPassword !== expected) return "Current password does not match the demo password.";
        if (next.length < 8) return "Use at least 8 characters.";
        if (next !== confirm) return "The new passwords do not match.";
        setState((current) => ({ ...current, passwords: { ...current.passwords, [brand.id]: next } }));
        setFlash("Demo password updated in this browser.");
        return "";
      },
      passwordFor: (email) => {
        const match = brands.find((item) => item.email.toLowerCase() === email.toLowerCase());
        if (!match) return null;
        return state.passwords[match.id] || "demo1234";
      },
      brandByEmail: (email) => brands.find((item) => item.email.toLowerCase() === email.toLowerCase()) || null,
      addMember: (member) => {
        if (!brand.teamEnabled) return "Team seats are not enabled for this brand.";
        if (!member.name || !member.email.includes("@")) return "Enter a name and email.";
        const row = { ...member, id: `tm-${Date.now()}` };
        setState((current) => ({
          ...current,
          teamAdded: { ...current.teamAdded, [brand.id]: [...(current.teamAdded[brand.id] || []), row] },
        }));
        setFlash("Demo teammate added. This does not send an invite email.");
        return "";
      },
      removeMember: (id) => {
        setState((current) => ({
          ...current,
          teamRemoved: { ...current.teamRemoved, [brand.id]: [...(current.teamRemoved[brand.id] || []), id] },
        }));
        setFlash("Teammate removed from this demo.");
      },
      completeLesson: (id) => setState((current) => ({ ...current, lessons: { ...current.lessons, [id]: true } })),
      requestTwoFa: () => {
        setState((current) => ({ ...current, twoFa: { ...current.twoFa, [brand.id]: true } }));
        setFlash("Demo request noted. Pahachan security would enable 2FA in production.");
      },
      resetDemo: () => {
        localStorage.removeItem(KEY);
        setState(emptyState);
        setFlash("Demo data reset.");
      },
    };
  }, [state, flash]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function usePartner() {
  return useContext(StoreContext);
}
