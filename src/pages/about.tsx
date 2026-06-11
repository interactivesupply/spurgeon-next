import React, { useState } from "react";
import type { GetStaticProps } from "next";
import { motion } from "framer-motion";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { ArrowLeft, ArrowRight, BookOpen, PlayCircle } from "lucide-react";
import FooterSection from "@/components/home/FooterSection";
import TimelineSection from "@/components/home/TimelineSection";
import { apolloClient } from "@/lib/apollo-client";
import { GET_ABOUT_PAGE_CONTENT } from "@/lib/queries";
import { getSharedPageData, type SharedPageData } from "@/lib/shared-data";
import { decodeEntities } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import PageHead from "@/components/PageHead";
import VideoModal from "@/components/conference-media/VideoModal";

interface AboutSection {
  title: string;
  body: string;
  quote?: string | null;
  quoteAuthor?: string | null;
  floatsPortrait?: boolean;
}

interface AboutContent {
  hero: {
    eyebrow: string;
    titleTop: string;
    titleBottom: string;
    body: string;
    portrait: string | null;
    portraitCaption: string;
  };
  video: {
    label: string;
    url: string;
    thumb: string | null;
  };
  sections: AboutSection[];
  captionPortrait: {
    image: string | null;
    caption: string;
  };
  cta: {
    heading: string;
    body: string;
    label: string;
    url: string;
  };
}

interface AboutProps {
  about: AboutContent;
  shared: SharedPageData;
}

function youtubeId(url: string | undefined): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

async function fetchVideoThumb(url: string): Promise<string | null> {
  if (!url) return null;
  const ytId = youtubeId(url);
  if (ytId) return `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
  if (/vimeo\.com\/\d+/.test(url)) {
    try {
      const res = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}&width=1920`);
      if (res.ok) {
        const json = await res.json();
        return (json.thumbnail_url as string)?.replace(/_\d+x\d+$/, '_1920x1080') || json.thumbnail_url || null;
      }
    } catch {}
  }
  return null;
}

function FloatPortrait({ src, caption }: { src: string; caption: string }) {
  return (
    <>
      <div className="block md:hidden w-full rounded-xl overflow-hidden shadow-xl border border-border">
        <img src={src} alt={caption} className="w-full h-auto block" />
        <p className="text-center font-sans text-xs text-muted-foreground italic py-2 bg-card">
          {decodeEntities(caption)}
        </p>
      </div>
      <div
        className="hidden md:block float-right ml-8 mb-6 rounded-xl overflow-hidden shadow-2xl border border-border"
        style={{ width: '45%', marginRight: '-30%' }}>
        <img src={src} alt={caption} className="w-full h-auto block" />
        <p className="text-center font-sans text-xs text-muted-foreground italic py-2 bg-card">
          {decodeEntities(caption)}
        </p>
      </div>
    </>
  );
}

