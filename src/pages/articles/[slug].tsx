import React from "react";
import Link from "next/link";
import type { GetStaticPaths, GetStaticProps } from "next";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ArrowLeft, Calendar, BookOpen, FileText, ExternalLink } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { apolloClient, apolloPreviewClient } from "@/lib/apollo-client";
import { GET_ARTICLE, GET_ARTICLE_BY_ID } from "@/lib/queries";
import { getSharedPageData, type SharedPageData } from "@/lib/shared-data";
import { decodeEntities } from "@/lib/utils";
import FooterSection from "@/components/home/FooterSection";

interface ArticlePageProps {
  entry: any | null;
  shared: SharedPageData;
}

export default function ArticlePage({ entry, shared }: ArticlePageProps) {
  if (!entry) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <h2 className="font-serif text-2xl text-foreground mb-2">Article not found</h2>
          <Link href={ROUTES.Search} className="font-sans text-sm text-primary hover:text-primary/80 transition-colors">
            Search the library
          </Link>
        </div>
      </div>
    );
  }

  const fields = entry.spurgeonArticleFields || {};
  const dateLabel = entry.date ? format(new Date(entry.date), "MMMM d, yyyy") : "";

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
          Back to search
        </Link>

        <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
          {decodeEntities(entry.title)}
        </h1>

        <div className="flex items-center gap-4 flex-wrap text-sm font-sans text-muted-foreground mb-8">
          {fields.author && (
            <span className="italic">by {decodeEntities(fields.author)}</span>
          )}
          {dateLabel && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {dateLabel}
            </span>
          )}
          {fields.scriptureReference && (
            <span className="flex items-center gap-1.5 text-primary">
              <BookOpen className="w-4 h-4" />
              {fields.scriptureReference}
            </span>
          )}
        </div>

        {fields.featuredImageUrl && (
          <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-muted mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fields.featuredImageUrl}
              alt={entry.title}
              className="w-full h-full object-cover" />
          </div>
        )}

        <div className="h-px bg-border mb-8" />

        {entry.content && (
          <div
            className="sermon-content font-charter text-[22px] text-foreground/90 leading-[1.8]"
            dangerouslySetInnerHTML={{ __html: entry.content }} />
        )}

        {fields.sourceUrl && (
          <div className="mt-12 pt-6 border-t border-border">
            <a
              href={fields.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-sans text-muted-foreground hover:text-primary transition-colors">
              <ExternalLink className="w-3.5 h-3.5" />
              View original on spurgeon.org
            </a>
          </div>
        )}
      </motion.div>
      <FooterSection settings={shared?.footer} footerColumns={shared?.nav?.footerColumns} />
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<ArticlePageProps> = async ({ params, preview, previewData }) => {
  const slug = params?.slug as string;
  const shared = await getSharedPageData();
  const previewId = preview && (previewData as any)?.postType === 'spurgeon_article'
    ? (previewData as any).postId
    : null;
  try {
    const { data } = previewId
      ? await apolloPreviewClient().query({
          query: GET_ARTICLE_BY_ID,
          variables: { id: String(previewId) },
          fetchPolicy: 'no-cache',
        })
      : await apolloClient.query({
          query: GET_ARTICLE,
          variables: { slug },
        });
    const entry = (data as any)?.spurgeonArticle;
    if (!entry) {
      return { notFound: true, revalidate: 10 };
    }
    return {
      props: { entry, shared },
      revalidate: 1800,
    };
  } catch (err: any) {
    console.error('[GET_ARTICLE failed]', slug, err?.message);
    return { notFound: true, revalidate: 10 };
  }
};
