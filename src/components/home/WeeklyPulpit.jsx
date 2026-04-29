import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, BookOpen, Sun, FileText, Scroll } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { format } from "date-fns";

const QUOTES = [
  "A Bible which is falling apart usually belongs to someone who isn't.",
  "I have a great need for Christ; I have a great Christ for my need.",
  "Nobody ever outgrows Scripture; the book widens and deepens with our years.",
  "It is not how much we have, but how much we enjoy, that makes happiness.",
  "Defend the Bible? I would as soon defend a lion. Just turn it loose; it will defend itself.",
  "By perseverance the snail reached the ark.",
  "The more you know about Christ, the less you will be satisfied with superficial views of Him.",
  "Prayer is the slender nerve that moves the muscle of omnipotence.",
  "Visit many good books, but live in the Bible.",
  "A good character is the best tombstone. Those who loved you will remember.",
];

const PLACEHOLDER_DEVOTIONAL = {
  title: "The Mercy of God",
  scripture: "\"The Lord is good to all: and his tender mercies are over all his works.\" — Psalm 145:9",
  text: "Let us begin this morning by considering the boundless mercy of our God. His goodness is not reserved for the deserving — it flows freely to all who look to Him. As the sun rises without partiality, so the Lord's mercies are new every morning, great is His faithfulness.",
};

const PLACEHOLDER_ARTICLE = {
  title: "Spurgeon on the Sovereignty of God",
  excerpt: "Few doctrines were more dear to Spurgeon's heart than the absolute sovereignty of God in salvation. He preached it boldly, defended it fearlessly, and rested in it personally as the anchor of his soul.",
};

/**
 * Receives data fetched from getStaticProps:
 *   devotional: { title, scripture, text } | null
 *   latestSermons: array of sermon nodes (used for daily rotation)
 *   article: { title, slug, excerpt } | null
 */
export default function WeeklyPulpit({ devotional, latestSermons = [], article }) {
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [todayLabel, setTodayLabel] = useState("");

  useEffect(() => {
    const t = setInterval(() => setQuoteIndex(i => (i + 1) % QUOTES.length), 8000);
    return () => clearInterval(t);
  }, []);

  // Set the today label client-side so SSR/CSR don't disagree on dates.
  useEffect(() => {
    setTodayLabel(format(new Date(), "EEEE, MMMM d"));
  }, []);

  const dev = devotional || PLACEHOLDER_DEVOTIONAL;
  const art = article || PLACEHOLDER_ARTICLE;

  const sermon = useMemo(() => {
    if (!latestSermons?.length) return null;
    const idx = new Date().getDay() % latestSermons.length;
    return latestSermons[idx];
  }, [latestSermons]);

  const items = [
    {
      key: "devotional",
      label: "Morning & Evening",
      sublabel: format(new Date(), "MMMM d") + " — Morning",
      icon: Sun,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      accentColor: "border-amber-200",
      title: dev.title || "Morning Reading",
      text: dev.text || dev.content,
      scripture: dev.scripture,
      href: ROUTES.MorningAndEvening,
      cta: "Read this morning",
      available: true,
    },
    {
      key: "sermon",
      label: "From the Pulpit",
      sublabel: sermon?.sermonFields?.year ? String(sermon.sermonFields.year) : "",
      icon: Scroll,
      iconBg: "bg-accent/15",
      iconColor: "text-accent",
      accentColor: "border-accent/25",
      title: sermon?.title || "A Sermon",
      text: sermon?.excerpt,
      scripture: sermon?.sermonFields?.scriptureReference,
      href: sermon ? ROUTES.SermonDetail(sermon.slug) : ROUTES.Search,
      cta: "Read the sermon",
      available: !!sermon,
    },
    {
      key: "article",
      label: "From the Library",
      sublabel: "Featured Article",
      icon: FileText,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      accentColor: "border-blue-200",
      title: art.title || "Featured Article",
      text: art.excerpt,
      href: article ? ROUTES.SwordAndTrowel : ROUTES.Search + "?type=article",
      cta: "Read the article",
      available: true,
    },
  ];

  return (
    <section className="bg-background">
      <div className="py-24 md:py-36">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div>
              <p className="text-accent font-sans text-sm tracking-[0.3em] uppercase mb-4">
                {todayLabel}&nbsp;
              </p>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
                This Week in Spurgeon's Pulpit
              </h2>
            </div>
            <Link
              href={ROUTES.Search}
              className="mt-6 md:mt-0 flex items-center gap-2 text-primary font-sans text-sm font-medium hover:text-accent transition-colors group">
              Browse all sermons
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}>
                  <Link href={item.href} className="group block h-full">
                    <div className={`bg-card border ${item.accentColor} rounded-xl p-6 h-full hover:shadow-lg hover:shadow-primary/5 transition-all duration-500 flex flex-col`}>
                      <div className="flex items-center gap-3 mb-5">
                        <div className={`w-9 h-9 rounded-full ${item.iconBg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-4 h-4 ${item.iconColor}`} />
                        </div>
                        <div>
                          <p className="font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">{item.label}</p>
                          {item.sublabel && (
                            <p className="font-sans text-xs text-muted-foreground/60">{item.sublabel}</p>
                          )}
                        </div>
                      </div>

                      {item.available ? (
                        <>
                          {item.scripture && (
                            <p className="font-sans text-xs text-primary/70 mb-2">{item.scripture}</p>
                          )}
                          <h3 className="font-serif text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                            {item.title}
                          </h3>
                          {item.text && (
                            <div
                              className="font-sans text-sm text-muted-foreground leading-relaxed line-clamp-4 flex-1"
                              dangerouslySetInnerHTML={{ __html: item.text }} />
                          )}
                          <div className="mt-5 flex items-center gap-1.5 text-sm font-sans font-medium text-primary group-hover:text-accent transition-colors">
                            {item.cta}
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex items-center justify-center py-8">
                          <div className="text-center">
                            <BookOpen className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                            <p className="font-sans text-sm text-muted-foreground/50">Coming soon</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-24 -mt-10">
        <div className="bg-primary rounded-xl px-10 py-10 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%221%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }} />
          <div className="relative font-serif text-7xl text-primary-foreground/10 leading-none select-none flex-shrink-0 -mt-4">&ldquo;</div>
          <div className="relative flex-1">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={quoteIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5 }}
                className="text-primary-foreground/90 font-serif leading-relaxed text-2xl md:text-2xl italic">
                {QUOTES[quoteIndex]}
              </motion.blockquote>
            </AnimatePresence>
            <p className="font-sans text-xs tracking-[0.2em] uppercase text-primary-foreground/40 mt-4">Charles H. Spurgeon</p>
          </div>
          <div className="relative flex flex-row items-center gap-1.5">
            {QUOTES.map((_, i) => (
              <button
                key={i}
                onClick={() => setQuoteIndex(i)}
                className={`rounded-full transition-all duration-300 ${i === quoteIndex ? "h-1.5 w-4 bg-primary-foreground/60" : "h-1.5 w-1.5 bg-primary-foreground/20"}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
