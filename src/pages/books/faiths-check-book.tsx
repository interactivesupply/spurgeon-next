import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLazyQuery } from "@apollo/client/react";
import { ROUTES } from "@/lib/routes";
import { GET_FCB_ENTRY } from "@/lib/queries";
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import DevotionalSubscribeBox from "@/components/books/DevotionalSubscribeBox";
import FooterSection from "@/components/home/FooterSection";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function todayKey() {
  const d = new Date();
  return { month: MONTHS[d.getMonth()], day: d.getDate() };
}

export default function FaithsCheckBook() {
  const { month: initMonth, day: initDay } = todayKey();
  const [month, setMonth] = useState(initMonth);
  const [day, setDay] = useState(initDay);

  const [fetchEntry, { data, loading }] = useLazyQuery(GET_FCB_ENTRY);
  const entry: any = (data as any)?.devotionalEntries?.nodes?.[0];

  useEffect(() => {
    fetchEntry({ variables: { month, day: String(day) } });
  }, [month, day, fetchEntry]);

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
            <BookOpen className="w-5 h-5 text-accent" />
            <span className="font-sans text-xs text-primary-foreground/40 uppercase tracking-widest">Daily Devotional</span>
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-primary-foreground mb-3">
            Faith's Check Book
          </h1>
          <p className="font-sans text-primary-foreground/50 text-base max-w-xl">
            365 daily promises from Scripture, opened and applied by Spurgeon.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center gap-2 mb-8">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
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
          <button onClick={() => navigate(1)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="h-6 bg-muted rounded animate-pulse w-1/3" />
            <div className="h-48 bg-muted rounded animate-pulse" />
          </div>
        ) : entry ? (
          <div className="bg-card border border-border rounded-2xl p-8 mb-8">
            {entry.devotionalEntryFields?.scripture && (
              <p className="font-serif text-base italic text-primary/80 mb-6 border-l-2 border-accent pl-4">
                {entry.devotionalEntryFields.scripture}
              </p>
            )}
            {entry.title && (
              <h2 className="font-serif text-xl font-bold text-foreground mb-4">{entry.title}</h2>
            )}
            {entry.content && (
              <div
                className="sermon-content font-charter text-[22px] text-foreground/80 leading-loose"
                dangerouslySetInnerHTML={{ __html: entry.content }} />
            )}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-12 text-center mb-8">
            <BookOpen className="w-10 h-10 text-muted-foreground/20 mx-auto mb-4" />
            <p className="font-serif text-lg text-foreground mb-2">No entry yet for {month} {day}</p>
            <p className="font-sans text-sm text-muted-foreground">This devotional content is being added to the library.</p>
          </div>
        )}

        <DevotionalSubscribeBox devotional="faiths_check_book" periods={["daily"]} />
      </div>

      <FooterSection />
    </div>
  );
}
