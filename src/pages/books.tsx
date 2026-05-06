import React, { useState, useMemo } from "react";
import type { GetStaticProps } from "next";
import BooksHero from "@/components/books/BooksHero";
import BookCategoryTabs from "@/components/books/BookCategoryTabs";
import BookCard from "@/components/books/BookCard";
import FooterSection from "@/components/home/FooterSection";
import { apolloClient } from "@/lib/apollo-client";
import { GET_BOOKS } from "@/lib/queries";
import { getSharedPageData, type SharedPageData } from "@/lib/shared-data";

interface Book {
  id: string;
  title: string;
  category: string;
  categoryValue: string;
  description: string;
  href: string;
  /** Icon name from the Lucide set (e.g. "Sun", "BookOpen"). BookCard maps this to a component. */
  icon: string;
  subscribable: boolean;
  accentColor: string;
  iconBg: string;
  iconColor: string;
  categoryColor: string;
}

interface CategoryTerm {
  slug: string;
  name: string;
}

interface BooksProps {
  books: Book[];
  categoryTerms: CategoryTerm[];
  shared: SharedPageData;
}

// Used as a fallback if WP returns no books.
const FALLBACK_BOOKS: Book[] = [
  { id: "morning_and_evening", title: "Morning and Evening", category: "Devotional", categoryValue: "devotional", description: "Two devotional readings for every day of the year.", href: "/books/morning-and-evening", icon: "Sun", subscribable: true, accentColor: "#526B41", iconBg: "#526B4120", iconColor: "#526B41", categoryColor: "#526B41" },
];

export default function Books({ books: incomingBooks, categoryTerms, shared }: BooksProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const books = (incomingBooks?.length ? incomingBooks : FALLBACK_BOOKS);

  const filtered = useMemo(() =>
    activeCategory === "all" ? books : books.filter((b) => b.categoryValue === activeCategory),
    [books, activeCategory]
  );

  return (
    <div className="min-h-screen bg-background">
      <BooksHero />
      <BookCategoryTabs active={activeCategory} onChange={setActiveCategory} terms={categoryTerms} />
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
      <FooterSection settings={shared.footer} footerColumns={shared.nav?.footerColumns} />
    </div>
  );
}

function flat(value: any): string {
  return Array.isArray(value) ? value[0] : value;
}

export const getStaticProps: GetStaticProps<BooksProps> = async () => {
  const shared = await getSharedPageData();
  let books: Book[] = [];
  let categoryTerms: CategoryTerm[] = [];

  try {
    const { data } = await apolloClient.query({ query: GET_BOOKS });
    const nodes = (data as any)?.spurgeonBooks?.nodes || [];
    const terms = (data as any)?.bookCategories?.nodes || [];
    categoryTerms = terms.map((t: any) => ({ slug: t.slug, name: t.name }));
    books = nodes.map((n: any) => {
      const f = n.spurgeonBookFields || {};
      const term = n.bookCategories?.nodes?.[0];
      return {
        id: String(n.databaseId),
        title: n.title,
        category: term?.name || '',
        categoryValue: term?.slug || '',
        description: f.bookDescription || '',
        href: f.bookDestinationUrl || `/books/${n.slug}`,
        icon: flat(f.bookIcon) || 'BookOpen',
        subscribable: !!f.bookSubscribable,
        accentColor: f.bookAccentColor || '#526B41',
        iconBg: f.bookIconBg || '#526B4120',
        iconColor: f.bookIconColor || '#526B41',
        categoryColor: f.bookCategoryColor || '#526B41',
      };
    });
  } catch (err: any) {
    console.error('[GetBooks failed]', err?.message);
  }

  return { props: { books, categoryTerms, shared }, revalidate: 3600 };
};
