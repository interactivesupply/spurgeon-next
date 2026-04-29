import React from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

export default function TourStop({ stop }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto px-6 py-12">
      
      <div className="grid md:grid-cols-2 gap-10 items-start">
        {/* Painting / Image */}
        <div>
          <div className="rounded-2xl overflow-hidden border border-border shadow-xl aspect-[4/3] bg-muted">
            <img src="https://media.base44.com/images/public/699e34d59ad598edd05d1adb/46ed94055_Painting-5366-1024x683.jpg"

            alt={stop.title} className="w-full h-full object-cover sepia" />

            
          </div>
          <p className="font-sans text-xs text-muted-foreground mt-3 italic px-1">
            {stop.paintingDescription}
          </p>
        </div>

        {/* Content */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-sans text-3xl font-bold text-muted-foreground/20 leading-none">
              {stop.id}
            </span>
            <div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground leading-tight">
                {stop.title}
              </h2>
              <p className="font-sans text-sm text-muted-foreground mt-0.5">{stop.subtitle}</p>
            </div>
          </div>

          <div className="mt-6 font-sans text-muted-foreground text-sm leading-[1.85] whitespace-pre-line">
            {stop.narrative}
          </div>

          {stop.quote &&
          <blockquote className="mt-8 p-5 bg-primary/5 border-l-4 border-accent rounded-r-xl">
              <Quote className="w-4 h-4 text-accent mb-2" />
              <p className="font-serif text-base italic text-foreground/80 leading-relaxed">
                "{stop.quote}"
              </p>
              <cite className="font-sans text-xs text-muted-foreground not-italic mt-2 block">
                — C.H. Spurgeon
              </cite>
            </blockquote>
          }
        </div>
      </div>
    </motion.div>);

}