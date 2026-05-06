import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import type { GetStaticProps } from "next";
import { useLazyQuery } from "@apollo/client/react";
import { ROUTES } from "@/lib/routes";
import { GET_TREASURY_VERSES, GET_TREASURY_ENTRY_BY_ID } from "@/lib/queries";
import { ArrowLeft, ScrollText } from "lucide-react";
import FooterSection from "@/components/home/FooterSection";
import { getSharedPageData, type SharedPageData } from "@/lib/shared-data";

const PSALMS = Array.from({ length: 150 }, (_, i) => i + 1);

interface PageProps {
  shared: SharedPageData;
  previewEntry?: any | null;
}

export default function TreasuryOfDavid({ shared, previewEntry }: PageProps) {
  const router = useRouter();
  // When previewing, default to the previewed entry's psalm and verse.
  const initialPsalm = previewEntry?.treasuryEntryFields?.psalm || 1;
  const initialVerse = previewEntry?.treasuryEntryFields?.verse ?? null;
  const [psalm, setPsalm] = useState<number>(Number(initialPsalm) || 1);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(initialVerse);

  const [fetchVerses, { data, loading }] = useLazyQuery(GET_TREASURY_VERSES);
  const verses: any[] = (data as any)?.treasuryEntries?.nodes || [];

  // Honor ?psalm=N&verse=N query params (used by search-result deep links).
  useEffect(() => {
    if (!router.isReady) return;
    const p = router.query.psalm;
    const v = router.query.verse;
    if (typeof p === 'string') {
      const n = parseInt(p, 10);
      if (n >= 1 && n <= 150) setPsalm(n);
    }
    if (typeof v === 'string') {
      const n = parseInt(v, 10);
      if (Number.isFinite(n)) setSelectedVerse(n);
    }
  }, [router.isReady, router.query.psalm, router.query.verse]);

  useEffect(() => {
    fetchVerses({ variables: { psalm: String(psalm) } });
    // Don't reset selectedVerse here if the URL is driving it; let the URL
    // effect above stay in control.
    if (!previewEntry && !router.query.verse) setSelectedVerse(null);
  }, [psalm, fetchVerses, previewEntry, router.query.verse]);

  // If we're previewing a draft entry on this psalm, splice it into the
  // sorted verses so the navigator highlights it.
  let sortedVerses = [...verses].sort(
    (a, b) => (a.treasuryEntryFields?.verse ?? 0) - (b.treasuryEntryFields?.verse ?? 0)
  );
  if (previewEntry && Number(previewEntry.treasuryEntryFields?.psalm) === psalm) {
    const idx = sortedVerses.findIndex(
      (v) => v.treasuryEntryFields?.verse === previewEntry.treasuryEntryFields?.verse
    );
    if (idx >= 0) sortedVerses[idx] = previewEntry;
    else sortedVerses = [...sortedVerses, previewEntry].sort(
      (a, b) => (a.treasuryEntryFields?.verse ?? 0) - (b.treasuryEntryFields?.verse ?? 0)
    );
  }

  const currentEntry = selectedVerse !== null
    ? sortedVerses.find((v) => v.treasuryEntryFields?.verse === selectedVerse)
    : sortedVerses[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-foreground text-primary-foreground">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <Link
            href={ROUTES.Books}
            className="inline-flex items-center gap-1.5 text-primary-foreground/40 hover:text-primary-foreground transition-colors font-sans text-sm mb-8">
            <ArrowLeft className="w-4 h-4" />
            All Books
          </Link>
          <div className="flex items-center gap-2 mb-3">
            <ScrollText className="w-5 h-5 text-accent" />
            <span className="font-sans text-xs text-primary-foreground/40 uppercase tracking-widest">Biblical Commentary</span>
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-primary-foreground mb-3">
            The Treasury of David
          </h1>
          <p className="font-sans text-primary-foreground/50 text-base max-w-xl">
            Spurgeon's monumental commentary on all 150 Psalms.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-[200px_1fr] gap-8">
          <aside className="md:sticky md:top-24 self-start">
            <h3 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-3">Psalm</h3>
            <div className="grid grid-cols-6 md:grid-cols-3 gap-1.5 max-h-[60vh] overflow-y-auto">
              {PSALMS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPsalm(p)}
                  className={`px-2 py-1.5 rounded-md font-sans text-xs transition-colors ${
                    p === psalm
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          </aside>

          <div>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-4">Psalm {psalm}</h2>

            {loading ? (
              <div className="h-48 bg-muted rounded animate-pulse" />
            ) : sortedVerses.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <ScrollText className="w-10 h-10 text-muted-foreground/20 mx-auto mb-4" />
                <p className="font-serif text-lg text-foreground mb-2">Psalm {psalm} not yet available</p>
                <p className="font-sans text-sm text-muted-foreground">This psalm's exposition is being added to the library.</p>
              </div>
            ) : (
              <>
                {/* Per-verse navigator: only show when this Psalm has multiple
                    legacy per-verse records. New per-Psalm imports are a
                    single record covering the whole Psalm. */}
                {sortedVerses.length > 1 && sortedVerses.some((v) => v.treasuryEntryFields?.verse) && (
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {sortedVerses.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVerse(v.treasuryEntryFields?.verse)}
                        className={`px-2.5 py-1 rounded-md font-sans text-xs transition-colors ${
                          currentEntry?.id === v.id
                            ? "bg-accent text-accent-foreground"
                            : "bg-card border border-border text-muted-foreground hover:text-foreground"
                        }`}>
                        v.{v.treasuryEntryFields?.verse}
                      </button>
                    ))}
                  </div>
                )}

                {currentEntry && (
                  <div className="bg-card border border-border rounded-2xl p-8">
                    {currentEntry.treasuryEntryFields?.verseText && (
                      <p className="font-serif text-base italic text-primary/80 mb-6 border-l-2 border-accent pl-4">
                        {currentEntry.treasuryEntryFields.verseText}
                      </p>
                    )}
                    {currentEntry.content && (
                      <div
                        className="sermon-content font-charter text-[22px] text-foreground/85 leading-[1.8]"
                        dangerouslySetInnerHTML={{ __html: currentEntry.content }} />
                    )}
                    {currentEntry.treasuryEntryFields?.illustrations && (
                      <div className="mt-8">
                        <h3 className="font-serif text-lg font-bold text-foreground mb-3">Illustrations</h3>
                        <div
                          className="sermon-content font-sans text-sm text-muted-foreground leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: currentEntry.treasuryEntryFields.illustrations }} />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <FooterSection settings={shared?.footer} footerColumns={shared?.nav?.footerColumns} />
    </div>
  );
}

export const getStaticProps: GetStaticProps<PageProps> = async ({ preview, previewData }) => {
  const shared = await getSharedPageData();
  let previewEntry: any = null;
  const previewId = preview && (previewData as any)?.postType === 'treasury_entry'
    ? (previewData as any).postId
    : null;
  if (previewId) {
    try {
      const { apolloPreviewClient } = await import('@/lib/apollo-client');
      const { data } = await apolloPreviewClient().query({
        query: GET_TREASURY_ENTRY_BY_ID,
        variables: { id: String(previewId) },
        fetchPolicy: 'no-cache',
      });
      previewEntry = (data as any)?.treasuryEntry || null;
    } catch (err: any) {
      console.error('[GetTreasuryEntryById preview failed]', err?.message);
    }
  }
  return { props: { shared, previewEntry }, revalidate: 3600 };
};
