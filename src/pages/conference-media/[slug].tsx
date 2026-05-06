import React, { useState } from "react";
import Link from "next/link";
import type { GetStaticPaths, GetStaticProps } from "next";
import { ROUTES } from "@/lib/routes";
import { apolloClient, apolloPreviewClient } from "@/lib/apollo-client";
import {
  GET_CONFERENCE_MEDIA_ITEM,
  GET_CONFERENCE_MEDIA_ITEM_BY_ID,
  GET_RELATED_CONFERENCE_MEDIA,
  GET_RECENT_CONFERENCE_MEDIA,
} from "@/lib/queries";
import { getSharedPageData, type SharedPageData } from "@/lib/shared-data";
import { decodeEntities } from "@/lib/utils";
import { ArrowLeft, Mic, Calendar, Tag, Hash, FileText, BookOpen, Play, ExternalLink } from "lucide-react";
import FooterSection from "@/components/home/FooterSection";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { format } from "date-fns";
import VideoModal from "@/components/conference-media/VideoModal";
import RelatedConferenceMedia from "@/components/conference-media/RelatedConferenceMedia";

interface ConferenceMediaPageProps {
  item: any | null;
  related: any[];
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

function ytIdFromUrl(u?: string | null): string | null {
  // Match v=ID, youtu.be/ID, or youtube.com/embed/ID. WP's auto-oEmbed for
  // pasted YouTube links produces the /embed/ form, so we have to handle it.
  return u?.match(/(?:youtube\.com\/embed\/|v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/)?.[1] || null;
}

/**
 * Editors typically paste a YouTube URL into the post body, which WP turns
 * into an inline `<iframe>` via oEmbed. The new design replaces that with a
 * custom poster + modal player, so we extract the embed URL out of the body
 * and strip the whole oEmbed figure plus the spurgeon.org "promo image"
 * wrapper (a duplicate of the hero image WP renders above the embed).
 */
function extractEmbeddedYouTube(html?: string | null): { videoUrl: string | null; cleaned: string } {
  if (!html) return { videoUrl: null, cleaned: html || '' };
  const iframeRe = /<iframe[^>]*\bsrc=["']([^"']*youtube\.com\/embed\/[^"']+)["'][^>]*><\/iframe>/i;
  const m = html.match(iframeRe);
  let cleaned = html;
  let videoUrl: string | null = null;
  if (m) {
    videoUrl = m[1];
    // Strip the whole WP oEmbed figure (figure → wrapper div → iframe). Use a
    // non-greedy match so we don't swallow surrounding content. Fall back to
    // stripping just the iframe if the figure shape isn't there.
    cleaned = cleaned
      .replace(/<figure[^>]*\bclass="[^"]*wp-block-embed[^"]*"[^>]*>[\s\S]*?<\/figure>/i, '')
      .replace(iframeRe, '');
  }
  // Strip the spurgeon.org "promo image" — a div WP outputs above the embed
  // that duplicates the hero. We always remove this regardless of whether
  // we found an iframe, since on these posts it's always a duplicate of the
  // ACF thumbnail.
  cleaned = cleaned.replace(/<div[^>]*\bclass="[^"]*article__body__promo-image[^"]*"[^>]*>[\s\S]*?<\/div>/i, '');
  // Strip a now-empty content wrapper if the only things inside were the two
  // blocks we just removed.
  cleaned = cleaned.replace(/<div[^>]*\bclass="[^"]*article__body__content[^"]*"[^>]*>\s*<\/div>/i, '');
  return { videoUrl, cleaned: cleaned.trim() };
}

export default function ConferenceMediaDetailPage({ item, related, shared }: ConferenceMediaPageProps) {
  const [videoOpen, setVideoOpen] = useState(false);

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Mic className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <h2 className="font-serif text-2xl text-foreground mb-2">Recording not found</h2>
          <Link href={ROUTES.Search} className="font-sans text-sm text-primary hover:text-primary/80 transition-colors">
            Return to library
          </Link>
        </div>
      </div>
    );
  }

