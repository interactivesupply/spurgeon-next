import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { decodeEntities } from "@/lib/utils";

const DEFAULT_MILESTONES = [
  { year: "1834", title: "Born in Kelvedon, Essex", description: "Charles Haddon Spurgeon was born on June 19, 1834, in Kelvedon, Essex, England, to a Nonconformist minister." },
  { year: "1844", title: "Stays with Grandparents", description: "Spurgeon spent formative years with his grandfather, a Congregationalist pastor, deeply shaping his early faith." },
  { year: "1849", title: "Moves to Newmarket", description: "Spurgeon moved to Newmarket to teach at a school, continuing his voracious reading and self-education in theology." },
  { year: "1850", title: "Conversion at Age 15", description: "On a snowy January morning, a lay preacher's words on Isaiah 45:22 — \"Look unto me, and be ye saved\" — changed his life forever." },
  { year: "1851", title: "First Sermon Preached", description: "At 16, Spurgeon preached his first sermon in a cottage at Teversham and quickly became known for his gifts." },
  { year: "1852", title: "Pastor at Waterbeach", description: "At just 17, Spurgeon became pastor of the Waterbeach Baptist Chapel, transforming a small village congregation." },
  { year: "1854", title: "Called to New Park Street", description: "At 19, Spurgeon was called to the historic New Park Street Chapel in London. Crowds quickly outgrew the building." },
  { year: "1856", title: "Surrey Gardens Music Hall", description: "Services moved to the Surrey Gardens Music Hall, drawing over 10,000 — and marking a tragedy when a false alarm caused a stampede." },
  { year: "1857", title: "Preaches to 23,000", description: "Spurgeon preached to an estimated 23,654 people at the Crystal Palace — one of the largest crowds ever addressed by a single voice." },
  { year: "1861", title: "Metropolitan Tabernacle Opens", description: "The Metropolitan Tabernacle, seating 5,600, opened its doors and became the epicenter of his ministry for three decades." },
  { year: "1865", title: "Founding of Pastors' College", description: "Spurgeon founded the Pastors' College to train men for ministry, equipping hundreds of pastors who spread across the globe." },
  { year: "1866", title: "Stockwell Orphanage Founded", description: "Spurgeon opened the Stockwell Orphanage, eventually housing and educating over 500 children at a time." },
  { year: "1865", title: "Sword & Trowel Magazine", description: "He launched The Sword and the Trowel, a monthly magazine sharing sermons, reviews, and ministry news." },
  { year: "1887", title: "Downgrade Controversy", description: "Spurgeon withdrew from the Baptist Union over doctrinal compromise, a courageous stand that cost him many friendships." },
  { year: "1892", title: "Legacy Endures", description: "Spurgeon passed into glory on January 31, 1892. He left 63 volumes of sermons, 135+ books, and a legacy shaping the church worldwide." },
];

const DOT_COUNT = 6;

