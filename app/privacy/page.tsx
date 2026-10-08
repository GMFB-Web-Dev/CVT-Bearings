import { LegalPage } from "@/components/LegalPage";

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy">
    <h2>How we handle your information</h2>
    <p>CVT Bearings collects the details needed to answer enquiries, manage accounts, maintain carts, process orders, and publish verified product reviews. We only use this information for the purpose it was supplied for and for normal business administration.</p>
    <h2>Storage and access</h2>
    <p>Account, cart, order, enquiry, and review data is stored in our secured storefront database. Signed-in customers can access only their own private shopping and order information. Approved reviews may be displayed publicly.</p>
    <h2>Your choices</h2>
    <p>You may ask us to correct or remove personal information by emailing <a href="mailto:info@cvt.co.nz">info@cvt.co.nz</a>. We may retain records where required for legal, fraud-prevention, or accounting purposes.</p>
  </LegalPage>;
}
