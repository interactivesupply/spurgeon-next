import React from "react";
import Link from "next/link";
import type { GetStaticPaths, GetStaticProps } from "next";
import { ROUTES } from "@/lib/routes";
import { apolloClient } from "@/lib/apollo-client";
import { GET_MAGAZINE_ARTICLE, GET_MAGAZINE_ARTICLE_BY_ID } from "@/lib/queries";
import { getSharedPageData, type SharedPageData } from "@/lib/shared-data";
import { decodeEntities } from "@/lib/utils";
import { ArrowLeft, Newspaper, BookOpen, Calendar } from "lucide-react";
import FooterSection from "@/components/home/FooterSection";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const CATEGORY_LABELS: Record<string, string> = {
  spurgeon_article: "Spurgeon Article",
  book_review: "Book Review",
  chapter_preview: "Chapter Preview",
  spurgeon_short: "Spurgeon Short",
  news_reports: "News & Reports",
};

interface ArticlePageProps {
  article: any | null;
  shared: SharedPageData;
}

export default function MagazineArticlePage({ article, shared }: ArticlePageProps) {
  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Newspaper className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <h2 className="font-serif text-2xl text-foreground mb-2">Article not found</h2>
          <Link href={ROUTES.SwordAndTrowel} className="font-sans text-sm text-primary hover:text-primary/80 transition-colors">
            Browse all articles
          </Link>
        </div>
      </div>
    );
  }

  const fields = article.magazineArticleFields || {};
  // WPGraphQL-for-ACF returns select fields as arrays.
  const rawCategory = Array.isArray(fields.category) ? fields.category[0] : fields.category;
  const categoryLabel = rawCategory ? CATEGORY_LABELS[rawCategory] || rawCategory : null;

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto px-6 py-10">
        <Link
          href={ROUTES.SwordAndTrowel}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-sans text-sm mb-10">
          <ArrowLeft className="w-4 h-4" />
          Sword & Trowel
        </Link>

        <div className="flex items-center gap-3 flex-wrap mb-4">
          <Badge variant="default" className="font-sans text-[10px] uppercase tracking-wider bg-accent/10 text-accent">
            {categoryLabel || "Article"}
          </Badge>
          {fields.issue && (
            <span className="font-sans text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {fields.issue}
            </span>
          )}
        </div>

        <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
          {decodeEntities(article.title)}
        </h1>

        {fields.author && (
          <p className="font-sans text-base text-muted-foreground italic mb-4">
            by {decodeEntities(fields.author)}
          </p>
        )}

        <div className="flex items-center gap-4 flex-wrap text-sm font-sans text-muted-foreground mb-6">
          {fields.scriptureReference && (
            <span className="flex items-center gap-1.5 text-primary">
              <BookOpen className="w-4 h-4" />
              {fields.scriptureReference}
            </span>
          )}
        </div>

        {fields.bookTitle && (
          <div className="mb-6 p-4 rounded-lg border border-border bg-card">
            <p className="font-sans text-xs text-muted-foreground uppercase tracking-wider mb-1">Book Reviewed</p>
            <p className="font-serif text-lg font-semibold text-foreground">{decodeEntities(fields.bookTitle)}</p>
            {fields.bookAuthor && (
              <p className="font-sans text-sm text-muted-foreground italic">by {decodeEntities(fields.bookAuthor)}</p>
            )}
          </div>
        )}

        {article.excerpt && (
          <div className="mb-6">
            <div className="font-sans text-muted-foreground leading-relaxed text-base"
              dangerouslySetInnerHTML={{ __html: article.excerpt }} />
          </div>
        )}

        <div className="h-px bg-border mb-8" />

        {article.content && (
          <div
            className="sermon-content font-charter text-[22px] text-foreground/90 leading-[1.8]"
            dangerouslySetInnerHTML={{ __html: article.content }} />
        )}
      </motion.div>
      <FooterSection settings={shared?.footer} />
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<ArticlePageProps> = async ({ params, preview, previewData }) => {
  const slug = params?.slug as string;
  const shared = await getSharedPageData();
  const previewId = preview && (previewData as any)?.postId;
  try {
    const { data } = previewId
      ? await apolloClient.query({
          query: GET_MAGAZINE_ARTICLE_BY_ID,
          variables: { id: String(previewId) },
          fetchPolicy: 'no-cache',
        })
      : await apolloClient.query({
          query: GET_MAGAZINE_ARTICLE,
          variables: { slug },
        });
    const article = (data as any)?.magazineArticle;
    if (!article) {
      return { notFound: true, revalidate: 60 };
    }
    return {
      props: { article, shared },
      revalidate: 1800,
    };
  } catch (err: any) {
    console.error('[GET_MAGAZINE_ARTICLE failed]', slug, err?.message);
    return { notFound: true, revalidate: 60 };
  }
};
