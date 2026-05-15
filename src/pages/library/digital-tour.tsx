import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import type { GetStaticProps } from "next";
import { ROUTES } from "@/lib/routes";
import { ArrowLeft, ArrowRight, QrCode, Compass } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import FooterSection from "@/components/home/FooterSection";
import TourStop from "@/components/library/TourStop";
import TourQRModal from "@/components/library/TourQRModal";
import { apolloClient, apolloPreviewClient } from "@/lib/apollo-client";
import { GET_TOUR_STOPS, GET_TOUR_STOP_BY_ID } from "@/lib/queries";
import { getSharedPageData, type SharedPageData } from "@/lib/shared-data";

interface Stop {
  id: string;
  title: string;
  subtitle: string;
  image: string | null;
  paintingDescription: string;
  narrative: string;
  quote: string;
}

interface DigitalTourProps {
  stops: Stop[];
  shared: SharedPageData;
}

export default function DigitalTour({ stops, shared }: DigitalTourProps) {
  const router = useRouter();
  const initialStop = (router.query.stop as string) || stops[0]?.id || '01';
  const initialIndex = stops.findIndex(s => s.id === initialStop);
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [qrOpen, setQrOpen] = useState(false);

  const current = stops[currentIndex];

  const prev = () => setCurrentIndex(i => Math.max(0, i - 1));
  const next = () => setCurrentIndex(i => Math.min(stops.length - 1, i + 1));

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentIndex]);

  useEffect(() => {
    if (!router.isReady) return;
    const stopParam = router.query.stop as string;
    if (stopParam) {
      const idx = stops.findIndex(s => s.id === stopParam);
      if (idx >= 0) setCurrentIndex(idx);
    }
  }, [router.isReady, router.query.stop, stops]);

  if (!current) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <Compass className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <h2 className="font-serif text-2xl text-foreground mb-2">Tour stops coming soon</h2>
          <p className="font-sans text-sm text-muted-foreground">
            The digital gallery tour is being prepared. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-foreground text-primary-foreground">
        <div className="max-w-5xl mx-auto px-6 py-10 md:py-14">
          <Link
            href={ROUTES.Library}
            className="inline-flex items-center gap-2 text-primary-foreground/50 hover:text-primary-foreground transition-colors font-sans text-sm mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to the Library
          </Link>
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Compass className="w-4 h-4 text-accent" />
                <span className="font-sans text-xs text-primary-foreground/50 uppercase tracking-widest">
                  Self-Guided Digital Tour
                </span>
              </div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground">
                The Spurgeon Gallery
              </h1>
              <p className="font-sans text-sm text-primary-foreground/50 mt-2 max-w-lg">
                Nine paintings. Nine chapters of a remarkable life. Explore each work online, or scan the QR codes in person at the Spurgeon Library.
              </p>
            </div>
            <button
              onClick={() => setQrOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary-foreground/20 text-primary-foreground/70 hover:text-primary-foreground hover:border-primary-foreground/40 font-sans text-sm transition-all">
              <QrCode className="w-4 h-4" />
              QR Code for This Stop
            </button>
          </div>

          <div className="flex gap-2 mt-8 flex-wrap">
            {stops.map((stop, i) => (
              <button
                key={stop.id}
                onClick={() => setCurrentIndex(i)}
                className={`px-3 py-1.5 rounded-full font-sans text-xs font-medium transition-all ${
                  i === currentIndex
                    ? "bg-accent text-accent-foreground"
                    : "bg-primary-foreground/10 text-primary-foreground/50 hover:bg-primary-foreground/20 hover:text-primary-foreground"
                }`}>
                {stop.id} — {stop.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <TourStop key={current.id} stop={current} />
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between">
          <button
            onClick={prev}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border font-sans text-sm text-foreground hover:border-primary/40 hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="font-sans text-sm text-muted-foreground">
            {currentIndex + 1} of {stops.length}
          </span>
          {currentIndex < stops.length - 1 ? (
            <button
              onClick={next}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-sans text-sm font-medium hover:bg-primary/90 transition-colors">
              Next Stop
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <Link
              href={ROUTES.Library}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-accent-foreground font-sans text-sm font-semibold hover:bg-accent/90 transition-colors">
              Finish Tour
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      <TourQRModal open={qrOpen} onClose={() => setQrOpen(false)} stop={current} />

      <FooterSection settings={shared.footer} footerColumns={shared.nav?.footerColumns} />
    </div>
  );
}

function reshapeTourStop(n: any): Stop {
  return {
    id: n.tourStopFields?.stopNumber || '',
    title: n.title || '',
    subtitle: n.tourStopFields?.subtitle || '',
    image: n.tourStopFields?.paintingImage?.node?.sourceUrl || null,
    paintingDescription: n.tourStopFields?.paintingDescription || '',
    narrative: n.tourStopFields?.narrative || '',
    quote: n.tourStopFields?.quote || '',
  };
}

export const getStaticProps: GetStaticProps<DigitalTourProps> = async ({ preview, previewData }) => {
  const shared = await getSharedPageData();
  let stops: Stop[] = [];

  try {
    const { data } = await apolloClient.query({ query: GET_TOUR_STOPS });
    stops = ((data as any)?.tourStops?.nodes || [])
      .map(reshapeTourStop)
      // Sort by stop_number so the navigation chips render 01, 02, 03…
      // regardless of the order WPGraphQL returns them in.
      .sort((a: Stop, b: Stop) => (a.id || '').localeCompare(b.id || ''));
  } catch (err: any) {
    console.error('[GetTourStops failed]', err?.message);
  }

  // In preview mode for a tour_stop, replace (or insert) the matching stop
  // so the editor sees their draft inline with the rest of the tour.
  const previewId = preview && (previewData as any)?.postType === 'tour_stop'
    ? (previewData as any).postId
    : null;
  if (previewId) {
    try {
      const { data } = await apolloPreviewClient().query({
        query: GET_TOUR_STOP_BY_ID,
        variables: { id: String(previewId) },
        fetchPolicy: 'no-cache',
      });
      const draft = (data as any)?.tourStop;
      if (draft) {
        const reshaped = reshapeTourStop(draft);
        const idx = stops.findIndex((s) => s.id === reshaped.id);
        if (idx >= 0) stops[idx] = reshaped;
        else stops.push(reshaped);
        // Sort by stop number so the inserted draft lands in order
        stops.sort((a, b) => (a.id || '').localeCompare(b.id || ''));
      }
    } catch (err: any) {
      console.error('[GetTourStopById preview failed]', err?.message);
    }
  }

  return { props: { stops, shared }, revalidate: 3600 };
};
