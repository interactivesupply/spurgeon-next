import React from "react";
import Link from "next/link";
import type { GetStaticPaths, GetStaticProps } from "next";
import { ROUTES } from "@/lib/routes";
import { apolloClient, apolloPreviewClient } from "@/lib/apollo-client";
import { GET_SERMON, GET_SERMON_BY_ID, GET_ALL_SERMON_SLUGS } from "@/lib/queries";
import { getSharedPageData, type SharedPageData } from "@/lib/shared-data";
import { decodeEntities } from "@/lib/utils";
import { ArrowLeft, BookOpen, Calendar, Tag, Hash, FileText } from "lucide-react";
import FooterSection from "@/components/home/FooterSection";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { format } from "date-fns";

const COLLECTION_LABEL: Record<string, string> = {
  new_park_street_pulpit: "The New Park Street Pulpit",
  metropolitan_tabernacle_pulpit: "The Metropolitan Tabernacle Pulpit",
  other: "Other Works",
};

interface SermonPageProps {
  sermon: any | null;
  shared: SharedPageData;
}

function PullQuote({ text }: { text: string }) {
  return (
    <div className="my-12 -mx-4 md:-mx-12 px-8 md:px-16 py-10 bg-primary/5 border-y border-primary/10">
      <blockquote className="text-center">
        <p className="font-serif text-xl md:text-2xl italic text-foreground/85 leading-relaxed">
          "{decodeEntities(text)}"
        </p>
      </blockquote>
    </div>
  );
}

export default function SermonDetailPage({ sermon, shared }: SermonPageProps) {
  if (!sermon) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <h2 className="font-serif text-2xl text-foreground mb-2">Sermon not found</h2>
          <Link href={ROUTES.Search} className="font-sans text-sm text-primary hover:text-primary/80 transition-colors">
            Return to library
          </Link>
        </div>
      </div>
    );
  }

  const fields = sermon.sermonFields || {};
  const collectionSlug = sermon.sermonCollections?.nodes?.[0]?.slug;
  // Prefer the WP featured image; fall back to the legacy ACF thumbnail_url
  // (set by the spurgeon.org importer). If neither is set, the hero card
  // is hidden — better than a hardcoded placeholder on every untouched post.
  const heroImage = sermon.featuredImage?.node?.sourceUrl || fields.thumbnailUrl || '';
  const heroAlt = sermon.featuredImage?.node?.altText || sermon.title;
  const ytId = fields.videoUrl?.match(/(?:v=|youtu\.be\/)([^&\s]+)/)?.[1];

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto px-6 py-10">
        <Link
          href={ROUTES.Search}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-sans text-sm mb-10">
          <ArrowLeft className="w-4 h-4" />
          Back to library
        </Link>

        <div className="flex items-start gap-6 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-4">
              <Badge variant="default" className="font-sans text-[10px] uppercase tracking-wider bg-primary/10 text-primary">
                Sermon
              </Badge>
              {collectionSlug && (
                <span className="font-sans text-xs text-muted-foreground">
                  {COLLECTION_LABEL[collectionSlug] || collectionSlug}
                </span>
              )}
              {fields.sermonNumber && (
                <span className="font-sans text-xs text-muted-foreground flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  {fields.sermonNumber}
                </span>
              )}
            </div>

            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
              {decodeEntities(sermon.title)}
            </h1>
          </div>

          {heroImage && (
            <div className="hidden md:block flex-shrink-0 w-72 aspect-video rounded-xl overflow-hidden border border-border shadow-md bg-white">
              <img src={heroImage} alt={heroAlt} className="w-full h-full object-contain" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 flex-wrap text-sm font-sans text-muted-foreground mb-4">
          {fields.scriptureReference && (
            <span className="flex items-center gap-1.5 text-primary">
              <BookOpen className="w-4 h-4" />
              {fields.scriptureReference}
            </span>
          )}
          {fields.datePreached && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(fields.datePreached), "MMMM d, yyyy")}
            </span>
          )}
          {fields.year && !fields.datePreached && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {fields.year}
            </span>
          )}
          {fields.topic && (
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              {fields.topic}
            </span>
          )}
        </div>

        {sermon.excerpt && (
          <div className="mb-6">
            <div className="font-sans text-muted-foreground leading-relaxed text-base"
              dangerouslySetInnerHTML={{ __html: sermon.excerpt }} />
          </div>
        )}

        {fields.pdfUrl && (
          <a
            href={fields.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 mb-8 rounded-lg bg-primary text-primary-foreground font-sans text-sm font-medium hover:bg-primary/90 transition-all duration-200 shadow-sm">
            <FileText className="w-4 h-4" />
            View PDF
          </a>
        )}

        <div className="h-px bg-border mb-8" />

        {fields.videoUrl && ytId && (
          <a
            href={fields.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block mb-10 rounded-xl overflow-hidden aspect-video bg-black shadow-lg relative group">
            <img
              src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
              alt={sermon.title}
              className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-primary ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </a>
        )}

        {fields.notableQuote && <PullQuote text={fields.notableQuote} />}

        {sermon.content && (
          <div
            className="sermon-content font-charter text-[22px] text-foreground/90 leading-[1.8]"
            dangerouslySetInnerHTML={{ __html: sermon.content }} />
        )}
      </motion.div>
      <FooterSection settings={shared?.footer} footerColumns={shared?.nav?.footerColumns} />
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // Pre-render no paths at build time; use ISR + fallback: 'blocking' so each
  // sermon is rendered on first request and cached. Avoids requiring WordPress
  // to be reachable during the initial build.
  return { paths: [], fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<SermonPageProps> = async ({ params, preview, previewData }) => {
  const slug = params?.slug as string;
  const shared = await getSharedPageData();
  // Honor the preview cookie ONLY when the post type matches this page —
  // otherwise previewing a different CPT and then navigating to a sermon
  // would try to load the wrong post and return 404.
  const previewId = preview && (previewData as any)?.postType === 'spurgeon_sermon'
    ? (previewData as any).postId
    : null;
  try {
    const { data } = previewId
      ? await apolloPreviewClient().query({
          query: GET_SERMON_BY_ID,
          variables: { id: String(previewId) },
          fetchPolicy: 'no-cache',
        })
      : await apolloClient.query({
          query: GET_SERMON,
          variables: { slug },
        });
    const sermon = (data as any)?.sermon;
    if (!sermon) {
      return { notFound: true, revalidate: 10 };
    }
    return {
      props: { sermon, shared },
      revalidate: 3600,
    };
  } catch (err: any) {
    console.error('[GET_SERMON failed]', slug, err?.message, err?.networkError?.statusCode, err?.graphQLErrors);
    return { notFound: true, revalidate: 10 };
  }
};
