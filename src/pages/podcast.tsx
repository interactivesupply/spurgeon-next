import React from "react";
import type { GetStaticProps } from "next";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { ArrowLeft, Headphones } from "lucide-react";
import FooterSection from "@/components/home/FooterSection";
import { getSharedPageData, type SharedPageData } from "@/lib/shared-data";

interface PodcastProps {
  shared: SharedPageData;
}

/**
 * Placeholder page for the Spurgeon Library podcast. The Our Resources
 * mega-menu links here so visitors who click "Podcast" land on a real
 * page instead of a 404. Replace this with the actual podcast feed/
 * episode list once the first episode is published (Userback #7692209).
 */
export default function PodcastComingSoon({ shared }: PodcastProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="max-w-xl text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent/15 flex items-center justify-center">
            <Headphones className="w-7 h-7 text-accent" />
          </div>
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-accent mb-3">Coming Soon</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            The Spurgeon For Today Podcast
          </h1>
          <p className="font-sans text-muted-foreground text-base leading-relaxed mb-10">
            A new conversation on Spurgeon's life and legacy — the first
            episodes are in production. Check back soon, or follow the
            Library for updates.
          </p>
          <Link
            href={ROUTES.Home}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border font-sans text-sm text-foreground hover:border-primary/40 hover:text-primary transition-all">
            <ArrowLeft className="w-4 h-4" />
            Back to the Library
          </Link>
        </div>
      </div>
      <FooterSection settings={shared?.footer} footerColumns={shared?.nav?.footerColumns} />
    </div>
  );
}

export const getStaticProps: GetStaticProps<PodcastProps> = async () => {
  const shared = await getSharedPageData();
  return { props: { shared }, revalidate: 3600 };
};
