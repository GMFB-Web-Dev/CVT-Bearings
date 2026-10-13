"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/components/CartProvider";

export function CheckoutCartCleanup({ paid }: { paid: boolean }) {
  const { clear, hydrated } = useCart();
  const cleared = useRef(false);

  useEffect(() => {
    if (!paid || !hydrated || cleared.current) return;
    cleared.current = true;
    clear();
  }, [clear, hydrated, paid]);

  return null;
}
