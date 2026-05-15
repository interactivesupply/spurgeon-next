import React from "react";
import Link from "next/link";
import type { GetStaticProps } from "next";
import { ROUTES } from "@/lib/routes";
import { ArrowLeft, BookOpen } from "lucide-react";
import FooterSection from "@/components/home/FooterSection";
import { algolia, ALGOLIA_INDEX } from "@/lib/algolia";
import { OLD_TESTAMENT, NEW_TESTAMENT, bookSlug } from "@/lib/bible";
import { getSharedPageData, type SharedPageData } from "@/lib/shared-data";

interface BookEntry {
  name: string;
  slug: string;
  count: number;
}

interface ScriptureBrowseProps {
  oldTestament: BookEntry[];
  newTestament: BookEntry[];
  shared: SharedPageData;
}

const SCRIPTURE_BOOK_FACET = "taxonomies_hierarchical.scripture_chapter.lvl0";

export default function ScriptureBrowse({ oldTestament, newTestament, shared }: ScriptureBrowseProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-foreground text-primary-foreground">
        <div className="max-w-5xl mx-auto px-6 py-14">
          <Link
            href={ROUTES.Search}
            className="inline-flex items-center gap-2 text-primary-foreground/40 hover:text-primary-foreground transition-colors font-sans text-sm mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to search
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="w-5 h-5 text-accent" />
            <span className="font-sans text-xs text-primary-foreground/40 uppercase tracking-widest">Sermons</span>
          </div>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-primary-foreground mb-4">
            Browse by Scripture
          </h1>
          <p className="font-sans text-primary-foreground/60 text-lg max-w-2xl leading-relaxed">
            Spurgeon preached from across the whole of Scripture. Choose a book to see every chapter
            he opened, and the sermons drawn from each.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          <BookColumn label="Old Testament" books={oldTestament} />
          <BookColumn label="New Testament" books={newTestament} />
        </div>
      </div>

      <FooterSection settings={shared?.footer} footerColumns={shared?.nav?.footerColumns} />
    </div>
  );
}

function BookColumn({ label, books }: { label: string; books: BookEntry[] }) {
  return (
    <section>
      <h2 className="font-serif text-2xl font-semibold text-foreground mb-5 pb-3 border-b border-border">{label}</h2>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
        {books.map((b) => {
          const empty = b.count === 0;
          if (empty) {
            return (
              <li key={b.name}>
                <span className="flex items-baseline justify-between gap-2 py-1.5 font-sans text-sm text-muted-foreground/40 cursor-default">
                  <span>{b.name}</span>
                  <span className="text-xs">—</span>
                </span>
              </li>
            );
          }
          return (
            <li key={b.name}>
              <Link
                href={`/sermons/scripture/${b.slug}`}
                className="flex items-baseline justify-between gap-2 py-1.5 font-sans text-sm text-foreground hover:text-primary transition-colors">
                <span>{b.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{b.count}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export const getStaticProps: GetStaticProps<ScriptureBrowseProps> = async () => {
  const shared = await getSharedPageData();

  // Pull the lvl0 (book-level) facet from Algolia so the counts reflect
  // what's currently indexed. Books with no sermons appear in the list
  // (dimmed) so users see the full canon, not just our coverage.
  let counts: Record<string, number> = {};
  if (algolia) {
    try {
      const { results } = await algolia.search({
        requests: [{
          indexName: ALGOLIA_INDEX,
          query: "",
          hitsPerPage: 0,
          facets: [SCRIPTURE_BOOK_FACET],
          maxValuesPerFacet: 100,
          filters: "post_type:spurgeon_sermon",
        }],
      });
      const main: any = results[0];
      counts = (main?.facets?.[SCRIPTURE_BOOK_FACET] || {}) as Record<string, number>;
    } catch (err: any) {
      console.error("[ScriptureBrowse counts failed]", err?.message);
    }
  }

  const toEntries = (names: readonly string[]): BookEntry[] =>
    names.map((name) => ({ name, slug: bookSlug(name), count: counts[name] || 0 }));

  return {
    props: {
      oldTestament: toEntries(OLD_TESTAMENT),
      newTestament: toEntries(NEW_TESTAMENT),
      shared,
    },
    revalidate: 3600,
  };
};
