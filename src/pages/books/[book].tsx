import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import type { GetStaticPaths, GetStaticProps } from "next";
import { ROUTES } from "@/lib/routes";
import { apolloClient, apolloPreviewClient } from "@/lib/apollo-client";
import { GET_BOOK_BY_SLUG, GET_SPURGEON_BOOK_BY_ID } from "@/lib/queries";
import {
  BOOK_CPT_BY_SLUG,
  BOOK_SLUG_BY_POST_TYPE,
  chaptersQueryFor,
  chapterByIdQueryFor,
} from "@/lib/books";
import { getSharedPageData, type SharedPageData } from "@/lib/shared-data";
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import FooterSection from "@/components/home/FooterSection";
import { decodeEntities } from "@/lib/utils";
import PageHead, { descriptionFromHtml } from "@/components/PageHead";

interface BookReaderProps {
  bookSlug: string;
  bookTitle: string;
  bookSubtitle: string;
  chapters: any[];
  shared: SharedPageData;
}

export default function BookReader({ bookSlug, bookTitle, bookSubtitle, chapters, shared }: BookReaderProps) {
  const router = useRouter();
  const [chapterIdx, setChapterIdx] = useState(0);

  // Honor ?chapter=N query parameter (used by search-result deep links to
  // open directly to a specific chapter). Sets the index after chapters are
  // sorted by chapter_number; the first chapter is index 0 = chapter 1.
  const sorted = [...chapters].sort(
    (a, b) => (a.bookChapterFields?.chapterNumber ?? 0) - (b.bookChapterFields?.chapterNumber ?? 0)
  );
  useEffect(() => {
    if (!router.isReady || sorted.length === 0) return;
    const ch = router.query.chapter;
    if (typeof ch === 'string') {
      const n = parseInt(ch, 10);
      if (Number.isFinite(n)) {
        const idx = sorted.findIndex(c => Number(c.bookChapterFields?.chapterNumber) === n);
        if (idx >= 0) setChapterIdx(idx);
      }
    }
    // We intentionally only run this when the URL changes; chapter list is
    // stable for a given page render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.chapter]);

  if (!bookTitle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <h2 className="font-serif text-2xl text-foreground mb-2">Book not found</h2>
          <Link href={ROUTES.Books} className="font-sans text-sm text-primary hover:underline">
            All books
          </Link>
        </div>
      </div>
    );
  }

  const current = sorted[chapterIdx];
  const cleanBookTitle = decodeEntities(bookTitle);
  // For the canonical, drop the ?chapter= param so all chapter views
  // canonicalize to the book's root page. Otherwise every chapter URL
  // creates its own canonical, fragmenting link equity.
  // Use just the book title when no chapter is selected OR the chapter
  // title is effectively the same as the book name (common for short
  // works where chapter 1's title repeats the book title).
  const chapterTitleClean = current?.title ? decodeEntities(current.title) : "";
  const sameAsBook =
    chapterTitleClean.toLowerCase().replace(/[^a-z0-9]/g, "") ===
    cleanBookTitle.toLowerCase().replace(/[^a-z0-9]/g, "");
  const pageTitle = chapterTitleClean && !sameAsBook
    ? `${chapterTitleClean} — ${cleanBookTitle}`
    : cleanBookTitle;
  const description = current?.content
    ? descriptionFromHtml(current.content, 155)
    : (bookSubtitle ? decodeEntities(bookSubtitle) : `${cleanBookTitle} by C. H. Spurgeon, hosted at The Spurgeon Library.`);

  return (
    <div className="min-h-screen bg-background">
      <PageHead
        title={pageTitle}
        description={description}
        canonicalPath={`/books/${bookSlug}`}
        type="article"
        article={{
          author: "C. H. Spurgeon",
          section: cleanBookTitle,
        }}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Book",
          name: cleanBookTitle,
          author: { "@type": "Person", name: "C. H. Spurgeon" },
          publisher: { "@type": "Organization", name: "The Spurgeon Library" },
          numberOfPages: sorted.length,
        }}
      />
      <div className="bg-foreground text-primary-foreground">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <Link
            href={ROUTES.Books}
            className="inline-flex items-center gap-1.5 text-primary-foreground/40 hover:text-primary-foreground transition-colors font-sans text-sm mb-8">
            <ArrowLeft className="w-4 h-4" />
            All Books
          </Link>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-primary-foreground mb-3">
            {decodeEntities(bookTitle)}
          </h1>
          {bookSubtitle && (
            <p className="font-sans text-primary-foreground/50 text-base max-w-xl">
              {decodeEntities(bookSubtitle)}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {sorted.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <BookOpen className="w-10 h-10 text-muted-foreground/20 mx-auto mb-4" />
            <p className="font-serif text-lg text-foreground mb-2">No chapters available yet</p>
            <p className="font-sans text-sm text-muted-foreground">
              This book is being added to the library.
            </p>
          </div>
        ) : (
          <>
            {/*
              Gleanings reads as a devotional collection rather than a
              chaptered book — 100 short reflections that don't have a
              meaningful linear ordering. Showing a 100-option dropdown
              and chapter numbers feels overwhelming and "book-like"
              (Userback #7692117). For this CPT we drop the dropdown
              and present a simple devotional flow: prev / position /
              next.
            */}
            {bookSlug === 'gleanings-among-the-sheaves' ? (
              <div className="flex items-center justify-between gap-3 mb-8">
                <button
                  onClick={() => setChapterIdx(i => Math.max(0, i - 1))}
                  disabled={chapterIdx === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border font-sans text-sm hover:border-primary/40 disabled:opacity-30 flex-shrink-0">
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <span className="font-sans text-sm text-muted-foreground">
                  Reflection {chapterIdx + 1} of {sorted.length}
                </span>
                <button
                  onClick={() => setChapterIdx(i => Math.min(sorted.length - 1, i + 1))}
                  disabled={chapterIdx === sorted.length - 1}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground font-sans text-sm font-medium hover:bg-primary/90 disabled:opacity-30 flex-shrink-0">
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 mb-8">
                <button
                  onClick={() => setChapterIdx(i => Math.max(0, i - 1))}
                  disabled={chapterIdx === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border font-sans text-sm hover:border-primary/40 disabled:opacity-30 flex-shrink-0">
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <select
                  value={chapterIdx}
                  onChange={(e) => setChapterIdx(Number(e.target.value))}
                  className="flex-1 min-w-0 bg-card border border-border rounded-lg px-3 py-2 font-sans text-sm text-foreground outline-none focus:border-primary/40 max-w-md">
                  {sorted.map((c, i) => {
                    const num = c.bookChapterFields?.chapterNumber ?? i + 1;
                    const title = decodeEntities(c.title || `Chapter ${num}`);
                    return (
                      <option key={c.databaseId ?? i} value={i}>
                        {num}. {title}
                      </option>
                    );
                  })}
                </select>
                <button
                  onClick={() => setChapterIdx(i => Math.min(sorted.length - 1, i + 1))}
                  disabled={chapterIdx === sorted.length - 1}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground font-sans text-sm font-medium hover:bg-primary/90 disabled:opacity-30 flex-shrink-0">
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {current && (
              <article>
                <h2 className="font-serif text-3xl font-bold text-foreground mb-6">{decodeEntities(current.title)}</h2>
                {current.content && (
                  <div
                    className="sermon-content font-charter text-[22px] text-foreground/85 leading-[1.8]"
                    dangerouslySetInnerHTML={{ __html: current.content }} />
                )}
              </article>
            )}

            {/* Duplicate prev/next nav at the bottom so readers don't have
                to scroll back to the top after finishing a chapter
                (Userback #7654243). */}
            <div className="flex items-center justify-between gap-3 mt-12 pt-8 border-t border-border">
              <button
                onClick={() => {
                  setChapterIdx(i => Math.max(0, i - 1));
                  if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={chapterIdx === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border font-sans text-sm hover:border-primary/40 disabled:opacity-30 flex-shrink-0">
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="font-sans text-sm text-muted-foreground">
                {chapterIdx + 1} of {sorted.length}
              </span>
              <button
                onClick={() => {
                  setChapterIdx(i => Math.min(sorted.length - 1, i + 1));
                  if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={chapterIdx === sorted.length - 1}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground font-sans text-sm font-medium hover:bg-primary/90 disabled:opacity-30 flex-shrink-0">
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>

      <FooterSection settings={shared?.footer} footerColumns={shared?.nav?.footerColumns} />
    </div>
  );
}

/**
 * Pre-build the static paths for every per-book reader page. The five book
 * CPTs are known up front (see lib/books.ts); other slugs that land here
 * (e.g. typos) fall through `notFound`.
 */
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: Object.keys(BOOK_CPT_BY_SLUG).map(book => ({ params: { book } })),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps<BookReaderProps> = async ({ params, preview, previewData }) => {
  const bookSlug = params?.book as string;
  const shared = await getSharedPageData();

  // Identify the per-book CPT this URL maps to. If unknown, 404.
  const cfg = BOOK_CPT_BY_SLUG[bookSlug];
  if (!cfg) {
    return { notFound: true, revalidate: 60 };
  }

  let bookTitle = '';
  let bookSubtitle = '';

  const previewId = preview ? (previewData as any)?.postId : null;
  const previewType = preview ? (previewData as any)?.postType : null;

  // Preview mode A: a spurgeon_book draft (the catalog metadata page). Use
  // its content to override the reader header. Editors typically don't
  // preview this one but it's harmless to support.
  if (previewId && previewType === 'spurgeon_book') {
    try {
      const { data } = await apolloPreviewClient().query({
        query: GET_SPURGEON_BOOK_BY_ID,
        variables: { id: String(previewId) },
        fetchPolicy: 'no-cache',
      });
      const book = (data as any)?.spurgeonBook;
      if (book) {
        bookTitle = book.title || '';
        bookSubtitle = book.spurgeonBookFields?.bookDescription || '';
      }
    } catch (err: any) {
      console.error('[GetSpurgeonBookById preview failed]', err?.message);
    }
  }

  // Preview mode B: a chapter draft for THIS book's CPT. Splice it into the
  // chapter list so the editor sees their changes inline.
  let previewChapter: any = null;
  if (previewId && previewType === cfg.postType) {
    try {
      const { data } = await apolloPreviewClient().query({
        query: chapterByIdQueryFor(cfg),
        variables: { id: String(previewId) },
        fetchPolicy: 'no-cache',
      });
      previewChapter = (data as any)?.[cfg.graphqlSingle] || null;
    } catch (err: any) {
      console.error(`[${cfg.graphqlSingle} preview failed]`, err?.message);
    }
  }

  // Default lookup of book metadata by slug — works regardless of preview state.
  if (!bookTitle) {
    try {
      const { data } = await apolloClient.query({
        query: GET_BOOK_BY_SLUG,
        variables: { slug: bookSlug },
      });
      const book = (data as any)?.spurgeonBook;
      if (book) {
        bookTitle = book.title || cfg.displayName;
        bookSubtitle = book.spurgeonBookFields?.bookDescription || '';
      }
    } catch {
      // fall through; we'll use the displayName as the title.
    }
  }
  if (!bookTitle) bookTitle = cfg.displayName;

  // Fetch all chapters for this book's CPT.
  let chapters: any[] = [];
  try {
    // In preview mode, an authenticated client lets unpublished chapters
    // surface; otherwise the public client is fine.
    const client = previewType === cfg.postType ? apolloPreviewClient() : apolloClient;
    const { data } = await client.query({
      query: chaptersQueryFor(cfg),
      fetchPolicy: previewType === cfg.postType ? 'no-cache' : 'cache-first',
    });
    chapters = (data as any)?.[cfg.graphqlPlural]?.nodes || [];
  } catch (err: any) {
    console.error(`[${cfg.graphqlPlural} fetch failed]`, err?.message);
  }

  // If we previewed a chapter that wasn't in the published list (brand new draft),
  // splice it in.
  if (previewChapter) {
    const idx = chapters.findIndex((c: any) => c.databaseId === previewChapter.databaseId);
    if (idx >= 0) chapters[idx] = previewChapter;
    else chapters = [...chapters, previewChapter];
  }

  return {
    props: { bookSlug, bookTitle, bookSubtitle, chapters, shared },
    revalidate: 86400,
  };
};
