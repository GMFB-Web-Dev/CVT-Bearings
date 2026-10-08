import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return <footer className="footer"><div className="footer-grid page-width">
    <div className="footer-brand"><Image src="/assets/logo.png" width={235} height={64} alt="CVT Bearings" unoptimized/><p><b>Auckland:</b><br/>State Highway 5, Tirau 3485</p><p><b>Phone:</b><br/><a href="tel:0800288695">0800 288 695</a></p></div>
    <div><h4>Customer Care</h4><Link href="/shipping-returns">Shipping & Returns</Link><Link href="/login-sign-up">Sign in</Link><Link href="/login-sign-up?mode=signup">Sign up</Link><Link href="/account">Wishlist</Link><Link href="/cart">Cart</Link></div>
    <div><h4>Pages</h4><Link href="/">Home</Link><Link href="/about">About us</Link><Link href="/bearings">Bearings</Link><Link href="/blogs">Blogs</Link><Link href="/contact">Contact us</Link></div>
    <div><h4>Company</h4><a href="https://cvtnz.co.nz">CVT NZ</a><a href="https://cvt-parts.co.nz">CVT Parts</a><Link href="/">CVT Bearings</Link></div>
    <div className="newsletter"><h4>Join Our Newsletter</h4><form><input type="email" placeholder="Enter your email"/><button>Subscribe</button></form></div>
  </div><div className="footer-bottom page-width"><Image className="payment-logos" src="/assets/payment-logos.png" width={694} height={71} alt="Accepted payment methods: Amazon Pay, American Express, Apple Pay, Discover, Mastercard, PayPal, Visa, Afterpay and Google Pay"/><div><small>© 2026 Developed by GMFB Ltd. All rights reserved.</small><nav><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms of Service</Link><Link href="/cookies">Cookies Settings</Link></nav></div></div></footer>;
}
