"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Heart, Menu, Search, ShoppingCart, UserRound, X } from "lucide-react";
import { Suspense, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/CartProvider";

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

const offerItems = [
  "First Order",
  "Get 10% Off Your First Order",
  "Get 10% Off Your First Order",
  "Get 10% Off Your First Order",
  "Get 10% Off Your First Order",
];

export function Header() {
  const [menu, setMenu] = useState(false);
  const { count, setOpen } = useCart();
  return <>
    <div className="offer-bar" aria-label="First order discount">
      <div className="offer-track">
        {[0, 1].map((group) => <div className="offer-group" key={group} aria-hidden={group === 1}>{offerItems.map((item, index) => <span className={index === 0 ? "offer-label" : "offer-item"} key={`${group}-${index}`}>{item}</span>)}</div>)}
      </div>
    </div>
    <div className="network-bar">
      <div className="network-links"><a href="https://cvtnz.co.nz">CVT<span>NZ</span></a><Link className="active" href="/">CVT<small>Bearings</small></Link><a href="https://cvt-parts.co.nz">CVT<small>Parts</small></a></div>
      <div className="utility-links"><ActiveLink href="/about">About</ActiveLink><ActiveLink href="/contact">Contact</ActiveLink><ActiveLink href="/login-sign-up" match={["/login", "/account"]}>Sign in / Sign up</ActiveLink><Link href="/account#wishlist" className="utility-icon" aria-label="Wishlist"><Heart size={17}/></Link><button onClick={() => setOpen(true)} aria-label="Open cart"><ShoppingCart size={18}/>{count > 0 && <b>{count}</b>}</button></div>
    </div>
    <header className="main-header">
      <Link href="/" className="brand"><Image src="/assets/logo.png" width={235} height={64} alt="CVT Bearings" priority unoptimized /></Link>
      <nav className={menu ? "nav open" : "nav"} aria-label="Primary navigation">
        <ActiveLink href="/" exact onClick={() => setMenu(false)}>Home</ActiveLink>
        <div className="nav-dropdown"><ActiveLink href="/bearings" match={["/products"]} onClick={() => setMenu(false)}>Shop bearings <ChevronDown size={15}/></ActiveLink><div><ActiveLink href="/bearings/main-bearing-kits" onClick={() => setMenu(false)}>Main bearing kits</ActiveLink><ActiveLink href="/bearings/pulley-bearings" onClick={() => setMenu(false)}>Pulley bearings</ActiveLink><ActiveLink href="/bearings/primary-pulley-bearings" onClick={() => setMenu(false)}>Primary pulley bearings</ActiveLink></div></div>
        <ActiveLink href="/help" match={["/shipping-returns", "/orders-payments"]} onClick={() => setMenu(false)}>General information</ActiveLink>
      </nav>
      <form className="header-search" action="/bearings"><input name="q" placeholder="Search Part"/><button aria-label="Search"><Search size={16}/></button></form>
      <Link href="/login-sign-up" className="mobile-account" aria-label="Account"><UserRound/></Link>
      <button className="menu-button" onClick={() => setMenu(!menu)} aria-label="Menu">{menu ? <X/> : <Menu/>}</button>
    </header>
  </>;
}
