import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import type { GetStaticProps } from "next";
import { useQuery } from "@apollo/client/react";
import { ROUTES } from "@/lib/routes";
import { GET_DEVOTIONAL_ENTRY, GET_ME_ENTRY_BY_ID } from "@/lib/queries";
import { ArrowLeft, Sun, Moon, ChevronLeft, ChevronRight } from "lucide-react";
import DevotionalSubscribeBox from "@/components/books/DevotionalSubscribeBox";
import FooterSection from "@/components/home/FooterSection";
import { getSharedPageData, type SharedPageData } from "@/lib/shared-data";
import { decodeEntities } from "@/lib/utils";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function todayKey() {
  const d = new Date();
  return { month: MONTHS[d.getMonth()], day: d.getDate() };
}

interface PageProps {
  shared: SharedPageData;
  /** When set, the page renders this draft instead of the date-picker entry. */
  previewEntry?: any | null;
}

export default function MorningAndEvening({ shared, previewEntry }: PageProps) {
  const router = useRouter();
  const { month: initMonth, day: initDay } = todayKey();
  const [month, setMonth] = useState(initMonth);
  const [day, setDay] = useState(initDay);
  const [period, setPeriod] = useState<"morning" | "evening">("morning");

  // Honor ?month=&day=&period= query params (used by /devotionals/<slug>
  // redirects so deep links open to the right entry).
  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query;
    if (typeof q.month === 'string' && MONTHS.includes(q.month)) setMonth(q.month);
    if (typeof q.day === 'string') {
      const d = parseInt(q.day, 10);
      if (d >= 1 && d <= 31) setDay(d);
    }
    if (q.period === 'morning' || q.period === 'evening') setPeriod(q.period);
  }, [router.isReady, router.query]);

  // Fetch the entry whenever month/day/period changes. Skip on the very
  // first render until the router has parsed any ?month=&day=&period= params
  // to avoid querying with the wrong date before URL params hydrate.
  // cache-and-network: show a cached result immediately if available, but
  // always issue a network request so newly-added content appears without
  // requiring a hard reload.
  const { data, loading } = useQuery(GET_DEVOTIONAL_ENTRY, {
    variables: { month, day: String(day), period },
    skip: !router.isReady,
    fetchPolicy: 'cache-and-network',
  });
  const entry: any = previewEntry || (data as any)?.morningAndEveningEntries?.nodes?.[0];

  const daysInMonth = new Date(2024, MONTHS.indexOf(month) + 1, 0).getDate();

  const navigate = (dir: number) => {
    let newDay = day + dir;
    let newMonth = month;
    if (newDay < 1) {
      const mIdx = MONTHS.indexOf(month) - 1;
      newMonth = MONTHS[(mIdx + 12) % 12];
      newDay = new Date(2024, mIdx + 1, 0).getDate();
    } else if (newDay > daysInMonth) {
      newMonth = MONTHS[(MONTHS.indexOf(month) + 1) % 12];
      newDay = 1;
    }
    setMonth(newMonth);
    setDay(newDay);
  };

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
          <div className="flex items-center gap-2 mb-3">
            <Sun className="w-5 h-5 text-accent" />
            <span className="font-sans text-xs text-primary-foreground/40 uppercase tracking-widest">Daily Devotional</span>
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-primary-foreground mb-3">
            Morning and Evening
          </h1>
          <p className="font-sans text-primary-foreground/50 text-base max-w-xl">
            Two readings for every day of the year by C.H. Spurgeon.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-2">
              <select
                value={month}
                onChange={(e) => { setMonth(e.target.value); setDay(1); }}
                className="bg-card border border-border rounded-lg px-2 py-1.5 font-sans text-sm text-foreground outline-none">
                {MONTHS.map((m) => <option key={m}>{m}</option>)}
              </select>
              <select
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                className="bg-card border border-border rounded-lg px-2 py-1.5 font-sans text-sm text-foreground outline-none w-16">
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <button onClick={() => navigate(1)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="flex rounded-lg overflow-hidden border border-border">
            <button
              onClick={() => setPeriod("morning")}
              className={`flex items-center gap-1.5 px-4 py-2 font-sans text-sm font-medium transition-colors ${
                period === "morning" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
              }`}>
              <Sun className="w-3.5 h-3.5" />
              Morning
            </button>
            <button
              onClick={() => setPeriod("evening")}
              className={`flex items-center gap-1.5 px-4 py-2 font-sans text-sm font-medium transition-colors border-l border-border ${
                period === "evening" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
              }`}>
              <Moon className="w-3.5 h-3.5" />
              Evening
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="h-6 bg-muted rounded animate-pulse w-1/3" />
            <div className="h-48 bg-muted rounded animate-pulse" />
          </div>
        ) : entry ? (
          <div className="bg-card border border-border rounded-2xl p-8 mb-8">
            {entry.morningAndEveningFields?.scripture && (
              <p className="font-serif text-base italic text-primary/80 mb-6 border-l-2 border-accent pl-4">
                {entry.morningAndEveningFields.scripture}
              </p>
            )}
            {entry.title && (
              <h2 className="font-serif text-xl font-bold text-foreground mb-4">{decodeEntities(entry.title)}</h2>
            )}
            {entry.content && (
              <div
                className="sermon-content font-charter text-[22px] text-foreground/80 leading-loose"
                dangerouslySetInnerHTML={{ __html: entry.content }} />
            )}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-12 text-center mb-8">
            <Sun className="w-10 h-10 text-muted-foreground/20 mx-auto mb-4" />
            <p className="font-serif text-lg text-foreground">No entry for {month} {day}</p>
          </div>
        )}

        <DevotionalSubscribeBox
          devotional="morning_and_evening"
          periods={["morning", "evening", "both"]} />
      </div>

      <FooterSection settings={shared?.footer} footerColumns={shared?.nav?.footerColumns} />
    </div>
  );
}

export const getStaticProps: GetStaticProps<PageProps> = async ({ preview, previewData }) => {
  const shared = await getSharedPageData();
  let previewEntry: any = null;
  const previewId = preview && (previewData as any)?.postType === 'morning_and_evening'
    ? (previewData as any).postId
    : null;
  if (previewId) {
    try {
      const { apolloPreviewClient } = await import('@/lib/apollo-client');
      const { data } = await apolloPreviewClient().query({
        query: GET_ME_ENTRY_BY_ID,
        variables: { id: String(previewId) },
        fetchPolicy: 'no-cache',
      });
      previewEntry = (data as any)?.morningAndEveningEntry || null;
    } catch (err: any) {
      console.error('[GetMorningAndEveningEntryById preview failed]', err?.message);
    }
  }
  return { props: { shared, previewEntry }, revalidate: 3600 };
};