export default function TimelineSection({ eyebrow, heading, milestones }) {
  const items = (milestones?.length ? milestones : DEFAULT_MILESTONES);
  const eb = eyebrow || "A Life of Faithful Ministry";
  const hd = heading || "The Spurgeon Story";

  const scrollRef = useRef(null);
  const [activeDot, setActiveDot] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  // Drag state lives in a ref so we can update it inside event handlers
  // without re-rendering on every mousemove.
  const dragRef = useRef({ isDown: false, startX: 0, startScrollLeft: 0, moved: false });
  const [isDragging, setIsDragging] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    const idx = maxScroll > 0 ? Math.round((scrollLeft / maxScroll) * (DOT_COUNT - 1)) : 0;
    setActiveDot(Math.min(idx, DOT_COUNT - 1));
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft < maxScroll - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const scrollByPage = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    // Scroll ~80% of the visible width so users see a few new milestones
    // without losing context on either side.
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  };

  // Pointer-based drag-to-scroll. Pointer events handle mouse, touch, and
  // pen uniformly, and setPointerCapture keeps the drag alive even if the
  // cursor leaves the strip mid-swipe.
  const onPointerDown = (e) => {
    const el = scrollRef.current;
    if (!el) return;
    // Allow native touch scrolling to still work — only intercept mouse/pen.
    if (e.pointerType === "touch") return;
    dragRef.current = {
      isDown: true,
      startX: e.clientX,
      startScrollLeft: el.scrollLeft,
      moved: false,
    };
    el.setPointerCapture?.(e.pointerId);
    setIsDragging(true);
  };

  const onPointerMove = (e) => {
    const drag = dragRef.current;
    if (!drag.isDown) return;
    const el = scrollRef.current;
    if (!el) return;
    const dx = e.clientX - drag.startX;
    if (Math.abs(dx) > 4) drag.moved = true;
    el.scrollLeft = drag.startScrollLeft - dx;
  };

  const endDrag = (e) => {
    if (!dragRef.current.isDown) return;
    dragRef.current.isDown = false;
    setIsDragging(false);
    const el = scrollRef.current;
    if (el && e?.pointerId != null) el.releasePointerCapture?.(e.pointerId);
  };

  // Swallow click events that bubble up from a drag so a milestone with a
  // future <Link> wrapper wouldn't navigate after a drag-release.
  const onClickCapture = (e) => {
    if (dragRef.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      dragRef.current.moved = false;
    }
  };

  return (
    <section className="bg-[hsl(var(--foreground))] py-24 md:py-36">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20">
          <p className="text-accent font-sans text-sm tracking-[0.3em] uppercase mb-4">
            {decodeEntities(eb)}
          </p>
          <h2 className="text-[hsl(var(--card))] text-4xl font-bold md:text-5xl">{decodeEntities(hd)}</h2>
        </motion.div>
      </div>

      <div className="relative">
        {/* Left arrow */}
        <button
          type="button"
          aria-label="Scroll timeline left"
          onClick={() => scrollByPage(-1)}
          disabled={!canScrollLeft}
          className={`hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[hsl(var(--card))] border border-border items-center justify-center shadow-md transition-opacity ${
            canScrollLeft ? "opacity-100 hover:bg-accent hover:text-black" : "opacity-0 pointer-events-none"
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Right arrow */}
        <button
          type="button"
          aria-label="Scroll timeline right"
          onClick={() => scrollByPage(1)}
          disabled={!canScrollRight}
          className={`hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[hsl(var(--card))] border border-border items-center justify-center shadow-md transition-opacity ${
            canScrollRight ? "opacity-100 hover:bg-accent hover:text-black" : "opacity-0 pointer-events-none"
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div
          ref={scrollRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
          className={`overflow-x-auto pb-6 mt-2 px-6 select-none ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{ scrollBehavior: isDragging ? "auto" : undefined }}
        >
        <div className="flex items-start" style={{ width: `${items.length * 200}px` }}>
          {items.map((milestone, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="relative flex flex-col items-center flex-1">
              <div className="flex items-center w-full mb-4">
                <div className={`flex-1 h-px bg-border ${index === 0 ? "invisible" : ""}`} />
                <div className="bg-[hsl(var(--accent))] text-black rounded-full w-2.5 h-2.5 flex-shrink-0" />
                <div className={`flex-1 h-px bg-border ${index === items.length - 1 ? "invisible" : ""}`} />
              </div>

              <div className="text-center px-3 w-full">
                <span className="text-[hsl(var(--accent))] text-2xl font-bold block">
                  {milestone.year}
                </span>
                <h3 className="font-serif text-sm font-semibold text-[hsl(var(--card))] mt-1 mb-1 leading-snug">
                  {decodeEntities(milestone.title)}
                </h3>
                <p className="font-sans text-[hsl(var(--card))]/70 leading-relaxed text-xs">
                  {decodeEntities(milestone.description)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: DOT_COUNT }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              const el = scrollRef.current;
              if (!el) return;
              const { scrollWidth, clientWidth } = el;
              const maxScroll = scrollWidth - clientWidth;
              el.scrollTo({ left: (i / (DOT_COUNT - 1)) * maxScroll, behavior: "smooth" });
            }}
            className={`rounded-full transition-all duration-300 ${
              i === activeDot ? "w-4 h-1.5 bg-accent" : "w-1.5 h-1.5 bg-accent/25 hover:bg-accent/50"
            }`} />
        ))}
      </div>
    </section>
  );
}
