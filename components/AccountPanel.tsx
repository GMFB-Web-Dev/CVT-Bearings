"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, LayoutDashboard, LogOut, Package, ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { money, SITE_KEY } from "@/lib/catalog";

type Order = { id: string; status: string; total_nzd: number; created_at: string };

export function AccountPanel() {
  const [identity, setIdentity] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.replace("/login-sign-up?next=%2Faccount%23wishlist"); return; }
      setIdentity(data.user.email || "");
      const result = await supabase.from("orders").select("id,status,total_nzd,created_at").eq("site_key", SITE_KEY).order("created_at", { ascending: false });
      setOrders((result.data as Order[]) || []);
    });
  }, [router]);

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return <div className="account-dashboard">
    <header className="account-hero"><span>Customer account</span><h1>My account</h1><p>Signed in as <b>{identity}</b></p></header>
    <div className="account-grid">
      <nav className="account-nav" aria-label="Account navigation">
        <span className="account-nav-title">Account menu</span>
        <Link className="active" href="/account"><LayoutDashboard/> Dashboard</Link>
        <Link href="#orders"><Package/> Orders</Link>
        <Link href="/cart"><ShoppingBag/> Saved cart</Link>
        <Link href="#wishlist"><Heart/> Wishlist</Link>
        <button className="account-sign-out" onClick={signOut}><LogOut/> Sign out</button>
      </nav>
      <div className="account-content">
        <section className="account-summary-grid"><article><small>Orders</small><strong>{orders.length}</strong><span>Orders connected to this account</span></article><article><small>Quick link</small><strong>Shop bearings</strong><Link href="/bearings">Browse the catalogue →</Link></article></section>
        <section id="orders" className="account-orders"><header><h2>Order history</h2><p>Review the latest orders placed with this account.</p></header>{orders.length ? <div className="account-order-list">{orders.map((order) => <article key={order.id}><span><b>Order #{order.id.slice(0, 8)}</b><small>{new Date(order.created_at).toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" })}</small></span><em>{order.status}</em><strong>{money(order.total_nzd)}</strong></article>)}</div> : <div className="account-empty"><Package/><h3>No orders yet</h3><p>Paid and processing orders will appear here.</p><Link className="button" href="/bearings">Shop bearings</Link></div>}</section>
        <section id="wishlist" className="account-wishlist"><Heart/><div><h2>Your wishlist</h2><p>Use the heart on a product page to save bearings in this browser.</p></div><Link href="/bearings">Find bearings →</Link></section>
      </div>
    </div>
  </div>;
}
