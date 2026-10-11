export type EnquiryRequest = {
  kind: "contact" | "quote" | "newsletter";
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  service?: string;
  message?: string;
  productId?: string;
  productTitle?: string;
  productSku?: string;
  company?: string;
  quantity?: string;
  vehicle?: string;
  transmissionCode?: string;
  bearingDetails?: string;
  website?: string;
};

export async function submitEnquiry(payload: EnquiryRequest) {
  const response = await fetch("/api/enquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, requestId: crypto.randomUUID() }),
  });
  const data = await response.json() as { ok?: boolean; error?: string };
  if (!response.ok || !data.ok) throw new Error(data.error || "We couldn't send that yet. Please call 0800 288 695.");
}
