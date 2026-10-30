import "server-only";

import { createElement } from "react";
import { render } from "react-email";
import { Resend } from "resend";
import {
  OrderConfirmationEmail,
  type OrderConfirmationEmailProps,
} from "@/emails/OrderConfirmationEmail";

export async function sendOrderConfirmationEmail(orderId: string, customerEmail: string, props: OrderConfirmationEmailProps) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  const replyTo = process.env.BUSINESS_ENQUIRY_EMAIL?.trim();

  if (!apiKey || !from) throw new Error("Order confirmation email delivery is not configured.");

  const component = createElement(OrderConfirmationEmail, props);
  const [html, text] = await Promise.all([
    render(component),
    render(component, { plainText: true }),
  ]);

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: [customerEmail],
    ...(replyTo ? { replyTo } : {}),
    subject: `Your CVT Bearings order #${props.orderNumber} is confirmed`,
    html,
    text,
  }, { idempotencyKey: `cvt-order-confirmed-${orderId}` });

  if (error) throw new Error(`Resend order confirmation failed: ${error.name}: ${error.message}`);
}
