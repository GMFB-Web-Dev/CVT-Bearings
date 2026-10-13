import "server-only";

import { createClient } from "@supabase/supabase-js";

type CheckoutOrderItem = {
  product_id: string;
  product_title: string;
  sku: string | null;
  quantity: number;
  unit_price_nzd: number;
};

type CompletedOrder = {
  orderId: string;
  subtotalNzd: number;
  shippingNzd: number;
  taxNzd: number;
  totalNzd: number;
  shippingAddress: unknown;
  customerEmail: string | null;
  paymentIntentId: string | null;
};

function storefrontRpcClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) throw new Error("Supabase public server configuration is incomplete.");

  return createClient(url, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function serverCredential() {
  const secret = process.env.REVALIDATION_SECRET?.trim();
  if (!secret) throw new Error("The storefront server credential is not configured.");
  return secret;
}

function rpcError(operation: string, error: { message?: string; code?: string }) {
  return new Error(`${operation} failed${error.code ? ` (${error.code})` : ""}: ${error.message || "Unknown database error"}`);
}

export async function createStorefrontCheckoutOrder(userId: string, items: CheckoutOrderItem[]) {
  const { data, error } = await storefrontRpcClient().rpc("create_storefront_checkout_order", {
    p_server_secret: serverCredential(),
    p_user_id: userId,
    p_items: items,
  });
  if (error) throw rpcError("Creating the checkout order", error);
  if (typeof data !== "string" || !data) throw new Error("Creating the checkout order returned no order ID.");
  return data;
}

export async function attachStorefrontCheckoutSession(orderId: string, sessionId: string) {
  const { data, error } = await storefrontRpcClient().rpc("attach_storefront_checkout_session", {
    p_server_secret: serverCredential(),
    p_order_id: orderId,
    p_session_id: sessionId,
  });
  if (error) throw rpcError("Attaching the Checkout Session", error);
  return data === true;
}

export async function completeStorefrontCheckoutOrder(order: CompletedOrder) {
  const { data, error } = await storefrontRpcClient().rpc("complete_storefront_checkout_order", {
    p_server_secret: serverCredential(),
    p_order_id: order.orderId,
    p_subtotal_nzd: order.subtotalNzd,
    p_shipping_nzd: order.shippingNzd,
    p_tax_nzd: order.taxNzd,
    p_total_nzd: order.totalNzd,
    p_shipping_address: order.shippingAddress,
    p_customer_email: order.customerEmail,
    p_payment_intent_id: order.paymentIntentId,
  });
  if (error) throw rpcError("Completing the checkout order", error);
  return data === true;
}

export async function cancelStorefrontCheckoutOrder(orderId: string) {
  const { data, error } = await storefrontRpcClient().rpc("cancel_storefront_checkout_order", {
    p_server_secret: serverCredential(),
    p_order_id: orderId,
  });
  if (error) throw rpcError("Cancelling the checkout order", error);
  return data === true;
}
