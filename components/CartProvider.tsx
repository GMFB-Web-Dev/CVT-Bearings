"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SITE_KEY } from "@/lib/catalog";

export type CartLine = { productId: string; slug: string; title: string; price: number; image: string; quantity: number };
type CartValue = { lines: CartLine[]; count: number; total: number; add: (line: Omit<CartLine, "quantity">, quantity?: number) => void; update: (id: string, quantity: number) => void; remove: (id: string) => void; open: boolean; setOpen: (open: boolean) => void };
const CartContext = createContext<CartValue | null>(null);

async function saveCart(lines: CartLine[], userId: string) {
  const supabase = createClient();
  let { data: cart } = await supabase.from("carts").select("id").eq("site_key", SITE_KEY).eq("user_id", userId).eq("status", "active").maybeSingle();
  if (!cart) {
    const created = await supabase.from("carts").insert({ site_key: SITE_KEY, user_id: userId }).select("id").single();
    cart = created.data;
  }
  if (!cart) return;
  await supabase.from("cart_items").delete().eq("cart_id", cart.id);
  if (lines.length) await supabase.from("cart_items").insert(lines.map((line) => ({ site_key: SITE_KEY, cart_id: cart!.id, product_id: line.productId, quantity: line.quantity, unit_price_nzd: line.price })));
}

async function loadCart(userId: string): Promise<CartLine[]> {
  const supabase = createClient();
  const { data: cart } = await supabase.from("carts").select("id").eq("site_key", SITE_KEY).eq("user_id", userId).eq("status", "active").maybeSingle();
  if (!cart) return [];
  const { data: rows } = await supabase.from("cart_items").select("product_id,quantity,unit_price_nzd,products!inner(slug,title,images)").eq("site_key", SITE_KEY).eq("cart_id", cart.id);
  return (rows || []).map((row) => {
    const product = Array.isArray(row.products) ? row.products[0] : row.products;
    const images = (product?.images || []) as { path?: string }[];
    return { productId: row.product_id, slug: product?.slug || "", title: product?.title || "CVT bearing", price: Number(row.unit_price_nzd), image: images[0]?.path ? `/products/${images[0].path}` : "", quantity: row.quantity };
  });
}

function mergeCarts(saved: CartLine[], local: CartLine[]) {
  const merged = saved.map((line) => ({ ...line }));
  for (const line of local) {
    const existing = merged.find((item) => item.productId === line.productId);
    if (existing) existing.quantity = Math.max(existing.quantity, line.quantity);
    else merged.push(line);
  }
  return merged;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      let local: CartLine[] = [];
      try { local = JSON.parse(localStorage.getItem("cvt-bearings-cart") || "[]"); } catch {}
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const restored = user ? await loadCart(user.id) : [];
      const merged = mergeCarts(restored, local);
      if (cancelled) return;
      setLines(merged);
      localStorage.setItem("cvt-bearings-cart", JSON.stringify(merged));
      setHydrated(true);
      if (user && merged.length) await saveCart(merged, user.id);
    }
    void hydrate();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    async function authenticated(event: Event) {
      const userId = (event as CustomEvent<{ userId?: string }>).detail?.userId;
      if (!userId) return;
      const restored = await loadCart(userId);
      setLines((current) => {
        const merged = mergeCarts(restored, current);
        localStorage.setItem("cvt-bearings-cart", JSON.stringify(merged));
        void saveCart(merged, userId);
        return merged;
      });
    }
    window.addEventListener("cvt-authenticated", authenticated);
    return () => window.removeEventListener("cvt-authenticated", authenticated);
  }, []);

  const sync = useCallback(async (next: CartLine[]) => {
    if (!hydrated) return;
    localStorage.setItem("cvt-bearings-cart", JSON.stringify(next));
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await saveCart(next, user.id);
  }, [hydrated]);

  const commit = useCallback((change: (current: CartLine[]) => CartLine[]) => {
    setLines((current) => { const next = change(current); void sync(next); return next; });
  }, [sync]);

  const value = useMemo<CartValue>(() => ({
    lines,
    count: lines.reduce((sum, line) => sum + line.quantity, 0),
    total: lines.reduce((sum, line) => sum + line.quantity * line.price, 0),
    add(line, quantity = 1) { commit((current) => current.some((item) => item.productId === line.productId) ? current.map((item) => item.productId === line.productId ? { ...item, quantity: item.quantity + quantity } : item) : [...current, { ...line, quantity }]); setOpen(true); },
    update(id, quantity) { commit((current) => current.map((line) => line.productId === id ? { ...line, quantity: Math.max(1, quantity) } : line)); },
    remove(id) { commit((current) => current.filter((line) => line.productId !== id)); },
    open, setOpen,
  }), [lines, open, commit]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
