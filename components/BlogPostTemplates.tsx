import { RichText } from "@payloadcms/richtext-lexical/react";
import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/lib/blog-posts";

type BlogImage = Exclude<BlogPost["featuredImage"], number | null | undefined>;
type RichBody = BlogPost["body"];

function resolvedImage(image?: BlogImage | number | null) {
  return image && typeof image === "object" && image.url ? image : null;
}

function Picture({ image, alt, priority = false }: { image?: BlogImage | number | null; alt?: string | null; priority?: boolean }) {
  const source = resolvedImage(image);
  if (!source?.url) return null;
  return (
    <Image
      src={source.url}
      alt={alt || source.alt || ""}
      width={source.width || 1400}
      height={source.height || 800}
      sizes="(max-width: 760px) 100vw, 1120px"
      priority={priority}
    />
  );
}

function Body({ value }: { value?: RichBody }) {
  return value ? <RichText data={value} /> : null;
}

function PublishedDate({ value }: { value?: string | null }) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return (
    <time dateTime={value}>
      {new Intl.DateTimeFormat("en-NZ", { dateStyle: "long", timeZone: "Pacific/Auckland" }).format(date)}
    </time>
  );
}

function CallToAction({ post }: { post: BlogPost }) {
  const href = post.cta?.href;
  const safeHref = href && (/^\/(?!\/)/.test(href) || /^https:\/\//.test(href)) ? href : null;
  if (!safeHref || !post.cta?.label) return null;
  return (
    <aside className="cvt-blog__cta">
      {post.cta.heading && <h2>{post.cta.heading}</h2>}
      {safeHref.startsWith("/")
        ? <Link href={safeHref}>{post.cta.label} →</Link>
        : <a href={safeHref} rel="noreferrer">{post.cta.label} →</a>}
    </aside>
  );
}

export function BlogPostTemplate({ post }: { post: BlogPost }) {
  const hero = resolvedImage(post.featuredImage);
  return (
    <article className={`cvt-blog cvt-blog--${post.template}`}>
      <header className="cvt-blog__header">
        <Link href="/blogs">← All articles</Link>
        {post.category && <p className="cvt-blog__category">{post.category}</p>}
        <h1>{post.title}</h1>
        {post.excerpt && <p className="cvt-blog__excerpt">{post.excerpt}</p>}
        {(post.author || post.publishedAt) && (
          <p className="cvt-blog__meta">
            {post.author}
            {post.author && post.publishedAt ? " · " : ""}
            <PublishedDate value={post.publishedAt}/>
          </p>
        )}
      </header>

      {hero && <div className="cvt-blog__hero"><Picture image={hero} alt={post.featuredImageAlt} priority/></div>}

      <div className="cvt-blog__layout">
        {post.template === "guide" && (
          <aside className="cvt-blog__sidebar">
            {post.tools && <><h2>Tools and parts</h2><p className="cvt-blog__tools">{post.tools}</p></>}
            {!!post.steps?.length && (
              <nav aria-label="Guide steps">
                <h2>In this guide</h2>
                <ol>{post.steps.map((step, index) => <li key={step.id || index}><a href={`#step-${index + 1}`}>{step.title}</a></li>)}</ol>
              </nav>
            )}
          </aside>
        )}

        <div className="cvt-blog__body">
          <Body value={post.body}/>
          {post.template === "guide" && post.steps?.map((step, index) => (
            <section id={`step-${index + 1}`} key={step.id || index} className="cvt-blog__step">
              <h2><span>{index + 1}.</span> {step.title}</h2>
              <Body value={step.body}/>
              <Picture image={step.image} alt={step.imageAlt}/>
            </section>
          ))}
          {post.template === "case-study" && (
            <>
              {post.caseStudy?.vehicle && <p className="cvt-blog__vehicle"><strong>Vehicle / transmission:</strong> {post.caseStudy.vehicle}</p>}
              {(["challenge", "solution", "results"] as const).map((key) => post.caseStudy?.[key] && (
                <section className={`cvt-blog__case cvt-blog__case--${key}`} key={key}>
                  <h2>{{ challenge: "The challenge", solution: "The solution", results: "The results" }[key]}</h2>
                  <Body value={post.caseStudy[key]}/>
                </section>
              ))}
            </>
          )}
        </div>
      </div>

      <CallToAction post={post}/>
    </article>
  );
}
