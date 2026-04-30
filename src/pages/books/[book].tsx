import React, { useState } from "react";
import Link from "next/link";
import type { GetStaticPaths, GetStaticProps } from "next";
import { ROUTES } from "@/lib/routes";
import { apolloClient } from "@/lib/apollo-client";
import {
  GET_BOOK_CHAPTERS,
  GET_BOOK_CHAPTERS_PREVIEW,
  GET_BOOK_BY_SLUG,
  GET_READER_BOOK_SLUGS,
  GET_BOOK_CHAPTER_BY_ID,
  GET_SPURGEON_BOOK_BY_ID,
} from "@/lib/queries";
import { getSharedPageData, type SharedPageData } from "@/lib/shared-data";
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import FooterSection from "@/components/home/FooterSection";
import { decodeEntities } from "@/lib/utils";

interface BookReaderProps {
  bookSlug: string;
  bookTitle: string;
  bookSubtitle: string;
  chapters: any[];
  shared: SharedPageData;
}

export default function BookReader({ bookSlug, bookTitle, bookSubtitle, chapters, shared }: BookReaderProps) {
  const [chapterIdx, setChapterIdx] = useState(0);

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

  const sorted = [...chapters].sort(
    (a, b) => (a.bookChapterFields?.chapterNumber ?? 0) - (b.bookChapterFields?.chapterNumber ?? 0)
  );
  const current = sorted[chapterIdx];

  return (
    <div className="min-h-screen bg-background">
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
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => setChapterIdx(i => Math.max(0, i - 1))}
                disabled={chapterIdx === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border font-sans text-sm hover:border-primary/40 disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="font-sans text-sm text-muted-foreground">
                Chapter {chapterIdx + 1} of {sorted.length}
              </span>
              <button
                onClick={() => setChapterIdx(i => Math.min(sorted.length - 1, i + 1))}
                disabled={chapterIdx === sorted.length - 1}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground font-sans text-sm font-medium hover:bg-primary/90 disabled:opacity-30">
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

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
          </>
        )}
      </div>

      <FooterSection settings={shared?.footer} />
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // Build paths for every spurgeon_book whose ACF chapter_filter_slug is
  // populated — that's the marker for "this book is a reader page" (vs.
  // M&E/FCB/Treasury, which have their own dedicated pages).
  try {
    const { data } = await apolloClient.query({ query: GET_READER_BOOK_SLUGS });
    const nodes = (data as any)?.spurgeonBooks?.nodes || [];
    const paths = nodes
      .filter((n: any) => !!n.spurgeonBookFields?.bookChapterFilterSlug)
      .map((n: any) => ({ params: { book: n.slug } }));
    return { paths, fallback: 'blocking' };
  } catch {
    return { paths: [], fallback: 'blocking' };
  }
};

function flat(value: any): any {
  return Array.isArray(value) ? value[0] : value;
}

export const getStaticProps: GetStaticProps<BookReaderProps> = async ({ params, preview, previewData }) => {
  const bookSlug = params?.book as string;
  const shared = await getSharedPageData();

  let bookTitle = '';
  let bookSubtitle = '';
  let chapterFilterSlug = '';

  const previewId = preview ? (previewData as any)?.postId : null;
  const previewType = preview ? (previewData as any)?.postType : null;

  // Preview mode A: spurgeon_book draft. Fetch by ID, override book metadata.
  if (previewId && previewType === 'spurgeon_book') {
    try {
      const { data } = await apolloClient.query({
        query: GET_SPURGEON_BOOK_BY_ID,
        variables: { id: String(previewId) },
        fetchPolicy: 'no-cache',
      });
      const book = (data as any)?.spurgeonBook;
      if (book) {
        bookTitle = book.title || '';
        bookSubtitle = book.spurgeonBookFields?.bookDescription || '';
        chapterFilterSlug = book.spurgeonBookFields?.bookChapterFilterSlug || '';
      }
    } catch (err: any) {
      console.error('[GetSpurgeonBookById preview failed]', err?.message);
    }
  }

  // Preview mode B: book_chapter draft. Fetch the chapter to discover its
  // book filter slug, then look up the parent book and its chapters.
  let previewChapter: any = null;
  if (previewId && previewType === 'book_chapter') {
    try {
      const { data } = await apolloClient.query({
        query: GET_BOOK_CHAPTER_BY_ID,
        variables: { id: String(previewId) },
        fetchPolicy: 'no-cache',
      });
      previewChapter = (data as any)?.bookChapter;
      if (previewChapter) {
        chapterFilterSlug = flat(previewChapter.bookChapterFields?.book) || '';
      }
    } catch (err: any) {
      console.error('[GetBookChapterById preview failed]', err?.message);
    }
  }

  // Default lookup by URL slug if we didn't already populate from preview.
  if (!bookTitle) {
    try {
      const { data } = await apolloClient.query({
        query: GET_BOOK_BY_SLUG,
        variables: { slug: bookSlug },
      });
      const book = (data as any)?.spurgeonBook;
      if (book) {
        bookTitle = book.title || '';
        bookSubtitle = book.spurgeonBookFields?.bookDescription || '';
        if (!chapterFilterSlug) {
          chapterFilterSlug = book.spurgeonBookFields?.bookChapterFilterSlug || '';
        }
      }
    } catch {
      // fall through
    }
  }

  if (!bookTitle) {
    return { notFound: true, revalidate: 60 };
  }

  // In preview mode for either book or chapter, query chapters with all
  // statuses so drafts show up alongside published.
  const chaptersQuery = (previewType === 'book_chapter' || previewType === 'spurgeon_book')
    ? GET_BOOK_CHAPTERS_PREVIEW
    : GET_BOOK_CHAPTERS;

  let chapters: any[] = [];
  if (chapterFilterSlug) {
    try {
      const { data } = await apolloClient.query({
        query: chaptersQuery,
        variables: { book: chapterFilterSlug },
        fetchPolicy: previewType ? 'no-cache' : 'cache-first',
      });
      chapters = (data as any)?.bookChapters?.nodes || [];
    } catch {
      // leave chapters empty; page shows "No chapters available yet"
    }
  }

  // If we previewed a chapter that wasn't in the list (e.g. brand-new
  // unpublished draft), splice it in.
  if (previewChapter) {
    const idx = chapters.findIndex((c) => c.databaseId === previewChapter.databaseId);
    if (idx >= 0) chapters[idx] = previewChapter;
    else chapters = [...chapters, previewChapter];
  }

  return {
    props: { bookSlug, bookTitle, bookSubtitle, chapters, shared },
    revalidate: 86400,
  };
};
