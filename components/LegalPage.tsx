import Link from "next/link";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return <>
    <section className="inner-hero compact-hero"><div className="hero-overlay"/><div className="hero-content"><h1>{title}</h1><p>CVT Bearings NZ</p></div></section>
    <article className="legal-page page-width">
      <Link href="/">Home</Link><span> / {title}</span>
      {children}
    </article>
  </>;
}
