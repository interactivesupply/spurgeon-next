import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_IMAGES = [
  { src: "https://media.base44.com/images/public/699e34d59ad598edd05d1adb/9e5176b45_sp-library.jpg",  alt: "Library" },
  { src: "https://media.base44.com/images/public/699e34d59ad598edd05d1adb/4a4f073a0_sp-library2.jpg", alt: "Library" },
  { src: "https://media.base44.com/images/public/699e34d59ad598edd05d1adb/197ecd423_Geoff-Chang.jpg", alt: "Library" },
];

// Offset/rotation for the deck cards behind the active one
const DECK_OFFSETS = [
  { rotate: 3, x: 8, y: -6, scale: 0.97 },
  { rotate: -2.5, x: -6, y: -12, scale: 0.94 },
];

export default function LibraryCarousel({ images }) {
  const items = (images?.length ? images : DEFAULT_IMAGES);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [items.length]);

  const next = () => setCurrent((prev) => (prev + 1) % items.length);
  const prev = () => setCurrent((prev) => (prev - 1 + items.length) % items.length);

  const deckImages = items.filter((_, i) => i !== current).slice(0, 2);

  return (
    <div className="relative w-full h-64 md:h-80">
      {deckImages.map((item, idx) => {
        const off = DECK_OFFSETS[idx];
        return (
          <div
            key={item.src + idx}
            className="absolute inset-0 rounded-2xl overflow-hidden shadow-lg pointer-events-none"
            style={{
              transform: `rotate(${off.rotate}deg) translate(${off.x}px, ${off.y}px) scale(${off.scale})`,
              zIndex: idx,
            }}>
            <img src={item.src} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20 rounded-2xl" />
          </div>
        );
      })}

      <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl" style={{ zIndex: 10 }}>
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={items[current].src}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.4 }}
            alt={items[current].alt || "Library"}
            className="w-full h-full object-cover" />
        </AnimatePresence>

        {items.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
              aria-label="Previous">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
              aria-label="Next">
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === current ? "bg-white w-6" : "bg-white/50 w-2"
                  }`}
                  aria-label={`Go to slide ${i + 1}`} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
