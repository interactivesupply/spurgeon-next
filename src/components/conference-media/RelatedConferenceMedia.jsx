import React from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { decodeEntities } from "@/lib/utils";

/**
 * Renders the "You may also like…" rail of related conference-media items.
 * Each card uses object-fit:cover for a clean, borderless thumbnail and a
 * subtle play-overlay since each item links to its full page (which has the
 * actual modal player).
 */
function ytIdFromUrl(u) {
  return u?.match(/(?:v=|youtu\.be\/)([^&\s]+)/)?.[1] || null;
}

export default function RelatedConferenceMedia({ items = [], heading = "You may also like" }) {
  if (!items.length) return null;
  return (
    <section className="mt-16 pt-10 border-t border-border">
      <h2 className="font-serif text-2xl font-bold text-foreground mb-6">{heading}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((it) => {
          const f = it.conferenceMediaFields || {};
          const ytId = ytIdFromUrl(f.videoUrl);
          const thumb = it.featuredImage?.node?.sourceUrl
            || f.thumbnailUrl
            || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null);
          return (
            <Link
              key={it.id}
              href={ROUTES.ConferenceMediaItem(it.slug)}
              className="group block overflow-hidden rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-lg transition-all">
              <div className="aspect-video relative overflow-hidden bg-muted">
                {thumb ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumb}
                      alt={it.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                        <Play className="w-5 h-5 text-primary ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 font-sans text-xs">
                    No image
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-serif text-base font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-1">
                  {decodeEntities(it.title)}
                </h3>
                {f.speaker && (
                  <p className="font-sans text-xs text-muted-foreground italic">
                    with {decodeEntities(f.speaker)}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
