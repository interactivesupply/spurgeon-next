import React, { useState } from "react";
import Link from "next/link";
import type { GetStaticPaths, GetStaticProps } from "next";
import { ROUTES } from "@/lib/routes";
import { apolloClient } from "@/lib/apollo-client";
import { GET_BOOK_CHAPTERS } from "@/lib/queries";
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import FooterSection from "@/components/home/FooterSection";

const BOOK_META: Record<string, { title: string; metaSlug: string; subtitle: string }> = {
  "all-of-grace": {
    title: "All of Grace",
    metaSlug: "all_of_grace",
    subtitle: "An earnest word with those who are seeking salvation.",
  },
  "lectures-to-my-students": {
    title: "Lectures to My Students",
    metaSlug: "lectures_to_my_students",
    subtitle: "Practical wisdom on preaching, ministry, and pastoral life.",
  },
  "around-the-wicket-gate": {
    title: "Around the Wicket Gate",
    metaSlug: "around_the_wicket_gate",
    subtitle: "A friendly talk with seekers concerning the gate of salvation.",
  },
  "an-all-round-ministry": {
    title: "An All-Round Ministry",
    metaSlug: "an_all_round_ministry",
    subtitle: "Addresses to ministers and students from Spurgeon's conferences.",
  },
  autobiography: {
    title: "Autobiography of Charles H. Spurgeon",
    metaSlug: "autobiography",
    subtitle: "The life story of Spurgeon in his own words.",
  },
};

interface BookReaderProps {
  bookSlug: string;
  chapters: any[];
}

export default function BookReader({ bookSlug, chapters }: BookReaderProps) {
  const [chapterIdx, setChapterIdx] = useState(0);
  const meta = BOOK_META[bookSlug];

  if (!meta) {
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
            {meta.title}
          </h1>
          <p className="font-sans text-primary-foreground/50 text-base max-w-xl">
            {meta.subtitle}
          </p>
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
                <h2 className="font-serif text-3xl font-bold text-foreground mb-6">{current.title}</h2>
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

      <FooterSection />
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: Object.keys(BOOK_META).map((slug) => ({ params: { book: slug } })),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps<BookReaderProps> = async ({ params }) => {
  const bookSlug = params?.book as string;
  const meta = BOOK_META[bookSlug];
  if (!meta) return { notFound: true };

  try {
    const { data } = await apolloClient.query({
      query: GET_BOOK_CHAPTERS,
      variables: { book: meta.metaSlug },
    });
    return {
      props: {
        bookSlug,
        chapters: (data as any)?.bookChapters?.nodes || [],
      },
      revalidate: 86400,
    };
  } catch {
    return {
      props: { bookSlug, chapters: [] },
      revalidate: 60,
    };
  }
};
