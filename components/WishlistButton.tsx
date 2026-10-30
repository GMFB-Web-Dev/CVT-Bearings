"use client";

import { Heart } from "lucide-react";
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "cvt-bearings-wishlist";

function readWishlist() {
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function WishlistButton({ productId }: { productId: string }) {
  const selected = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("storage", onChange);
      window.addEventListener("cvt-wishlist-change", onChange);
      return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener("cvt-wishlist-change", onChange);
      };
    },
    () => readWishlist().includes(productId),
    () => false,
  );

  function toggle() {
    const current = readWishlist();
    const next = current.includes(productId)
      ? current.filter((item) => item !== productId)
      : [...current, productId];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("cvt-wishlist-change", { detail: { productId, selected: next.includes(productId) } }));
  }

  return <button className={`wishlist-button${selected ? " selected" : ""}`} type="button" onClick={toggle} aria-pressed={selected} aria-label={selected ? "Remove from wishlist" : "Add to wishlist"}><Heart aria-hidden="true"/><span>{selected ? "Saved" : "Wishlist"}</span></button>;
}
