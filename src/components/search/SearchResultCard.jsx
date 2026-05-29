import React from "react";
import { format } from "date-fns";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, PlayCircle } from "lucide-react";
import { stripHtml, decodeEntities } from "@/lib/utils";
import { urlForHit, POST_TYPE_LABELS } from "@/lib/algolia";

// Extract YouTube video ID from a URL
function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

// Per-post-type badge color. Default is the primary tint for any type we
// haven't styled explicitly.
const TYPE_COLORS = {
  spurgeon_sermon: "bg-primary/10 text-primary",
  magazine_article: "bg-accent/10 text-accent",
  spurgeon_blog: "bg-accent/10 text-accent",
  conference_media: "bg-blue-100 text-blue-700",
  book_chapter: "bg-primary/10 text-primary",
  spurgeon_book: "bg-primary/10 text-primary",
  morning_and_evening: "bg-amber-100 text-amber-800",
  faiths_check_book: "bg-emerald-100 text-emerald-800",
  treasury_entry: "bg-purple-100 text-purple-800",
};

export default function SearchResultCard({ sermon }) {
  const isMedia = sermon.postType === "conference_media";
  const hasImage = ["spurgeon_blog", "spurgeon_article", "conference_media"].includes(sermon.postType);
  const ytId = getYouTubeId(sermon.video_url);
  const thumbnail = sermon.thumbnail_url || (ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null);

  return (
    <Link
      href={urlForHit(sermon)}
      className="group block"
    >
      <div className="py-6 border-b border-border hover:bg-secondary/30 transition-colors -mx-4 px-4 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          {/* Thumbnail: hero image for blog/articles, video thumbnail for media */}
          {hasImage && thumbnail && (
            <div className="flex-shrink-0 w-full aspect-video md:w-36 md:aspect-auto md:h-24 rounded-lg overflow-hidden bg-muted relative">
              <img src={thumbnail} alt={sermon.title} className="w-full h-full object-cover" />
              {isMedia && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <PlayCircle className="w-8 h-8 text-white drop-shadow" />
                </div>
              )}
            </div>
          )}
          {isMedia && !thumbnail && (
            <div className="flex-shrink-0 w-full aspect-video md:w-36 md:aspect-auto md:h-24 rounded-lg overflow-hidden bg-muted relative">
              <div className="w-full h-full flex items-center justify-center">
                <PlayCircle className="w-10 h-10 text-muted-foreground/40" />
              </div>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge
                className={`font-sans text-[10px] uppercase tracking-wider ${
                  TYPE_COLORS[sermon.postType] || "bg-muted text-muted-foreground"
                }`}
              >
                {POST_TYPE_LABELS[sermon.postType] || sermon.postType || "Result"}
              </Badge>
              {(sermon.date_preached || sermon.year) && (
                <span className="font-sans text-xs text-muted-foreground">
                  {sermon.date_preached
                    ? format(new Date(sermon.date_preached), "MMMM d, yyyy")
                    : sermon.year}
                </span>
              )}
              {sermon.sermon_number && (
                <span className="font-sans text-xs text-muted-foreground">
                  No. {sermon.sermon_number}
                </span>
              )}
            </div>
            <h3 className="font-serif text-lg md:text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
              {decodeEntities(sermon.title)}
            </h3>
            {sermon.scripture_reference && (
              <p className="font-sans text-sm text-primary/80 mt-1">
                {sermon.scripture_reference}
              </p>
            )}
            {sermon.excerpt && (
              <p className="font-sans text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-2">
                {stripHtml(sermon.excerpt)}
              </p>
            )}
            {sermon.topic && (
              <span className="inline-block mt-3 font-sans text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-1">
                {sermon.topic}
              </span>
            )}
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 hidden md:block mt-2" />
        </div>
      </div>
    </Link>
  );
}