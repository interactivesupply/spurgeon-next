import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Newspaper, FileText, BookMarked, Radio } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { decodeEntities, stripHtml } from "@/lib/utils";

const categoryMeta = {
  spurgeon_article: { label: "Spurgeon Article", icon: BookOpen, color: "text-amber-700 bg-amber-50 border-amber-200" },
  book_review: { label: "Book Review", icon: BookMarked, color: "text-blue-700 bg-blue-50 border-blue-200" },
  chapter_preview: { label: "Chapter Preview", icon: FileText, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  spurgeon_short: { label: "Short Form", icon: Newspaper, color: "text-purple-700 bg-purple-50 border-purple-200" },
  news_reports: { label: "News & Reports", icon: Radio, color: "text-rose-700 bg-rose-50 border-rose-200" },
};

// WPGraphQL-for-ACF returns select fields as arrays; flatten for display.
function flat(value) {
  return Array.isArray(value) ? value[0] : value;
}

function ArticleCard({ article, index }) {
  const category = flat(article.category);
  const meta = categoryMeta[category] || categoryMeta.spurgeon_article;
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}>
      <Link
        href={ROUTES.MagazineArticle(article.slug)}
        className="group block bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col h-full">
        {article.cover_image_url && (
          <div className="h-48 overflow-hidden">
            <img
              src={article.cover_image_url}
              alt={decodeEntities(article.title)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
        )}
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${meta.color}`}>
              <Icon className="w-3 h-3" />
              {meta.label}
            </span>
            {article.issue && (
              <span className="font-sans text-xs text-muted-foreground">{article.issue}</span>
            )}
          </div>

          <h3 className="font-serif text-lg font-bold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors">
            {decodeEntities(article.title)}
          </h3>

          {category === "book_review" && article.book_title && (
            <p className="font-sans text-xs italic text-muted-foreground mb-2">
              Review of: <span className="font-medium">{decodeEntities(article.book_title)}</span>
              {article.book_author && ` by ${decodeEntities(article.book_author)}`}
            </p>
          )}

          {article.scripture_reference && (
            <p className="font-sans text-xs text-primary/70 mb-2">{article.scripture_reference}</p>
          )}

          {article.excerpt && (
            <p className="font-sans text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
              {stripHtml(article.excerpt)}
            </p>
          )}

          {article.author && (
            <p className="font-sans text-xs text-muted-foreground/60 mt-4 pt-4 border-t border-border">
              By {decodeEntities(article.author)}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

export default function ArticleGrid({ articles, isLoading }) {
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-32 text-center">
        <BookOpen className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
        <h3 className="font-serif text-xl text-foreground mb-2">No articles yet</h3>
        <p className="font-sans text-sm text-muted-foreground">
          Check back soon for new content from the Sword & Trowel.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, i) => (
          <ArticleCard key={article.id} article={article} index={i} />
        ))}
      </div>
    </div>
  );
}
