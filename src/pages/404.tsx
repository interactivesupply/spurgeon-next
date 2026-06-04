import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { BookOpen, Search, ArrowLeft } from "lucide-react";
import PageHead from "@/components/PageHead";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    fetch("/api/log-404", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: window.location.pathname + window.location.search,
        referrer: document.referrer || "",
        agent: navigator.userAgent || "",
      }),
    }).catch(() => {});
  }, [router.isReady]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHead
        title="Page Not Found"
        description="The page you're looking for doesn't exist."
        canonicalPath="/404"
        robots="noindex,nofollow"
      />
      <div className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="max-w-md w-full text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground/20 mx-auto mb-6" />
          <h1 className="font-serif text-4xl font-bold text-foreground mb-3">
            Page Not Found
          </h1>
          <p className="font-sans text-base text-muted-foreground mb-8">
            The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-sans text-sm font-medium hover:bg-primary/90 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Go Home
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-border bg-card text-foreground rounded-lg font-sans text-sm font-medium hover:border-primary/40 transition-colors">
              <Search className="w-4 h-4" />
              Search the Library
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
