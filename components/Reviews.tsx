"use client";

import Link from "next/link";
import { Star, Upload, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SITE_KEY } from "@/lib/catalog";

type ReviewMedia = { key: string; url: string | null; name: string; type: string };
type Review = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  display_name: string;
  created_at: string;
  verified_purchase: boolean;
  media: ReviewMedia[] | null;
};

const PAGE_SIZE = 3;

async function fetchReviews(productId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("reviews")
    .select("id,rating,title,body,display_name,created_at,verified_purchase,media")
    .eq("site_key", SITE_KEY)
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  return (data as Review[]) || [];
}

export function Reviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [message, setMessage] = useState("");
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("recent");

  useEffect(() => {
    let active = true;
    void fetchReviews(productId).then((data) => { if (active) setReviews(data); });
    return () => { active = false; };
  }, [productId]);

  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
  const sortedReviews = useMemo(() => [...reviews].sort((a, b) => sort === "rating" ? b.rating - a.rating : +new Date(b.created_at) - +new Date(a.created_at)), [reviews, sort]);
  const pageCount = Math.max(1, Math.ceil(sortedReviews.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleReviews = sortedReviews.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function chooseRating(rating: number) {
    setSelectedRating(rating);
    setMessage("");
    setModalOpen(true);
  }

  async function uploadMedia(files: File[]) {
    if (!files.length) return [] as ReviewMedia[];
    const response = await fetch("/api/review-media/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, files: files.map((file) => ({ name: file.name, type: file.type, size: file.size })) }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Media uploads are not available yet.");
    await Promise.all(payload.uploads.map((upload: ReviewMedia & { uploadUrl: string }, index: number) => fetch(upload.uploadUrl, { method: "PUT", headers: { "Content-Type": files[index].type }, body: files[index] }).then((result) => {
      if (!result.ok) throw new Error(`Could not upload ${files[index].name}.`);
    })));
    return payload.uploads.map(({ key, url, name, type }: ReviewMedia) => ({ key, url, name, type }));
  }

  async function submit(formData: FormData) {
    if (!selectedRating) return;
    setSubmitting(true);
    setMessage("");
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in to submit a review.");
      const files = formData.getAll("media").filter((value): value is File => value instanceof File && value.size > 0);
      const media = await uploadMedia(files);
      const { error } = await supabase.from("reviews").insert({
        site_key: SITE_KEY,
        product_id: productId,
        user_id: user.id,
        rating: selectedRating,
        title: String(formData.get("title") || ""),
        body: String(formData.get("body") || ""),
        display_name: String(formData.get("name") || user.email?.split("@")[0] || "Customer"),
        media,
      });
      if (error) throw error;
      setMessage("Thanks — your review has been submitted for moderation.");
      setModalOpen(false);
      setSelectedRating(0);
      setReviews(await fetchReviews(productId));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not submit your review.");
    } finally {
      setSubmitting(false);
    }
  }

  return <section className="reviews-section">
    <h2>Reviews</h2>
    <div className="rating-summary">
      <div className="rating-snapshot"><small>Rating Snapshot</small><p>Select a row below to filter reviews.</p>{[5, 4, 3, 2, 1].map((rating) => {
        const count = reviews.filter((review) => review.rating === rating).length;
        const width = reviews.length ? `${(count / reviews.length) * 100}%` : "0%";
        return <button type="button" key={rating} onClick={() => { setSort("rating"); setPage(1); }}><span>{rating} stars</span><i><b style={{ width }}/></i><em>{count}</em></button>;
      })}</div>
      <div className="overall-rating"><small>Overall rating</small><div><strong>{average ? average.toFixed(1) : "—"}</strong><span><b>{"★".repeat(Math.round(average))}{"☆".repeat(5 - Math.round(average))}</b><small>{reviews.length} reviews</small></span></div></div>
      <div className="review-launcher"><small>Review this Product</small><div className="review-star-buttons" onMouseLeave={() => setHoverRating(0)}>{[1, 2, 3, 4, 5].map((rating) => <button type="button" className={rating <= (hoverRating || selectedRating) ? "active" : ""} onMouseEnter={() => setHoverRating(rating)} onFocus={() => setHoverRating(rating)} onClick={() => chooseRating(rating)} aria-label={`Write a ${rating} star review`} key={rating}><Star/></button>)}</div><p>Adding a review will require a valid email for verification.</p></div>
    </div>
    <div className="review-tools"><label>Sort by: <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}><option value="recent">Most relevant</option><option value="rating">Highest rated</option></select></label></div>
    <div className="review-list">{visibleReviews.map((review) => <article key={review.id}><div className="stars">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div><h4>{review.title || "Product review"}</h4><p>{review.body}</p><p className="review-recommend">✓ Yes, I recommend this product.</p><b>{review.display_name}</b> {review.verified_purchase && <small>✓ Verified purchase</small>}<br/><small>{new Date(review.created_at).toLocaleDateString("en-NZ")}</small>{review.media?.length ? <div className="review-media-links">{review.media.map((item) => item.url && <a href={item.url} target="_blank" rel="noreferrer" key={item.key}>{item.name}</a>)}</div> : null}</article>)}{!reviews.length && <div className="empty-reviews"><p>No reviews yet. Select a star above to be the first to review this product.</p></div>}</div>
    <div className="review-pagination"><span>Showing {reviews.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0}–{Math.min(currentPage * PAGE_SIZE, reviews.length)} of {reviews.length} Reviews</span><nav aria-label="Review pages"><button type="button" disabled={currentPage === 1} onClick={() => setPage((value) => value - 1)}>‹</button>{Array.from({ length: pageCount }, (_, index) => <button type="button" className={currentPage === index + 1 ? "active" : ""} onClick={() => setPage(index + 1)} key={index}>{index + 1}</button>)}<button type="button" disabled={currentPage === pageCount} onClick={() => setPage((value) => value + 1)}>›</button></nav></div>
    {message && <p className={message.startsWith("Thanks") ? "notice review-message" : "error review-message"}>{message}</p>}
    {modalOpen && <div className="review-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}><div className="review-modal" role="dialog" aria-modal="true" aria-labelledby="review-modal-title"><button type="button" className="review-modal-close" onClick={() => setModalOpen(false)} aria-label="Close review form"><X/></button><div className="review-modal-heading"><span>{"★".repeat(selectedRating)}{"☆".repeat(5 - selectedRating)}</span><h3 id="review-modal-title">Tell us about this bearing</h3><p>Your review will be checked before it appears publicly.</p></div><form action={submit}><label>Display name<input name="name" required maxLength={80} placeholder="Your name"/></label><label>Review title<input name="title" maxLength={120} placeholder="Summarise your experience"/></label><label className="full">Your review<textarea name="body" required minLength={5} maxLength={4000} placeholder="What should other customers know?"/></label><label className="review-upload full"><Upload/><span><b>Add photos or video</b><small>Up to 5 files, 10 MB each. JPG, PNG, WebP, MP4 or WebM.</small></span><input name="media" type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" multiple/></label><p className="full review-auth-note">You must be signed in with a valid email to submit. <Link href="/login-sign-up">Sign in or create an account</Link>.</p><button className="button full" disabled={submitting}>{submitting ? "Submitting…" : "Submit review"}</button></form></div></div>}
  </section>;
}
