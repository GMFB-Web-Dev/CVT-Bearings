"use client";

import Image from "next/image";
import Link from "next/link";
import { CreditCard, ShieldCheck } from "lucide-react";
import { useId, useState } from "react";

type ProductTab = "details" | "payments";

export function ProductDetailTabs({
  description,
  fitment,
  contactHref,
}: {
  description: string;
  fitment: string[];
  contactHref: string;
}) {
  const [activeTab, setActiveTab] = useState<ProductTab>("details");
  const id = useId();

  return (
    <div className="product-detail-tabs">
      <div role="tablist" aria-label="Product information">
        <button
          id={`${id}-details-tab`}
          type="button"
          role="tab"
          aria-selected={activeTab === "details"}
          aria-controls={`${id}-details-panel`}
          onClick={() => setActiveTab("details")}
        >
          Product details
        </button>
        <button
          id={`${id}-payments-tab`}
          type="button"
          role="tab"
          aria-selected={activeTab === "payments"}
          aria-controls={`${id}-payments-panel`}
          onClick={() => setActiveTab("payments")}
        >
          Payment options
        </button>
      </div>

      {activeTab === "details" ? (
        <section
          id={`${id}-details-panel`}
          role="tabpanel"
          aria-labelledby={`${id}-details-tab`}
          className="product-tab-panel"
        >
          <p>{description}</p>
          {fitment.length > 0 && <p><strong>Fitment:</strong> {fitment.join(" · ")}</p>}
          <Link href={contactHref}>Confirm compatibility with our CVT team →</Link>
        </section>
      ) : (
        <section
          id={`${id}-payments-panel`}
          role="tabpanel"
          aria-labelledby={`${id}-payments-tab`}
          className="product-tab-panel payment-options-panel"
        >
          <div><CreditCard aria-hidden="true"/><span><strong>Flexible payment options</strong><small>Stripe shows the payment methods available for your device and location at checkout.</small></span></div>
          <Image src="/assets/payment-logos.png" width={520} height={53} alt="Common payment methods; final availability is shown in Stripe Checkout"/>
          <div><ShieldCheck aria-hidden="true"/><span><strong>Secure Stripe Checkout</strong><small>Prices include GST. Delivery and the final order total are shown before payment.</small></span></div>
          <Link href="/orders-and-payments">Read orders and payment information →</Link>
        </section>
      )}
    </div>
  );
}
