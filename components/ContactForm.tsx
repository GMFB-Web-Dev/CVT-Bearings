"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SITE_KEY } from "@/lib/catalog";

export function ContactForm({ productId = "" }: { productId?: string }) {
  const [message, setMessage] = useState("");
  async function submit(formData: FormData) {
    setMessage("Sending…");
    const supabase = createClient();
    const { error } = await supabase.from("enquiries").insert({ site_key: SITE_KEY, product_id: productId || null, first_name: String(formData.get("first_name")), last_name: String(formData.get("last_name")), email: String(formData.get("email")), phone: String(formData.get("phone") || ""), service: String(formData.get("service")), message: String(formData.get("message")) });
    setMessage(error ? "We couldn't send that yet. Please call 0800 288 695." : "Thanks — your enquiry has been received.");
  }
  return <form className="form-grid" action={submit}><div className="field"><label>First name</label><input name="first_name" required placeholder="First Name"/></div><div className="field"><label>Last name</label><input name="last_name" required placeholder="Last Name"/></div><div className="field"><label>Email</label><input name="email" type="email" required placeholder="Email"/></div><div className="field"><label>Phone</label><input name="phone" placeholder="+64 213 345 6789"/></div><div className="field full"><label>Select a service</label><select name="service" defaultValue={productId ? "Product enquiry" : "General enquiry"}><option>General enquiry</option><option>Product enquiry</option><option>Bulk order</option><option>Shipping & returns</option><option>Order & payment</option></select></div><div className="field full"><label>Message</label><textarea name="message" required placeholder={productId ? `Please quote product ${productId}` : "Type your message here…"}/></div><label className="field full"><span><input type="checkbox" required/> I agree to the terms and conditions</span></label><div className="field full"><button className="button">Submit</button>{message && <p className={message.startsWith("Thanks") ? "notice" : "error"}>{message}</p>}</div></form>;
}
