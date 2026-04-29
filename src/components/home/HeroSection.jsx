import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useRouter } from "next/router";
import { ROUTES } from "@/lib/routes";

export default function HeroSection() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(ROUTES.Search + `?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/[1.0] via-foreground/95 to-foreground/85 z-10" />
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://media.base44.com/images/public/699e34d59ad598edd05d1adb/414c72abc_53662288261_88a92d9d7f_k.jpg')"
        }} />

      <div className="relative z-20 max-w-4xl mx-auto px-6 text-center pt-20 md:pt-16">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-accent font-sans text-sm tracking-[0.3em] uppercase mb-6">
          The Prince of Preachers
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-primary-foreground leading-[1.05] mb-8">
          Charles Haddon
          <br />
          <span className="italic font-normal">Spurgeon</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-primary-foreground/60 font-sans text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-light">
          Explore over 3,500 sermons, lectures, and writings from the most
          prolific preacher in church history. A treasury of biblical wisdom
          spanning four decades of faithful ministry.
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          onSubmit={handleSearch}
          className="max-w-2xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/20 rounded-full overflow-hidden transition-all duration-300 group-focus-within:border-accent/50 group-focus-within:bg-primary-foreground/15">
              <Search className="ml-6 w-5 h-5 text-primary-foreground/40 flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sermons, scriptures, topics..."
                className="flex-1 bg-transparent py-5 px-4 text-primary-foreground placeholder:text-primary-foreground/30 outline-none font-sans text-base" />
              <button
                type="submit"
                className="mr-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-sans text-sm font-medium hover:bg-primary/90 transition-colors">
                Search
              </button>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-5">
            {["Grace", "Faith", "Romans 8", "Prayer", "Salvation"].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setQuery(term);
                  router.push(ROUTES.Search + `?q=${encodeURIComponent(term)}`);
                }}
                className="text-xs font-sans text-primary-foreground/40 border border-primary-foreground/10 rounded-full px-3 py-1.5 hover:border-accent/40 hover:text-accent transition-all">
                {term}
              </button>
            ))}
          </div>
        </motion.form>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-5 h-8 rounded-full border border-primary-foreground/20 flex items-start justify-center p-1.5">
          <div className="w-1 h-2 bg-primary-foreground/40 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
