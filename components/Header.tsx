"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Heart, Menu, ShoppingCart, UserRound, X } from "lucide-react";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { SmartSearch } from "@/components/SmartSearch";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useCms } from "@/components/CmsProvider";

type ActiveLinkProps = {
  href: string;
  children: ReactNode;
  exact?: boolean;
  match?: string[];
  className?: string;
  onClick?: () => void;
};

function PathAwareLink({ href, children, exact = false, match = [], className, onClick }: ActiveLinkProps) {
  const pathname = usePathname();
  const paths = [href, ...match];
  const active = paths.some((path) => exact ? pathname === path : pathname === path || pathname.startsWith(`${path}/`));

  return <Link href={href} className={[className, active ? "active" : ""].filter(Boolean).join(" ")} aria-current={active ? "page" : undefined} onClick={onClick}>{children}</Link>;
}

function ActiveLink(props: ActiveLinkProps) {
  const { href, children, className, onClick } = props;
  return <Suspense fallback={<Link href={href} className={className} onClick={onClick}>{children}</Link>}><PathAwareLink {...props}/></Suspense>;
}

function getFirstName(user: User | null) {
  if (!user) return "";

  const metadata = user.user_metadata;
  const suppliedName = [metadata.first_name, metadata.given_name, metadata.full_name, metadata.name]
    .find((value): value is string => typeof value === "string" && value.trim().length > 0);

  return suppliedName?.trim().split(/\s+/)[0] || user.email?.split("@")[0] || "Account";
}

export function Header() {
  const { copy, asset, navigation } = useCms();
  const c = (key: string, fallback: string) => copy("components/Header.tsx", key, fallback);
  const nav = (url: string, fallback: string) => navigation?.headerLinks?.find((item) => item.url === url)?.label || fallback;
  const offerItems = Array(5).fill(c("copy-001", "Get 10% Off Your First Order"));
  const [menu, setMenu] = useState(false);
  const [offerVisible, setOfferVisible] = useState(true);
  const [firstName, setFirstName] = useState("");
  const { count, setOpen } = useCart();

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    void supabase.auth.getUser().then(({ data }) => {
      if (active) setFirstName(getFirstName(data.user));
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setFirstName(getFirstName(session?.user ?? null));
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  return <>
    <div className={`offer-bar${offerVisible ? "" : " dismissed"}`} aria-label={c("copy-002", "First order discount")} aria-hidden={!offerVisible}>
      <div className="offer-track">
        {[0, 1].map((group) => <div className="offer-group" key={group} aria-hidden={group === 1}>{offerItems.map((item, index) => <Link className="offer-item" href="/login-sign-up?mode=signup" key={`${group}-${index}`}>{item}</Link>)}</div>)}
      </div>
      <button className="offer-dismiss" type="button" onClick={() => setOfferVisible(false)} aria-label={c("copy-003", "Close first order discount")}><X size={18}/></button>
    </div>
    <div className="sticky-navigation">
      <div className="network-bar">
        <div className="network-links"><a href={c("copy-004", "https://cvtnz.co.nz")}>{c("copy-005", "CVT")}<span>{c("copy-006", "NZ")}</span></a><Link className="active" href={c("copy-007", "/home")}>{c("copy-008", "CVT")}<small>{c("copy-009", "Bearings")}</small></Link><a href={c("copy-010", "https://cvt-parts.co.nz")}>{c("copy-011", "CVT")}<small>{c("copy-012", "Parts")}</small></a></div>
        <div className="utility-links"><ActiveLink href="/about-us">{nav("/about", c("copy-014", "About"))}</ActiveLink><ActiveLink href="/contact">{nav("/contact", c("copy-016", "Contact"))}</ActiveLink><ActiveLink href={firstName ? "/account" : "/login-sign-up"} match={["/login", "/account"]}>{firstName ? c("copy-017", "Hi, ${firstName}").replace("${firstName}", firstName) : c("copy-018", "Sign in / Sign up")}</ActiveLink><Link href={c("copy-019", "/account#wishlist")} className="utility-icon" aria-label={c("copy-020", "Wishlist")}><Heart size={17}/></Link><button onClick={() => setOpen(true)} aria-label={c("copy-021", "Open cart")}><ShoppingCart size={18}/>{count > 0 && <b>{count}</b>}</button></div>
      </div>
      <header className="main-header">
        <Link href="/home" className="brand"><Image src={asset("assets/logo.png", "/assets/logo.png")} width={235} height={64} alt={c("copy-023", "CVT Bearings")} priority unoptimized /></Link>
        <nav className={menu ? "nav open" : "nav"} aria-label={c("copy-024", "Primary navigation")}>
          <ActiveLink href="/home" exact onClick={() => setMenu(false)}>{c("copy-026", "Home")}</ActiveLink>
          <div className="nav-dropdown"><ActiveLink href="/bearings" match={["/products"]} onClick={() => setMenu(false)}>{nav("/bearings", c("copy-028", "Shop bearings"))} <ChevronDown size={15}/></ActiveLink><div><ActiveLink href="/bearings/main-bearing-kits" onClick={() => setMenu(false)}>{nav("/bearings/main-bearing-kits", c("copy-030", "Main bearing kits"))}</ActiveLink><ActiveLink href="/bearings/pulley-bearings" onClick={() => setMenu(false)}>{nav("/bearings/pulley-bearings", c("copy-032", "Pulley bearings"))}</ActiveLink><ActiveLink href="/bearings/primary-pulley-bearings" onClick={() => setMenu(false)}>{nav("/bearings/primary-pulley-bearings", c("copy-034", "Primary pulley bearings"))}</ActiveLink></div></div>
          <ActiveLink href="/general-info" match={["/shipping-and-returns", "/orders-and-payments"]} onClick={() => setMenu(false)}>{nav("/help", c("copy-036", "General information"))}</ActiveLink>
          <ActiveLink href="/blogs" onClick={() => setMenu(false)}>{nav("/blogs", c("copy-039", "Blogs"))}</ActiveLink>
        </nav>
        <SmartSearch/>
        <Link href={firstName ? "/account" : "/login-sign-up"} className="mobile-account" aria-label={firstName ? `${firstName}'s account` : "Sign in or create an account"}><UserRound/></Link>
        <button className="menu-button" onClick={() => setMenu(!menu)} aria-label={c("copy-038", "Menu")}>{menu ? <X/> : <Menu/>}</button>
      </header>
    </div>
  </>;
}
