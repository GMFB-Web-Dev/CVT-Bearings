"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type GalleryImage = { src: string; alt: string };

export function ProductGallery({ images, productTitle }: { images: GalleryImage[]; productTitle: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const thumbnailRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeImage = images[activeIndex];
  const hasMultiple = images.length > 1;

  const move = (direction: -1 | 1) => {
    setActiveIndex((current) => (current + direction + images.length) % images.length);
  };

  useEffect(() => {
    thumbnailRefs.current[activeIndex]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeIndex]);

  return <div
    className="product-gallery"
    tabIndex={hasMultiple ? 0 : undefined}
    aria-label={`${productTitle} image gallery`}
    onKeyDown={(event) => {
      if (event.key === "ArrowLeft" && hasMultiple) { event.preventDefault(); move(-1); }
      if (event.key === "ArrowRight" && hasMultiple) { event.preventDefault(); move(1); }
    }}
  >
    <div
      className="main-image"
      onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null; }}
      onTouchEnd={(event) => {
        const start = touchStartX.current;
        const end = event.changedTouches[0]?.clientX;
        touchStartX.current = null;
        if (!hasMultiple || start == null || end == null || Math.abs(start - end) < 45) return;
        move(start > end ? 1 : -1);
      }}
    >
      {activeImage ? <Image key={activeImage.src} src={activeImage.src} fill sizes="(max-width: 900px) 100vw, 52vw" alt={activeImage.alt || productTitle} priority/> : <span className="product-image-placeholder">Image coming soon</span>}
      {hasMultiple && <>
        <button className="gallery-arrow gallery-prev" type="button" onClick={() => move(-1)} aria-label="Show previous product image"><ChevronLeft/></button>
        <button className="gallery-arrow gallery-next" type="button" onClick={() => move(1)} aria-label="Show next product image"><ChevronRight/></button>
        <span className="gallery-count" aria-live="polite">{activeIndex + 1} / {images.length}</span>
      </>}
    </div>
    {hasMultiple && <div className="thumbs" aria-label="Choose product image">
      {images.map((image, index) => <button ref={(element) => { thumbnailRefs.current[index] = element; }} className={index === activeIndex ? "active" : ""} type="button" onClick={() => setActiveIndex(index)} aria-label={`Show image ${index + 1} of ${images.length}`} aria-current={index === activeIndex ? "true" : undefined} key={image.src}>
        <Image src={image.src} width={100} height={100} alt=""/>
      </button>)}
    </div>}
  </div>;
}