  const fields = item.conferenceMediaFields || {};
  // Inline iframe extraction happens in getStaticProps, so item.content is
  // already iframe-free and fields.videoUrl is populated from the embed when
  // ACF didn't have one set explicitly.
  const ytId = ytIdFromUrl(fields.videoUrl);
  // The "preview image" and "video thumbnail" are the same thing per design:
  // featured image → ACF thumbnail_url → YouTube's auto-thumbnail.
  const heroImage = item.featuredImage?.node?.sourceUrl
    || fields.thumbnailUrl
    || (ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : '');
  const heroAlt = item.featuredImage?.node?.altText || item.title;
  const resources: { label: string; url: string }[] = (fields.relatedResources || []).filter((r: any) => r?.url);

  return (
    <div className="min-h-screen bg-background">
      <motion.article
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto px-6 py-10">
        <Link
          href={`${ROUTES.Search}?type=conference_media`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-sans text-sm mb-10">
          <ArrowLeft className="w-4 h-4" />
          Back to library
        </Link>

        {/* ── 1. Title block ─────────────────────────────────── */}
        <header className="mb-8">
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <Badge variant="default" className="font-sans text-[10px] uppercase tracking-wider bg-primary/10 text-primary">
              Conference Media
            </Badge>
            {fields.event && (
              <span className="font-sans text-xs text-muted-foreground">
                {decodeEntities(fields.event)}
              </span>
            )}
            {fields.sessionNumber && (
              <span className="font-sans text-xs text-muted-foreground flex items-center gap-1">
                <Hash className="w-3 h-3" />
                Session {fields.sessionNumber}
              </span>
            )}
          </div>

          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
            {decodeEntities(item.title)}
          </h1>

          {fields.speaker && (
            <p className="font-sans text-base text-muted-foreground italic mb-4">
              with {decodeEntities(fields.speaker)}
            </p>
          )}

          <div className="flex items-center gap-4 flex-wrap text-sm font-sans text-muted-foreground">
            {fields.dateRecorded && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(fields.dateRecorded), "MMMM d, yyyy")}
              </span>
            )}
            {fields.year && !fields.dateRecorded && (
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
            {fields.scriptureReference && (
              <span className="flex items-center gap-1.5 text-primary">
                <BookOpen className="w-4 h-4" />
                {fields.scriptureReference}
              </span>
            )}
          </div>
        </header>

        {/* ── 2. Video thumbnail (= hero image) with custom play overlay
            The hero/featured image IS the video placeholder — there's no
            second standalone image. Clicking the play button opens the
            YouTube embed inside <VideoModal>. If there's no playable video
            we still render the image (so the page isn't suddenly bare),
            and if there's no image either the block collapses entirely. */}
        {ytId && heroImage ? (
          <button
            type="button"
            onClick={() => setVideoOpen(true)}
            aria-label={`Play video: ${item.title}`}
            className="block w-full mb-10 rounded-xl overflow-hidden aspect-video bg-black shadow-lg relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImage}
              alt={heroAlt}
              className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/45 transition-colors">
              <div className="w-20 h-20 rounded-full bg-white/95 flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform">
                <Play className="w-8 h-8 text-primary ml-1" fill="currentColor" />
              </div>
            </div>
          </button>
        ) : fields.videoUrl ? (
          // Have a video URL but couldn't parse a YouTube ID — fall back to
          // an external "Watch recording" link so the user can still get to it.
          <div className="mb-10">
            {heroImage && (
              <figure className="mb-4 overflow-hidden rounded-xl bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={heroImage} alt={heroAlt} className="w-full h-auto block object-cover" />
              </figure>
            )}
            <a
              href={fields.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-sans text-sm font-medium hover:bg-primary/90 transition-all duration-200 shadow-sm">
              <Play className="w-4 h-4" fill="currentColor" />
              Watch recording
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        ) : heroImage ? (
          // No video at all — show the image alone so the page still has
          // a visual anchor.
          <figure className="mb-10 overflow-hidden rounded-xl bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroImage} alt={heroAlt} className="w-full h-auto block object-cover" />
          </figure>
        ) : null}

        {/* ── 4. Description ─────────────────────────────────── */}
        {item.excerpt && (
          <div className="mb-6 font-sans text-muted-foreground leading-relaxed text-base"
            dangerouslySetInnerHTML={{ __html: item.excerpt }} />
        )}

        {fields.notableQuote && <PullQuote text={fields.notableQuote} />}

        {item.content && (
          <div
            className="sermon-content font-charter text-[22px] text-foreground/90 leading-[1.8]"
            dangerouslySetInnerHTML={{ __html: item.content }} />
        )}

        {/* ── 5. Resources block (PDF + ad-hoc related links) ────── */}
        {(fields.pdfUrl || resources.length > 0) && (
          <section className="mt-12 pt-8 border-t border-border">
            <h2 className="font-serif text-lg font-semibold text-foreground mb-4">Resources</h2>
            <ul className="space-y-2">
              {fields.pdfUrl && (
                <li>
                  <a
                    href={fields.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-sans text-sm">
                    <FileText className="w-4 h-4" />
                    Slides / PDF
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                </li>
              )}
              {resources.map((r, i) => (
                <li key={i}>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-sans text-sm">
                    <ExternalLink className="w-3.5 h-3.5" />
                    {decodeEntities(r.label || r.url)}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── 6. You may also like ──────────────────────────── */}
        <RelatedConferenceMedia items={related} />
      </motion.article>

      <VideoModal
        open={videoOpen}
        onClose={() => setVideoOpen(false)}
        youtubeId={ytId}
        title={item.title} />

      <FooterSection settings={shared?.footer} footerColumns={shared?.nav?.footerColumns} />
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<ConferenceMediaPageProps> = async ({ params, preview, previewData }) => {
  const slug = params?.slug as string;
  const shared = await getSharedPageData();
  const previewId = preview && (previewData as any)?.postType === 'conference_media'
    ? (previewData as any).postId
    : null;
  try {
    const { data } = previewId
      ? await apolloPreviewClient().query({
          query: GET_CONFERENCE_MEDIA_ITEM_BY_ID,
          variables: { id: String(previewId) },
          fetchPolicy: 'no-cache',
        })
      : await apolloClient.query({
          query: GET_CONFERENCE_MEDIA_ITEM,
          variables: { slug },
        });
    const item = (data as any)?.conferenceMediaItem;
    if (!item) {
      return { notFound: true, revalidate: 10 };
    }

    // Pull any inline YouTube iframe out of the body content here so it
    // never ships to the browser inside __NEXT_DATA__. The extracted URL is
    // promoted to videoUrl so the modal still has something to play.
    if (item.content) {
      const { videoUrl, cleaned } = extractEmbeddedYouTube(item.content);
      item.content = cleaned;
      if (videoUrl && !item.conferenceMediaFields?.videoUrl) {
        item.conferenceMediaFields = {
          ...(item.conferenceMediaFields || {}),
          videoUrl,
        };
      }
    }

    // Fetch related items: same `event` ACF when available, otherwise recent
    // overall. Either way, exclude the current item by databaseId. Keep the
    // first 6 — RelatedConferenceMedia caps to a 3-column grid that wraps.
    const event = item.conferenceMediaFields?.event;
    let related: any[] = [];
    try {
      if (event) {
        const { data: rd } = await apolloClient.query({
          query: GET_RELATED_CONFERENCE_MEDIA,
          variables: { event, count: 7 },
        });
        related = ((rd as any)?.conferenceMediaItems?.nodes || []).filter(
          (n: any) => n.databaseId !== item.databaseId
        );
      }
      if (related.length === 0) {
        const { data: rd } = await apolloClient.query({
          query: GET_RECENT_CONFERENCE_MEDIA,
          variables: { count: 7 },
        });
        related = ((rd as any)?.conferenceMediaItems?.nodes || []).filter(
          (n: any) => n.databaseId !== item.databaseId
        );
      }
      related = related.slice(0, 6);
    } catch (err: any) {
      console.error('[GET_RELATED_CONFERENCE_MEDIA failed]', err?.message);
    }

    return {
      props: { item, related, shared },
      revalidate: 1800,
    };
  } catch (err: any) {
    console.error('[GET_CONFERENCE_MEDIA_ITEM failed]', slug, err?.message);
    return { notFound: true, revalidate: 10 };
  }
};
