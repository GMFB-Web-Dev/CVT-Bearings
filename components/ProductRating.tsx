"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SITE_KEY } from "@/lib/catalog";

type RatingSummary = {
  average: number;
  count: number;
};

export function ProductRating({ productId }: { productId: string }) {
  const [summary, setSummary] = useState<RatingSummary | null>(null);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    void supabase
      .from("reviews")
      .select("rating")
      .eq("site_key", SITE_KEY)
      .eq("product_id", productId)
      .then(({ data }) => {
        if (!active || !data?.length) return;
        const total = data.reduce((sum, review) => sum + Number(review.rating), 0);
        setSummary({ average: total / data.length, count: data.length });
      });

    return () => {
      active = false;
    };
  }, [productId]);

  if (!summary) return null;

  const rounded = Math.round(summary.average);
  return (
    <div className="product-rating" aria-label={`${summary.average.toFixed(1)} out of 5 from ${summary.count} reviews`}>
      <span aria-hidden="true">{"★".repeat(rounded)}{"☆".repeat(5 - rounded)}</span>
      <small>{summary.average.toFixed(1)} ({summary.count})</small>
    </div>
  );
}
