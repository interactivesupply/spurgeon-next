import React from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { BookMarked, ArrowLeft } from "lucide-react";

export default function BooksHero() {
  return (
    <div className="bg-foreground text-primary-foreground">
      <div className="max-w-5xl mx-auto px-6 py-14">
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
        <p className="font-sans text-primary-foreground/50 text-lg max-w-xl leading-relaxed">
          Devotionals, biblical commentary, theology, and pastoral wisdom — a lifetime of writing.
        </p>
      </div>
    </div>
  );
}