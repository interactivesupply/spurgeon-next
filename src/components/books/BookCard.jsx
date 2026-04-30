import React from "react";
import Link from "next/link";
import {
  ArrowRight, Bell,
  Sun, BookOpen, BookMarked, GraduationCap, DoorOpen, Star, ScrollText, User, Newspaper,
} from "lucide-react";
import { decodeEntities } from "@/lib/utils";

const ICONS = { Sun, BookOpen, BookMarked, GraduationCap, DoorOpen, Star, ScrollText, User, Newspaper };

/**
 * `book.icon` is either a string name from the Lucide set (when sourced from
 * WordPress) or a component reference (legacy hardcoded data). Both work.
 */
function resolveIcon(icon) {
  if (typeof icon === "string") return ICONS[icon] || BookOpen;
  return icon || BookOpen;
}

export default function BookCard({ book }) {
  const Icon = resolveIcon(book.icon);
  return (
    <Link
      href={book.href}
      className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300">
      <div className="h-1.5" style={{ backgroundColor: book.accentColor }} />
      <div className="p-6 flex flex-col flex-1">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: book.iconBg }}>
          <Icon className="w-5 h-5" style={{ color: book.iconColor }} />
        </div>
        <div className="mb-1">
          <span className="font-sans text-[10px] uppercase tracking-widest font-medium" style={{ color: book.categoryColor }}>
            {decodeEntities(book.category)}
          </span>
        </div>
        <h3 className="font-serif text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-2 leading-snug">
          {decodeEntities(book.title)}
        </h3>
        <p className="font-sans text-sm text-muted-foreground leading-relaxed flex-1">
          {decodeEntities(book.description)}
        </p>
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
          {book.subscribable && (
            <span className="flex items-center gap-1 font-sans text-xs text-accent">
              <Bell className="w-3 h-3" />
              Daily subscription available
            </span>
          )}
          <span className="flex items-center gap-1 font-sans text-xs text-muted-foreground group-hover:text-primary transition-colors ml-auto">
            Read now
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}
