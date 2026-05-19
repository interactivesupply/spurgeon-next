import React from "react";
import Link from "next/link";
import type { GetStaticPaths, GetStaticProps } from "next";
import { ROUTES } from "@/lib/routes";
import { apolloClient, apolloPreviewClient } from "@/lib/apollo-client";
import { GET_MAGAZINE_ARTICLE, GET_MAGAZINE_ARTICLE_BY_ID } from "@/lib/queries";
import { getSharedPageData, type SharedPageData } from "@/lib/shared-data";
import { decodeEntities } from "@/lib/utils";
import { ArrowLeft, Newspaper, BookOpen, Calendar, FileText } from "lucide-react";
import FooterSection from "@/components/home/FooterSection";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import PageHead, { descriptionFromHtml } from "@/components/PageHead";

// Fallback labels in case the taxonomy term has no `name` (shouldn't happen,
// but keeps the UI sensible if a category was deleted in wp-admin).
const CATEGORY_LABEL_FALLBACK: Record<string, string> = {
  spurgeon_article: "Spurgeon Articles",
  book_review: "Book Reviews",
  chapter_preview: "Chapter Previews",
  short_form: "Short Form",
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
  // Category now comes from the magazine_category taxonomy.
  const term = article.magazineCategories?.nodes?.[0];
  const categoryLabel = term?.name || (term?.slug ? CATEGORY_LABEL_FALLBACK[term.slug] : null);
  const cleanTitle = decodeEntities(article.title || "Article");
  const author = fields.author ? decodeEntities(fields.author) : "C. H. Spurgeon";

  return (
    <div className="min-h-screen bg-background">
      <PageHead
        title={cleanTitle}
        description={descriptionFromHtml(article.excerpt || article.content, 155)}
        type="article"
        article={{
          publishedTime: article.date,
          author,
          section: categoryLabel || "The Sword and the Trowel",
        }}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: cleanTitle,
          author: { "@type": "Person", name: author },
          publisher: {
            "@type": "Organization",
            name: "The Sword and the Trowel",
          },
          isPartOf: {
            "@type": "PublicationIssue",
            issueNumber: fields.issue || undefined,
          },
          ...(article.date && { datePublished: article.date }),
        }}
      />
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

        <div className="h-px bg-border mb-8" />

        {fields.pdfUrl ? (
          <>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <a
                href={fields.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-sans text-sm font-medium">
                <FileText className="w-4 h-4" />
                Open in new tab
              </a>
              <a
                href={fields.pdfUrl}
                download
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border hover:border-primary/40 text-foreground hover:text-primary transition-colors font-sans text-sm font-medium">
                Download
              </a>
            </div>
            {/* Inline PDF viewer — uses the browser's built-in renderer so
                readers don't have to leave the page to read the issue
                (Userback #7654209). Fixed-height container with native
                scrolling inside the iframe; the "Open in new tab" link
                above gives a full-screen alternative on mobile where
                inline PDF rendering can be flaky. */}
            <div className="rounded-xl overflow-hidden border border-border bg-muted shadow-sm">
              <iframe
                src={fields.pdfUrl}
                title={`${decodeEntities(article.title)} — PDF`}
                className="w-full h-[80vh] min-h-[600px] bg-white"
              />
            </div>
          </>
        ) : (
          <p className="font-sans text-sm text-muted-foreground italic">
            PDF not yet available for this issue.
          </p>
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
  const previewId = preview && (previewData as any)?.postType === 'magazine_article'
    ? (previewData as any).postId
    : null;
  try {
    const { data } = previewId
      ? await apolloPreviewClient().query({
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
      return { notFound: true, revalidate: 10 };
    }
    return {
      props: { article, shared },
      revalidate: 1800,
    };
  } catch (err: any) {
    console.error('[GET_MAGAZINE_ARTICLE failed]', slug, err?.message);
    return { notFound: true, revalidate: 10 };
  }
};