export default function About({ about, shared }: AboutProps) {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <PageHead
        title="About Charles Spurgeon"
        description="Charles Haddon Spurgeon (1834–1892) was the 'Prince of Preachers' — pastor of London's Metropolitan Tabernacle, author of dozens of books, and founder of the Pastors' College, Stockwell Orphanage, and the Sword & Trowel magazine."
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Charles Haddon Spurgeon",
          givenName: "Charles Haddon",
          familyName: "Spurgeon",
          birthDate: "1834-06-19",
          deathDate: "1892-01-31",
          jobTitle: "Pastor, Author",
          alternateName: ["The Prince of Preachers", "C. H. Spurgeon"],
        }}
      />
      <div className="relative bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%221%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
          }} />
        <div className="relative max-w-5xl mx-auto px-6 py-20 md:py-28 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <Link
              href={ROUTES.Home}
              className="inline-flex items-center gap-2 text-primary-foreground/50 hover:text-primary-foreground transition-colors font-sans text-sm mb-8">
              <ArrowLeft className="w-4 h-4" />
              Home
            </Link>
            <p className="text-accent font-sans text-sm tracking-[0.3em] uppercase mb-4">
              {decodeEntities(about.hero.eyebrow)}
            </p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight">
              {decodeEntities(about.hero.titleTop)}
              <br />
              <span className="italic font-normal">{decodeEntities(about.hero.titleBottom)}</span>
            </h1>
            <p className="mt-6 font-sans text-primary-foreground/60 text-base leading-relaxed max-w-md">
              {decodeEntities(about.hero.body)}
            </p>
          </div>
          {about.hero.portrait && (
            <div className="flex-shrink-0">
              <div className="relative w-56 h-72 md:w-64 md:h-80 rounded-2xl overflow-hidden shadow-2xl border-2 border-primary-foreground/10">
                <img
                  src={about.hero.portrait}
                  alt={about.hero.portraitCaption}
                  className="w-full h-full object-cover object-top sepia opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent" />
                <p className="absolute bottom-3 left-0 right-0 text-center font-sans text-xs text-primary-foreground/70 italic">
                  {decodeEntities(about.hero.portraitCaption)}
                </p>
              </div>
            </div>
          )}
        </div>

        {about.video.url && (
          <div className="relative max-w-3xl mx-auto px-6 pb-16">
            <p className="font-sans text-xs text-primary-foreground/40 tracking-[0.2em] uppercase mb-3 text-center">{decodeEntities(about.video.label)}</p>
            <button
              type="button"
              onClick={() => setVideoOpen(true)}
              aria-label={`Play video: ${about.video.label}`}
              className="block w-full rounded-2xl overflow-hidden aspect-video shadow-2xl border border-primary-foreground/10 relative group cursor-pointer">
              {about.video.thumb && (
                <img
                  src={about.video.thumb}
                  alt={about.video.label}
                  className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <PlayCircle className="w-8 h-8 text-primary" />
                </div>
              </div>
            </button>
          </div>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <div className="space-y-16">
          {about.sections.map((section, index) => (
            <React.Fragment key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.05 }}>
                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-4">
                  {decodeEntities(section.title)}
                </h2>
                <div className="font-sans text-muted-foreground leading-[1.8] text-base">
                  <ReactMarkdown
                    components={{
                      // Body paragraphs: keep the visual spacing the old
                      // whitespace-pre-line version produced. Last paragraph
                      // drops its bottom margin so the next section sits
                      // tight against it.
                      p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                    }}
                  >
                    {decodeEntities(section.body)}
                  </ReactMarkdown>
                </div>
              </motion.div>

              {section.floatsPortrait && about.captionPortrait.image && (
                <FloatPortrait
                  src={about.captionPortrait.image}
                  caption={about.captionPortrait.caption} />
              )}

              {section.quote && (
                <motion.blockquote
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="my-4 py-8 px-8 md:px-12 bg-primary/5 border-l-4 border-accent rounded-r-xl">
                  <p className="font-serif text-xl md:text-2xl italic text-foreground/80 leading-relaxed mb-3">
                    "{decodeEntities(section.quote)}"
                  </p>
                  {section.quoteAuthor && (
                    <cite className="font-sans text-sm text-muted-foreground not-italic">
                      — {decodeEntities(section.quoteAuthor)}
                    </cite>
                  )}
                </motion.blockquote>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="mt-20 p-8 bg-card rounded-xl border border-border text-center">
          <BookOpen className="w-8 h-8 text-primary mx-auto mb-4" />
          <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
            {decodeEntities(about.cta.heading)}
          </h3>
          <p className="font-sans text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            {decodeEntities(about.cta.body)}
          </p>
          <Link
            href={about.cta.url || ROUTES.Search}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-sans text-sm font-medium hover:bg-primary/90 transition-colors group">
            {decodeEntities(about.cta.label)}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <TimelineSection
        eyebrow={shared.timeline.eyebrow}
        heading={shared.timeline.heading}
        milestones={shared.timeline.milestones} />
      <FooterSection settings={shared.footer} footerColumns={shared.nav?.footerColumns} />

      <VideoModal
        open={videoOpen}
        onClose={() => setVideoOpen(false)}
        videoUrl={about.video.url}
        title={about.video.label} />
    </div>
  );
}

const EMPTY_ABOUT: AboutContent = {
  hero: { eyebrow: '', titleTop: '', titleBottom: '', body: '', portrait: null, portraitCaption: '' },
  video: { label: '', url: '', thumb: null },
  sections: [],
  captionPortrait: { image: null, caption: '' },
  cta: { heading: '', body: '', label: '', url: '' },
};

export const getStaticProps: GetStaticProps<AboutProps> = async () => {
  const shared = await getSharedPageData();
  let about: AboutContent = EMPTY_ABOUT;

  try {
    const { data } = await apolloClient.query({ query: GET_ABOUT_PAGE_CONTENT });
    const f = (data as any)?.page?.aboutPageFields;
    if (f) {
      about = {
        hero: {
          eyebrow: f.aboutHeroEyebrow || '',
          titleTop: f.aboutHeroTitleTop || '',
          titleBottom: f.aboutHeroTitleBottom || '',
          body: f.aboutHeroBody || '',
          portrait: f.aboutHeroPortrait?.node?.sourceUrl || null,
          portraitCaption: f.aboutHeroPortraitCaption || '',
        },
        video: {
          label: f.aboutVideoLabel || '',
          url: f.aboutVideoUrl || '',
          thumb: await fetchVideoThumb(f.aboutVideoUrl || ''),
        },
        sections: f.aboutSections || [],
        captionPortrait: {
          image: f.aboutCaptionPortraitImage?.node?.sourceUrl || null,
          caption: f.aboutCaptionPortraitCaption || '',
        },
        cta: {
          heading: f.aboutCtaHeading || '',
          body: f.aboutCtaBody || '',
          label: f.aboutCtaLabel || '',
          url: f.aboutCtaUrl || '',
        },
      };
    }
  } catch (err: any) {
    console.error('[GetAboutPageContent failed]', err?.message);
  }

  return { props: { about, shared }, revalidate: 3600 };
};
