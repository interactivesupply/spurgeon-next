import React from "react";
import type { GetStaticProps } from "next";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { MapPin, Clock, Phone, Mail, ArrowRight, BookOpen, Compass, CalendarDays, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";
import FooterSection from "@/components/home/FooterSection";
import LibraryCarousel from "@/components/library/LibraryCarousel";
import LibraryStaff from "@/components/library/LibraryStaff";
import { apolloClient } from "@/lib/apollo-client";
import { GET_LIBRARY_PAGE_CONTENT } from "@/lib/queries";
import { getSharedPageData, type SharedPageData } from "@/lib/shared-data";
import { decodeEntities } from "@/lib/utils";

interface LibraryContent {
  hero: {
    eyebrow: string; titleTop: string; titleBottom: string; body: string;
    background: string | null;
    primaryLabel: string; secondaryLabel: string;
  };
  carousel: { src: string; alt: string }[];
  video: { eyebrow: string; heading: string; intro: string; url: string };
  tour: { eyebrow: string; heading: string; body: string; ctaLabel: string };
  visit: {
    eyebrow: string; heading: string; intro: string;
    locationLines: string; directionsUrl: string;
    hours: { label: string; value: string }[];
    hoursNote: string;
    phone: string; email: string;
    externalLabel: string; externalUrl: string;
    mapEmbedUrl: string;
  };
}

interface LibraryProps {
  library: LibraryContent;
  shared: SharedPageData;
}

const TOUR_PREVIEW_STOPS = [
  { num: "01", title: "The Conversion" },
  { num: "02", title: "New Park Street" },
  { num: "03", title: "The Tabernacle" },
  { num: "04", title: "The College" },
  { num: "05", title: "The Orphanage" },
  { num: "06", title: "The Legacy" },
];

function youtubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function MultilineText({ text }: { text: string | undefined | null }) {
  if (!text) return null;
  return text.split('\n').map((line, i, arr) => (
    <React.Fragment key={i}>
      {decodeEntities(line)}
      {i < arr.length - 1 && <br />}
    </React.Fragment>
  ));
}

export default function Library({ library, shared }: LibraryProps) {
  const ytId = youtubeId(library.video.url);

  return (
    <div className="min-h-screen bg-background">
      <div className="relative bg-foreground text-primary-foreground overflow-hidden">
        {library.hero.background && (
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url('${library.hero.background}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }} />
        )}
        <div className="relative max-w-5xl mx-auto px-6 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="flex items-center gap-2 mb-5">
                <BookOpen className="w-5 h-5 text-accent" />
                <span className="font-sans text-sm text-primary-foreground/50 uppercase tracking-widest">
                  {decodeEntities(library.hero.eyebrow)}
                </span>
              </div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
                {decodeEntities(library.hero.titleTop)}
                <br />
                <span className="italic font-normal text-accent">{decodeEntities(library.hero.titleBottom)}</span>
              </h1>
              <p className="font-sans text-lg text-primary-foreground/60 max-w-xl leading-relaxed mb-10">
                {decodeEntities(library.hero.body)}
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#visit"
                  onClick={e => { e.preventDefault(); document.getElementById('visit')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-full font-sans text-sm font-semibold hover:bg-accent/90 transition-colors">
                  <CalendarDays className="w-4 h-4" />
                  {decodeEntities(library.hero.primaryLabel)}
                </a>
                <Link
                  href={ROUTES.DigitalTour}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-primary-foreground/20 text-primary-foreground/80 hover:text-primary-foreground hover:border-primary-foreground/40 font-sans text-sm font-medium transition-all">
                  <Compass className="w-4 h-4" />
                  {decodeEntities(library.hero.secondaryLabel)}
                </Link>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <LibraryCarousel images={library.carousel} />
            </motion.div>
          </div>
        </div>
      </div>

      {library.video.url && (
        <div className="bg-card border-b border-border">
          <div className="max-w-4xl mx-auto px-6 py-16 md:py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10">
              <p className="font-sans text-xs tracking-[0.25em] uppercase text-muted-foreground mb-3">
                {decodeEntities(library.video.eyebrow)}
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                {decodeEntities(library.video.heading)}
              </h2>
              <p className="font-sans text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">
                {decodeEntities(library.video.intro)}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl overflow-hidden aspect-video shadow-2xl border border-border">
              <a
                href={library.video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-full rounded-2xl overflow-hidden relative group">
                {ytId && (
                  <img
                    src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`}
                    alt={library.video.heading}
                    className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <PlayCircle className="w-8 h-8 text-foreground" />
                  </div>
                </div>
              </a>
            </motion.div>
          </div>
        </div>
      )}

      <div className="bg-primary/5 border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-20">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-5">
                <Compass className="w-3.5 h-3.5 text-accent" />
                <span className="font-sans text-xs text-accent font-medium uppercase tracking-wider">
                  {decodeEntities(library.tour.eyebrow)}
                </span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                {decodeEntities(library.tour.heading)}
              </h2>
              <p className="font-sans text-muted-foreground leading-relaxed mb-6">
                {decodeEntities(library.tour.body)}
              </p>
              <Link
                href={ROUTES.DigitalTour}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-sans text-sm font-semibold hover:bg-primary/90 transition-colors">
                {decodeEntities(library.tour.ctaLabel)}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-2 gap-3">
              {TOUR_PREVIEW_STOPS.map((stop) => (
                <Link
                  key={stop.num}
                  href={ROUTES.DigitalTour + `?stop=${stop.num}`}
                  className="p-4 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-sm transition-all group">
                  <p className="font-sans text-xs text-muted-foreground mb-1">Stop {stop.num}</p>
                  <p className="font-serif text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {stop.title}
                  </p>
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      <LibraryStaff />

      <div id="visit" className="max-w-5xl mx-auto px-6 py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12">
          <p className="font-sans text-xs tracking-[0.25em] uppercase text-muted-foreground mb-3">
            {decodeEntities(library.visit.eyebrow)}
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            {decodeEntities(library.visit.heading)}
          </h2>
          <p className="font-sans text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">
            {decodeEntities(library.visit.intro)}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0 }}
            className="bg-card border border-border rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-foreground mb-3">Location</h3>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">
              <MultilineText text={library.visit.locationLines} />
            </p>
            {library.visit.directionsUrl && (
              <a
                href={library.visit.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-4 font-sans text-sm text-primary hover:underline">
                Get Directions <ArrowRight className="w-3.5 h-3.5" />
              </a>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-foreground mb-3">Hours</h3>
            <ul className="font-sans text-sm text-muted-foreground space-y-2">
              {library.visit.hours.map((row, i) => (
                <li key={i} className="flex justify-between">
                  <span>{decodeEntities(row.label)}</span>
                  <span className="text-foreground font-medium">{decodeEntities(row.value)}</span>
                </li>
              ))}
            </ul>
            {library.visit.hoursNote && (
              <p className="font-sans text-xs text-muted-foreground/70 mt-4 italic">
                {decodeEntities(library.visit.hoursNote)}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-4">
              <Mail className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-foreground mb-3">Contact</h3>
            <ul className="font-sans text-sm text-muted-foreground space-y-3">
              {library.visit.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 shrink-0" />
                  <a href={`tel:${library.visit.phone.replace(/[^0-9+]/g, '')}`} className="hover:text-primary transition-colors">
                    {library.visit.phone}
                  </a>
                </li>
              )}
              {library.visit.email && (
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 shrink-0" />
                  <a href={`mailto:${library.visit.email}`} className="hover:text-primary transition-colors">
                    {library.visit.email}
                  </a>
                </li>
              )}
            </ul>
            {library.visit.externalUrl && (
              <a
                href={library.visit.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-5 font-sans text-sm text-primary hover:underline">
                {decodeEntities(library.visit.externalLabel)} <ArrowRight className="w-3.5 h-3.5" />
              </a>
            )}
          </motion.div>
        </div>

        {library.visit.mapEmbedUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-8 rounded-2xl overflow-hidden border border-border shadow-md"
            style={{ height: 340 }}>
            <iframe
              title="MBTS Campus Map"
              src={library.visit.mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy" />
          </motion.div>
        )}
      </div>

      <FooterSection settings={shared.footer} />
    </div>
  );
}

const EMPTY_LIBRARY: LibraryContent = {
  hero: { eyebrow: '', titleTop: '', titleBottom: '', body: '', background: null, primaryLabel: '', secondaryLabel: '' },
  carousel: [],
  video: { eyebrow: '', heading: '', intro: '', url: '' },
  tour: { eyebrow: '', heading: '', body: '', ctaLabel: '' },
  visit: {
    eyebrow: '', heading: '', intro: '',
    locationLines: '', directionsUrl: '',
    hours: [], hoursNote: '',
    phone: '', email: '',
    externalLabel: '', externalUrl: '', mapEmbedUrl: '',
  },
};

export const getStaticProps: GetStaticProps<LibraryProps> = async () => {
  const shared = await getSharedPageData();
  let library: LibraryContent = EMPTY_LIBRARY;

  try {
    const { data } = await apolloClient.query({ query: GET_LIBRARY_PAGE_CONTENT });
    const f = (data as any)?.page?.libraryPageFields;
    if (f) {
      library = {
        hero: {
          eyebrow: f.libHeroEyebrow || '',
          titleTop: f.libHeroTitleTop || '',
          titleBottom: f.libHeroTitleBottom || '',
          body: f.libHeroBody || '',
          background: f.libHeroBackground?.node?.sourceUrl || null,
          primaryLabel: f.libHeroPrimaryLabel || '',
          secondaryLabel: f.libHeroSecondaryLabel || '',
        },
        carousel: (f.libCarouselImages || [])
          .map((c: any) => ({
            src: c.image?.node?.sourceUrl || '',
            alt: c.alt || c.image?.node?.altText || 'Library',
          }))
          .filter((c: any) => c.src),
        video: {
          eyebrow: f.libVideoEyebrow || '',
          heading: f.libVideoHeading || '',
          intro: f.libVideoIntro || '',
          url: f.libVideoUrl || '',
        },
        tour: {
          eyebrow: f.libTourEyebrow || '',
          heading: f.libTourHeading || '',
          body: f.libTourBody || '',
          ctaLabel: f.libTourCtaLabel || '',
        },
        visit: {
          eyebrow: f.libVisitEyebrow || '',
          heading: f.libVisitHeading || '',
          intro: f.libVisitIntro || '',
          locationLines: f.libVisitLocationLines || '',
          directionsUrl: f.libVisitDirectionsUrl || '',
          hours: f.libVisitHours || [],
          hoursNote: f.libVisitHoursNote || '',
          phone: f.libVisitPhone || '',
          email: f.libVisitEmail || '',
          externalLabel: f.libVisitExternalLabel || '',
          externalUrl: f.libVisitExternalUrl || '',
          mapEmbedUrl: f.libVisitMapEmbedUrl || '',
        },
      };
    }
  } catch (err: any) {
    console.error('[GetLibraryPageContent failed]', err?.message);
  }

  return { props: { library, shared }, revalidate: 3600 };
};
