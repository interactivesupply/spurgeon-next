import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLazyQuery } from "@apollo/client/react";
import { ROUTES } from "@/lib/routes";
import { GET_TREASURY_VERSES } from "@/lib/queries";
import { ArrowLeft, ScrollText } from "lucide-react";
import FooterSection from "@/components/home/FooterSection";

const PSALMS = Array.from({ length: 150 }, (_, i) => i + 1);

export default function TreasuryOfDavid() {
  const [psalm, setPsalm] = useState(1);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);

  const [fetchVerses, { data, loading }] = useLazyQuery(GET_TREASURY_VERSES);
  const verses: any[] = (data as any)?.treasuryEntries?.nodes || [];

  useEffect(() => {
    fetchVerses({ variables: { psalm } });
    setSelectedVerse(null);
  }, [psalm, fetchVerses]);

  const sortedVerses = [...verses].sort(
    (a, b) => (a.treasuryEntryFields?.verse ?? 0) - (b.treasuryEntryFields?.verse ?? 0)
  );

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

                {currentEntry && (
                  <div className="bg-card border border-border rounded-2xl p-8">
                    {currentEntry.treasuryEntryFields?.verseText && (
                      <p className="font-serif text-base italic text-primary/80 mb-6 border-l-2 border-accent pl-4">
                        {currentEntry.treasuryEntryFields.verseText}
                      </p>
                    )}
                    {currentEntry.content && (
                      <>
                        <h3 className="font-serif text-lg font-bold text-foreground mb-3">Exposition</h3>
                        <div
                          className="sermon-content font-charter text-lg text-foreground/80 leading-relaxed mb-6"
                          dangerouslySetInnerHTML={{ __html: currentEntry.content }} />
                      </>
                    )}
                    {currentEntry.treasuryEntryFields?.illustrations && (
                      <>
                        <h3 className="font-serif text-lg font-bold text-foreground mb-3">Illustrations</h3>
                        <div
                          className="sermon-content font-sans text-sm text-muted-foreground leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: currentEntry.treasuryEntryFields.illustrations }} />
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <FooterSection />
    </div>
  );
}
