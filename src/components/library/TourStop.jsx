import React from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { decodeEntities } from "@/lib/utils";

export default function TourStop({ stop }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto px-6 py-12">
      <div className="grid md:grid-cols-2 gap-10 items-start">
        {/*
          Sticky on md+ so the painting stays in view while the reader
          scrolls through a long narrative on the right. top-24 clears
          the fixed header (h-16/md:h-20). Falls back to non-sticky on
          mobile, where the painting renders above the text inline.
        */}
        <div className="md:sticky md:top-24">
          <div className="rounded-2xl overflow-hidden border border-border shadow-xl aspect-[4/3] bg-muted">
            {stop.image ? (
              <img src={stop.image} alt={stop.title} className="w-full h-full object-cover sepia" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 font-sans text-sm">
                Painting placeholder
              </div>
            )}
          </div>
          {/*
            Caption under the painting removed (Userback #7679797). The
            paintingDescription ACF field was a near-duplicate of the
            narrative's first paragraph and rendered truncated in a small
            box, which read as a layout bug. The full narrative below
            covers the same content. Keep the ACF field around in case
            editors later want to write a distinct caption — just don't
            display it for now.
          */}
        </div>

        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-sans text-3xl font-bold text-muted-foreground/20 leading-none">
              {stop.id}
            </span>
            <div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground leading-tight">
                {decodeEntities(stop.title)}
              </h2>
              <p className="font-sans text-sm text-muted-foreground mt-0.5">{decodeEntities(stop.subtitle)}</p>
            </div>
          </div>

          {stop.narrative && (
            <div
              className="sermon-content mt-6 font-sans text-muted-foreground text-sm leading-[1.85]"
              dangerouslySetInnerHTML={{ __html: stop.narrative }} />
          )}

          {stop.quote && (
            <blockquote className="mt-8 p-5 bg-primary/5 border-l-4 border-accent rounded-r-xl">
              <Quote className="w-4 h-4 text-accent mb-2" />
              <p className="font-serif text-base italic text-foreground/80 leading-relaxed">
                "{decodeEntities(stop.quote)}"
              </p>
              <cite className="font-sans text-xs text-muted-foreground not-italic mt-2 block">
                — C.H. Spurgeon
              </cite>
            </blockquote>
          )}
        </div>
      </div>
    </motion.div>
  );
}
