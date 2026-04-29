import React from "react";
import { GraduationCap, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function MBTSBanner() {
  return (
    <section className="py-14 bg-primary/5 border-y border-primary/10">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-sans text-xs tracking-[0.25em] uppercase text-accent font-semibold mb-1">
                Midwestern Baptist Theological Seminary
              </p>
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-foreground leading-snug">
                Study Theology Where Spurgeon Is Celebrated
              </h3>
              <p className="font-sans text-sm text-muted-foreground mt-2 max-w-xl leading-relaxed">
                Deepen your calling through an M.Div or Doctoral program at MBTS —
                where the Prince of Preachers' legacy shapes pastoral formation.
                Visit campus and see for yourself.
              </p>
            </div>
          </div>

          <a
            href="https://www.mbts.edu/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-sans text-sm font-semibold hover:bg-primary/90 transition-colors group">
            Visit MBTS.edu
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
