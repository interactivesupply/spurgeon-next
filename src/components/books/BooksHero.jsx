import React from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { BookMarked, ArrowLeft } from "lucide-react";

// Hero background — Treasury of David volumes from Spurgeon's personal
// library, sourced from MBTS's Flickr album. The dark overlay below keeps
// the photo recognizable while preserving text contrast.
const HERO_IMAGE = 'https://spurgeoncenter.wpenginepowered.com/wp-content/uploads/2026/05/spurgeon-treasury-of-david-books.jpg';

export default function BooksHero() {
  return (
    <div className="relative bg-foreground text-primary-foreground overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/95 via-foreground/70 to-foreground/40" aria-hidden="true" />
      <div className="relative max-w-5xl mx-auto px-6 py-14">
        <Link
          href={ROUTES.Library}
          className="inline-flex items-center gap-1.5 text-primary-foreground/40 hover:text-primary-foreground transition-colors font-sans text-sm mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Library
        </Link>
        <div className="flex items-center gap-3 mb-3">
          <BookMarked className="w-5 h-5 text-accent" />
          <span className="font-sans text-xs text-primary-foreground/40 uppercase tracking-widest">Books</span>
        </div>
        <h1 className="font-serif text-4xl md:text-6xl font-bold text-primary-foreground mb-4">
          Spurgeon's Books
        </h1>
        <p className="font-sans text-primary-foreground/60 text-lg max-w-xl leading-relaxed">
          Devotionals, biblical commentary, theology, and pastoral wisdom — a lifetime of writing.
        </p>
      </div>
    </div>
  );
}