import React from "react";
import { motion } from "framer-motion";
import { Feather } from "lucide-react";

export default function MagazineHero() {
  return (
    <section className="relative bg-foreground overflow-hidden">
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        {/* Masthead */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-16 bg-accent/50" />
            <Feather className="w-5 h-5 text-accent" />
            <div className="h-px w-16 bg-accent/50" />
          </div>
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-accent mb-3">
            Spurgeon's Monthly Magazine
          </p>
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-primary-foreground leading-tight">
            Sword & Trowel
          </h1>
          <div className="flex items-center justify-center gap-3 mt-4 mb-6">
            <div className="h-px w-24 bg-primary-foreground/20" />
            <p className="font-serif text-lg italic text-primary-foreground/50">Magazine</p>
            <div className="h-px w-24 bg-primary-foreground/20" />
          </div>
          <p className="font-sans text-base text-primary-foreground/50 max-w-xl mx-auto leading-relaxed">
            Named after Spurgeon's own magazine, first published in 1865. Sermons, scholarship,
            book reviews, and news for the church.
          </p>
        </motion.div>


      </div>
    </section>
  );
}