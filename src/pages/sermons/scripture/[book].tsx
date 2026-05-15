import React from "react";
import Link from "next/link";
import type { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import { ROUTES } from "@/lib/routes";
import { ArrowLeft, BookOpen } from "lucide-react";
import FooterSection from "@/components/home/FooterSection";
import { algolia, ALGOLIA_INDEX } from "@/lib/algolia";
import { BIBLE_BOOKS, bookFromSlug, bookSlug, chapterNumberFromCombo } from "@/lib/bible";
import { getSharedPageData, type SharedPageData } from "@/lib/shared-data";

interface ChapterEntry {
  combo: string;        // "Romans 10" — matches lvl1 facet value
  number: number | null;
  count: number;
}

interface ScriptureBookProps {
  book: string;
  totalSermons: number;
  chapters: ChapterEntry[];
  shared: SharedPageData;
}

const CHAPTER_FACET = "taxonomies_hierarchical.scripture_chapter.lvl1";
const BOOK_FACET = "taxonomies_hierarchical.scripture_chapter.lvl0";

export default function ScriptureBook({ book, totalSermons, chapters, shared }: ScriptureBookProps) {
  const router = useRouter();
  if (router.isFallback) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-foreground text-primary-foreground">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <Link
            href="/sermons/scripture"
            className="inline-flex items-center gap-2 text-primary-foreground/40 hover:text-primary-foreground transition-colors font-sans text-sm mb-6">
            <ArrowLeft className="w-4 h-4" />
            All books
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="w-5 h-5 text-accent" />
            <span className="font-sans text-xs text-primary-foreground/40 uppercase tracking-widest">Sermons</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary-foreground mb-3">
            {book}
          </h1>
          <p className="font-sans text-primary-foreground/60 text-base">
            {totalSermons} sermon{totalSermons === 1 ? "" : "s"} across {chapters.length} chapter
            {chapters.length === 1 ? "" : "s"}.{" "}
            <Link
              href={`/search?scripture=${encodeURIComponent(book)}`}
              className="text-accent hover:text-accent/80 underline underline-offset-4">
              See them all
            </Link>
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {chapters.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-serif text-xl text-foreground mb-2">No sermons indexed for {book} yet.</p>
            <p className="font-sans text-sm text-muted-foreground">
              Spurgeon may have preached from this book — we just haven't tagged a sermon to a specific chapter.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {chapters.map((ch) => (
              <li key={ch.combo}>
                <Link
                  href={`/search?scripture_chapter=${encodeURIComponent(ch.combo)}`}
                  className="flex items-baseline justify-between gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:border-primary/40 hover:text-primary transition-all font-sans text-sm">
                  <span>
                    {ch.number != null
                      ? <>Chapter <span className="font-medium">{ch.number}</span></>
                      : <span className="font-medium">{ch.combo}</span>}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">{ch.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <FooterSection settings={shared?.footer} footerColumns={shared?.nav?.footerColumns} />
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => ({
  // Pre-render no paths; build each book on first request and cache via ISR.
  // The canonical book list is small enough that we could pre-render all 66,
  // but fallback: 'blocking' keeps cold-build time fast.
  paths: [],
  fallback: "blocking",
});

export const getStaticProps: GetStaticProps<ScriptureBookProps> = async ({ params }) => {
  const slug = (params?.book as string) || "";
  const book = bookFromSlug(slug);
  if (!book) return { notFound: true, revalidate: 3600 };

  const shared = await getSharedPageData();

  let total = 0;
  let chapters: ChapterEntry[] = [];

  if (algolia) {
    try {
      const { results } = await algolia.search({
        requests: [{
          indexName: ALGOLIA_INDEX,
          query: "",
          hitsPerPage: 0,
          facets: [CHAPTER_FACET, BOOK_FACET],
          maxValuesPerFacet: 200,
          // Restrict to this book's chapters by filtering on lvl0.
          filters: `post_type:spurgeon_sermon AND "${BOOK_FACET}":"${book}"`,
        }],
      });
      const main: any = results[0];
      total = (main?.facets?.[BOOK_FACET]?.[book] as number) || 0;
      const chapterCounts: Record<string, number> =
        (main?.facets?.[CHAPTER_FACET] || {}) as Record<string, number>;
      chapters = Object.entries(chapterCounts)
        .map(([combo, count]) => ({
          combo,
          number: chapterNumberFromCombo(combo),
          count: count as number,
        }))
        .sort((a, b) => {
          // Numeric chapter order; unknowns sink to the bottom.
          if (a.number != null && b.number != null) return a.number - b.number;
          if (a.number != null) return -1;
          if (b.number != null) return 1;
          return a.combo.localeCompare(b.combo);
        });
    } catch (err: any) {
      console.error("[ScriptureBook chapters failed]", err?.message);
    }
  }

  return {
    props: { book, totalSermons: total, chapters, shared },
    revalidate: 3600,
  };
};
