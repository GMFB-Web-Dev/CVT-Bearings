import { RichText } from "@payloadcms/richtext-lexical/react";
import Image from "next/image";
import Link from "next/link";
import { ChevronUp } from "lucide-react";
import { AutoCarousel } from "@/components/AutoCarousel";
import type { BlogListingItem, BlogPost } from "@/lib/blog-posts";

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

function Body({ value, headingPrefix }: { value?: RichBody; headingPrefix?: string }) {
  if (!value) return null;
  let headingIndex = 0;
  return <RichText data={value} converters={({ defaultConverters }) => ({
    ...defaultConverters,
    heading: ({ node, nodesToJSX }) => {
      const HeadingTag = node.tag as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      const id = headingPrefix ? `${headingPrefix}-${++headingIndex}` : undefined;
      return <HeadingTag id={id}>{nodesToJSX({ nodes: node.children })}</HeadingTag>;
    },
  })}/>;
}

function PublishedDate({ value }: { value?: string | null }) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return (
    <time dateTime={value}>
      {new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "Pacific/Auckland" }).format(date)}
    </time>
  );
}

function lexicalText(value: unknown) {
  const text: string[] = [];
  const visit = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    if ("text" in node && typeof node.text === "string") text.push(node.text);
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === "object") visit(value);
    }
  };
  visit(value);
  return text.join(" ");
}

type TableOfContentsItem = { id: string; title: string };

function richTextTableOfContents(value?: RichBody, prefix = "section") {
  const items: TableOfContentsItem[] = [];
  const visit = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    if ("type" in node && node.type === "heading") {
      const title = lexicalText(node).replace(/\s+/g, " ").trim();
      if (title) items.push({ id: `${prefix}-${items.length + 1}`, title });
    }
    for (const child of Object.values(node)) {
      if (Array.isArray(child)) child.forEach(visit);
      else if (child && typeof child === "object") visit(child);
    }
  };
  visit(value);
  return items;
}

function readingTime(post: BlogPost) {
  const copy = [post.excerpt, post.tools, lexicalText(post.body), ...(post.steps || []).map((step) => `${step.title} ${lexicalText(step.body)}`)]
    .filter(Boolean)
    .join(" ");
  return Math.max(1, Math.ceil(copy.trim().split(/\s+/).length / 200));
}

export function BlogPostTemplate({ post, related = [] }: { post: BlogPost; related?: BlogListingItem[] }) {
  const hero = resolvedImage(post.featuredImage);
  const guideSteps = post.template === "guide" ? post.steps || [] : [];
  const bodySections = richTextTableOfContents(post.body);
  const guideSections = guideSteps.map((step, index) => ({ id: `step-${index + 1}`, title: step.title }));
  const caseStudySections: TableOfContentsItem[] = post.template === "case-study"
    ? (["challenge", "solution", "results"] as const)
        .filter((key) => post.caseStudy?.[key])
        .map((key) => ({ id: `case-${key}`, title: { challenge: "The challenge", solution: "The solution", results: "The results" }[key] }))
    : [];
  const tableOfContents = [...bodySections, ...guideSections, ...caseStudySections];
  return (
    <article className={`cvt-blog cvt-blog--${post.template}`} id="blog-top">
      <nav className="cvt-blog__breadcrumb" aria-label="Breadcrumb"><Link href="/home">Home</Link><span>/</span><Link href="/blogs">All Blogs</Link><span>/</span><span aria-current="page">{post.title}</span></nav>
      {hero && <div className="cvt-blog__hero"><Picture image={hero} alt={post.featuredImageAlt} priority/></div>}
      <div className={`cvt-blog__content-frame${hero ? " has-hero" : ""}${tableOfContents.length ? " has-sidebar" : ""}`}>
        {!!tableOfContents.length && <aside className="cvt-blog__sidebar"><div><h2>Table of contents</h2><ol>{tableOfContents.map((item) => <li key={item.id}><a href={`#${item.id}`}>{item.title}</a></li>)}</ol></div></aside>}
        <div className="cvt-blog__article-card">
          <header className="cvt-blog__header">
            {post.category && <p className="cvt-blog__category">{post.category}</p>}
            <h1>{post.title}</h1>
            <div className="cvt-blog__meta"><PublishedDate value={post.publishedAt}/><span aria-hidden="true">•</span><span>{readingTime(post)} min read</span></div>
          </header>
          <div className="cvt-blog__layout">
            <div className="cvt-blog__body">
              <Body value={post.body} headingPrefix="section"/>
              {guideSteps.map((step, index) => (
                <section id={`step-${index + 1}`} key={step.id || index} className="cvt-blog__step">
                  <h2>{step.title}</h2>
                  <Body value={step.body}/>
                  <Picture image={step.image} alt={step.imageAlt}/>
                </section>
              ))}
              {post.template === "case-study" && (
                <>
                  {post.caseStudy?.vehicle && <p className="cvt-blog__vehicle"><strong>Vehicle / transmission:</strong> {post.caseStudy.vehicle}</p>}
                  {(["challenge", "solution", "results"] as const).map((key) => post.caseStudy?.[key] && (
                    <section id={`case-${key}`} className={`cvt-blog__case cvt-blog__case--${key}`} key={key}>
                      <h2>{{ challenge: "The challenge", solution: "The solution", results: "The results" }[key]}</h2>
                      <Body value={post.caseStudy[key]}/>
                    </section>
                  ))}
                </>
              )}
            </div>
          </div>
          {!!related.length && <section className="cvt-blog__related">
            <div className="cvt-blog__related-heading"><h2>View other <em>blogs</em></h2></div>
            <AutoCarousel className="cvt-blog__related-carousel" label="Related blogs" desktopVisible={3} tabletVisible={2} interval={6500}>{related.map((blog) => <Link className="cvt-blog__related-card" href={`/blogs/${blog.slug}`} key={blog.slug}><span>{blog.image && <Image src={blog.image} fill sizes="(max-width: 760px) 80vw, 28vw" alt={blog.imageAlt || blog.title}/>}</span><small>{blog.tag}</small><h3>{blog.title}</h3></Link>)}</AutoCarousel>
            <Link className="button cvt-blog__view-more" href="/blogs">View more</Link>
          </section>}
        </div>
      </div>
      <a className="cvt-blog__back-to-top" href="#" aria-label="Back to the top of this page"><span><ChevronUp aria-hidden="true"/></span><small>Top</small></a>
    </article>
  );
}
