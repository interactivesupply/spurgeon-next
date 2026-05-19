import React from "react";
import Link from "next/link";
import type { GetStaticPaths, GetStaticProps } from "next";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ArrowLeft, Calendar, BookOpen, Edit3 } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { apolloClient, apolloPreviewClient } from "@/lib/apollo-client";
import { GET_BLOG_ENTRY, GET_BLOG_ENTRY_BY_ID } from "@/lib/queries";
import { getSharedPageData, type SharedPageData } from "@/lib/shared-data";
import { decodeEntities } from "@/lib/utils";
import FooterSection from "@/components/home/FooterSection";
import PageHead, { descriptionFromHtml } from "@/components/PageHead";

interface BlogPostProps {
  entry: any | null;
  shared: SharedPageData;
}

export default function BlogPostPage({ entry, shared }: BlogPostProps) {
  if (!entry) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Edit3 className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <h2 className="font-serif text-2xl text-foreground mb-2">Post not found</h2>
          <Link href={ROUTES.Blog} className="font-sans text-sm text-primary hover:text-primary/80 transition-colors">
            Browse all posts
          </Link>
        </div>
      </div>
    );
  }

  const fields = entry.spurgeonBlogFields || {};
  const dateLabel = entry.date ? format(new Date(entry.date), "MMMM d, yyyy") : "";
  const cleanTitle = decodeEntities(entry.title || "Blog Post");
  const heroImage = entry.featuredImage?.node?.sourceUrl || fields.featuredImageUrl || null;

  return (
    <div className="min-h-screen bg-background">
      <PageHead
        title={cleanTitle}
        description={descriptionFromHtml(entry.excerpt || entry.content, 155)}
        image={heroImage}
        type="article"
        article={{
          publishedTime: entry.date,
          author: fields.author || "The Spurgeon Library",
          section: "Blog",
        }}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: cleanTitle,
          author: { "@type": "Person", name: fields.author || "The Spurgeon Library" },
          publisher: {
            "@type": "Organization",
            name: "The Spurgeon Library",
            logo: { "@type": "ImageObject", url: "https://spurgeoncenter.wpenginepowered.com/wp-content/uploads/2026/04/3fc58e03b_logo-cs-horz-top2.png" },
          },
          ...(heroImage && { image: heroImage }),
          ...(entry.date && { datePublished: entry.date }),
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto px-6 py-10">
        <Link
          href={ROUTES.Blog}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-sans text-sm mb-10">
          <ArrowLeft className="w-4 h-4" />
          Blog
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
      </motion.div>
      <FooterSection settings={shared?.footer} footerColumns={shared?.nav?.footerColumns} />
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<BlogPostProps> = async ({ params, preview, previewData }) => {
  const slug = params?.slug as string;
  const shared = await getSharedPageData();
  const previewId = preview && (previewData as any)?.postType === 'spurgeon_blog'
    ? (previewData as any).postId
    : null;
  try {
    const { data } = previewId
      ? await apolloPreviewClient().query({
          query: GET_BLOG_ENTRY_BY_ID,
          variables: { id: String(previewId) },
          fetchPolicy: 'no-cache',
        })
      : await apolloClient.query({
          query: GET_BLOG_ENTRY,
          variables: { slug },
        });
    const entry = (data as any)?.spurgeonBlog;
    if (!entry) {
      return { notFound: true, revalidate: 10 };
    }
    return {
      props: { entry, shared },
      revalidate: 1800,
    };
  } catch (err: any) {
    console.error('[GET_BLOG_ENTRY failed]', slug, err?.message);
    return { notFound: true, revalidate: 10 };
  }
};
