"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type AutoCarouselProps = {
  children: ReactNode;
  label: string;
  className?: string;
  desktopVisible: number;
  tabletVisible?: number;
  fixedPageSize?: number;
  interval?: number;
};

export function AutoCarousel({ children, label, className = "", desktopVisible, tabletVisible = 2, fixedPageSize, interval = 5000 }: AutoCarouselProps) {
  const slides = Children.toArray(children);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [visible, setVisible] = useState(desktopVisible);
  const [paused, setPaused] = useState(false);
  const pageSize = fixedPageSize ?? visible;
  const pageCount = Math.max(1, Math.ceil(slides.length / pageSize));
  const currentPage = page % pageCount;

  useEffect(() => {
    const updateVisible = () => setVisible(window.innerWidth <= 650 ? 1 : window.innerWidth <= 1000 ? tabletVisible : desktopVisible);
    updateVisible();
    window.addEventListener("resize", updateVisible);
    return () => window.removeEventListener("resize", updateVisible);
  }, [desktopVisible, tabletVisible]);

  useEffect(() => {
    const target = track.current?.children.item(currentPage * pageSize) as HTMLElement | null;
    if (!target || !viewport.current || !track.current) return;
    viewport.current.scrollTo({ left: target.offsetLeft - track.current.offsetLeft, behavior: "smooth" });
  }, [currentPage, pageSize]);

  useEffect(() => {
    if (paused || pageCount < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setPage((current) => (current + 1) % pageCount), interval);
    return () => window.clearInterval(timer);
  }, [interval, pageCount, paused]);

  const move = (direction: number) => setPage((current) => (current + direction + pageCount) % pageCount);

  return <div className={`auto-carousel ${className}`.trim()} aria-label={label} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)}>
    <div className="carousel-stage">
      <button className="carousel-arrow carousel-prev" type="button" onClick={() => move(-1)} aria-label={`Previous ${label}`}><ChevronLeft/></button>
      <div className="carousel-viewport" ref={viewport}>
        <div className="carousel-track" ref={track}>{slides.map((slide, index) => <div className="carousel-slide" key={index}>{slide}</div>)}</div>
      </div>
      <button className="carousel-arrow carousel-next" type="button" onClick={() => move(1)} aria-label={`Next ${label}`}><ChevronRight/></button>
    </div>
    {pageCount > 1 && <div className="carousel-dots" aria-label={`${label} pages`}>{Array.from({ length: pageCount }).map((_, index) => <button type="button" key={index} className={index === currentPage ? "active" : ""} onClick={() => setPage(index)} aria-label={`Show page ${index + 1}`} aria-current={index === currentPage ? "true" : undefined}/>)}</div>}
  </div>;
}
