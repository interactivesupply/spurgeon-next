import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { algolia, ALGOLIA_INDEX, urlForHit, reshapeHit, type ReshapedHit, type AlgoliaHit } from "@/lib/algolia";
import { decodeEntities } from "@/lib/utils";

interface RelatedSermonsProps {
  /** post_id of the current sermon (excluded from related results) */
  postId: number;
  /** scripture_reference like "Romans 10:1-3" — used to derive the chapter */
  scriptureReference?: string | null;
  /** sermon_collection slug, e.g. "metropolitan-tabernacle-pulpit-volume-32" */
  collectionSlug?: string | null;
}

/**
 * Parse a scripture reference like "Romans 10:1-3" or "1 Peter 2:24" into
 * the book + chapter portion ("Romans 10" / "1 Peter 2") that matches the
 * taxonomies.scripture_chapter facet value. Returns null on anything that
 * doesn't look like a standard reference.
 */
function chapterFromReference(ref: string): string | null {
  const m = ref.match(/^\s*((?:[1-3]\s+)?[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)\s+(\d+)\s*:/);
  return m ? `${m[1]} ${m[2]}` : null;
}

async function fetchRelated(facetFilter: string, excludePostId: number, limit: number): Promise<ReshapedHit[]> {
  if (!algolia) return [];
  try {
    const { results } = await algolia.search({
      requests: [{
        indexName: ALGOLIA_INDEX,
        query: "",
        hitsPerPage: limit,
        facetFilters: [[facetFilter]],
        filters: `post_type:spurgeon_sermon AND NOT post_id=${excludePostId}`,
      }],
    });
    const main: any = results[0];
    return (main?.hits || []).map(reshapeHit) as ReshapedHit[];
  } catch (err: any) {
    console.error("[RelatedSermons fetch failed]", err?.message);
    return [];
  }
}

export default function RelatedSermons({ postId, scriptureReference, collectionSlug }: RelatedSermonsProps) {
  const [byScripture, setByScripture] = useState<ReshapedHit[]>([]);
  const [byCollection, setByCollection] = useState<ReshapedHit[]>([]);

  useEffect(() => {
    const chapter = scriptureReference ? chapterFromReference(scriptureReference) : null;
    const requests: Promise<ReshapedHit[]>[] = [];
    requests.push(
      chapter
        ? fetchRelated(`taxonomies.scripture_chapter:${chapter}`, postId, 3)
        : Promise.resolve([])
    );
    requests.push(
      collectionSlug
        ? fetchRelated(`collection:${collectionSlug}`, postId, 3)
        : Promise.resolve([])
    );
    Promise.all(requests).then(([a, b]) => {
      setByScripture(a);
      setByCollection(b);
    });
  }, [postId, scriptureReference, collectionSlug]);

  if (byScripture.length === 0 && byCollection.length === 0) return null;

  return (
    <section className="mt-16 pt-12 border-t border-border">
      <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2">
        More from Spurgeon
      </h2>
      <p className="font-sans text-sm text-muted-foreground mb-10">
        Other sermons connected to this one — by Scripture, and from the same volume.
      </p>

      {byScripture.length > 0 && (
        <RelatedRow
          eyebrow="On this Scripture"
          description="Other sermons preached from the same chapter."
          sermons={byScripture}
        />
      )}
      {byCollection.length > 0 && (
        <RelatedRow
          eyebrow="From the same volume"
          description="Preached in the same period of Spurgeon's ministry."
          sermons={byCollection}
        />
      )}
    </section>
  );
}

function RelatedRow({ eyebrow, description, sermons }: { eyebrow: string; description: string; sermons: ReshapedHit[] }) {
  return (
    <div className="mb-12 last:mb-0">
      <div className="mb-5">
        <p className="font-sans text-xs uppercase tracking-widest text-accent mb-1">{eyebrow}</p>
        <p className="font-sans text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sermons.map((s) => (
          <Link
            key={s.id}
            href={urlForHit(s)}
            className="group block bg-card border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-md transition-all">
            {s.scripture_reference && (
              <p className="font-sans text-xs text-primary/70 mb-2">{s.scripture_reference}</p>
            )}
            <h3 className="font-serif text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
              {decodeEntities(s.title)}
            </h3>
            <div className="flex items-center gap-1.5 text-xs font-sans font-medium text-primary group-hover:text-accent transition-colors">
              Read sermon
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Avoid an unused-import error from AlgoliaHit (referenced via `type` in
// the .map(reshapeHit) call signature implicitly).
export type { AlgoliaHit };
