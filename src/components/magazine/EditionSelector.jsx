import React, { useMemo, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths } from "date-fns";

// The Sword and the Trowel ran monthly from January 1865 through
// December 1892 (the last issue published before Spurgeon's death cut
// the magazine short). The timeline shows every month in that window;
// extending past Dec 1892 only surfaces empty editions.
function generateEditions() {
  const editions = [];
  let current = new Date(1865, 0, 1); // Jan 1865
  const end = new Date(1892, 11, 1);  // Dec 1892 (inclusive)
  while (current <= end) {
    editions.push(format(current, "MMMM yyyy"));
    current = addMonths(current, 1);
  }
  return editions;
}

export default function EditionSelector({ activeEdition, onEditionChange }) {
  const editions = useMemo(() => generateEditions(), []);
  const scrollRef = useRef(null);

  const currentIndex = editions.indexOf(activeEdition);

  // Scroll active edition into view
  useEffect(() => {
    if (!scrollRef.current || currentIndex < 0) return;
    const container = scrollRef.current;
    const buttons = container.querySelectorAll("button");
    if (buttons[currentIndex]) {
      buttons[currentIndex].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [currentIndex]);

  const go = (dir) => {
    const next = currentIndex + dir;
    if (next >= 0 && next < editions.length) onEditionChange(editions[next]);
  };

  return (
    <div className="bg-card border-b border-border/50">
      <div className="max-w-6xl mx-auto px-6 py-5">
        <p className="font-sans text-xs tracking-widest uppercase text-muted-foreground mb-3">
          Edition
        </p>

        {/* Active edition label */}
        <div className="text-center mb-3">
          <span className="font-serif text-xl md:text-2xl font-semibold text-foreground">
            {activeEdition || "All Editions"}
          </span>
          {activeEdition && (
            <span className="font-sans text-xs text-muted-foreground ml-3">
              Vol. {currentIndex + 1}
            </span>
          )}
        </div>

        {/* Scrollable pill row with inline arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => go(-1)}
            disabled={currentIndex <= 0}
            className="p-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div
            ref={scrollRef}
            className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-1"
          >
            <button
              onClick={() => onEditionChange(null)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full font-sans text-xs font-medium border transition-all ${
                !activeEdition
                  ? "bg-foreground text-primary-foreground border-foreground"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
              }`}
            >
              All
            </button>
            {editions.map((edition) => (
              <button
                key={edition}
                onClick={() => onEditionChange(edition)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full font-sans text-xs font-medium border transition-all ${
                  activeEdition === edition
                    ? "bg-foreground text-primary-foreground border-foreground"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                }`}
              >
                {edition}
              </button>
            ))}
          </div>
          <button
            onClick={() => go(1)}
            disabled={currentIndex >= editions.length - 1}
            className="p-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}