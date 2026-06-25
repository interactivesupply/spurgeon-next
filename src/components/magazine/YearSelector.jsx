import React, { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const START_YEAR = 1865;
const END_YEAR = 1892;
const YEARS = Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i);

export default function YearSelector({ activeYear, onYearChange }) {
  const scrollRef = useRef(null);
  const currentIndex = activeYear ? YEARS.indexOf(parseInt(activeYear, 10)) : -1;

  useEffect(() => {
    if (!scrollRef.current || currentIndex < 0) return;
    const buttons = scrollRef.current.querySelectorAll("button");
    if (buttons[currentIndex]) {
      buttons[currentIndex].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [currentIndex]);

  const go = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 240, behavior: "smooth" });
  };

  return (
    <div className="bg-card border-b border-border/50">
      <div className="max-w-6xl mx-auto px-6 py-5">
        <p className="font-sans text-xs tracking-widest uppercase text-muted-foreground mb-3">
          Year
        </p>

        <div className="text-center mb-3">
          <span className="font-serif text-xl md:text-2xl font-semibold text-foreground">
            {activeYear ?? "All Years"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => go(-1)}
            className="p-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all flex-shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={scrollRef}
            className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-1"
          >
            <button
              onClick={() => onYearChange(null)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full font-sans text-xs font-medium border transition-all ${
                !activeYear
                  ? "bg-foreground text-primary-foreground border-foreground"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
              }`}
            >
              All
            </button>
            {YEARS.map((year) => (
              <button
                key={year}
                onClick={() => onYearChange(String(year))}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full font-sans text-xs font-medium border transition-all ${
                  activeYear === String(year)
                    ? "bg-foreground text-primary-foreground border-foreground"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                }`}
              >
                {year}
              </button>
            ))}
          </div>

          <button
            onClick={() => go(1)}
            className="p-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all flex-shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
