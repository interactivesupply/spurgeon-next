import type { GetStaticProps } from "next";
import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import WeeklyPulpit from "@/components/home/WeeklyPulpit";
import FeaturedSermons from "@/components/home/FeaturedSermons";
import TimelineSection from "@/components/home/TimelineSection";
import ResourcesSection from "@/components/home/ResourcesSection";
import LibraryVisitSection from "@/components/home/LibraryVisitSection";
import FooterSection from "@/components/home/FooterSection";
import ScrollPopup from "@/components/home/ScrollPopup";
import MBTSBanner from "@/components/home/MBTSBanner";
import { apolloClient } from "@/lib/apollo-client";
import { GET_HOME_DATA } from "@/lib/queries";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

interface HomeProps {
  devotional: { title?: string; content?: string; scripture?: string } | null;
  latestSermons: any[];
  featuredSermons: any[];
  featuredArticle: { title?: string; slug?: string; excerpt?: string } | null;
}

export default function Home({ devotional, latestSermons, featuredSermons, featuredArticle }: HomeProps) {
  // Reshape the devotional for WeeklyPulpit (which expects a flat shape).
  const flatDevotional = devotional ? {
    title: devotional.title,
    text: devotional.content,
    scripture: (devotional as any)?.devotionalEntryFields?.scripture || devotional.scripture,
  } : null;

  return (
    <div className="min-h-screen">
      <HeroSection />
      <StatsSection />
      <WeeklyPulpit
        devotional={flatDevotional}
        latestSermons={latestSermons}
        article={featuredArticle} />
      <FeaturedSermons sermons={featuredSermons} />
      <TimelineSection />
      <ResourcesSection />
      <LibraryVisitSection />
      <MBTSBanner />
      <FooterSection />
      <ScrollPopup />
    </div>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const now = new Date();
  const variables = {
    month: MONTHS[now.getMonth()],
    day: String(now.getDate()),
  };

  try {
    const { data } = await apolloClient.query({
      query: GET_HOME_DATA,
      variables,
    });
    const d: any = data;
    const todayDevotionalNode = d?.todayDevotional?.nodes?.[0] || null;
    return {
      props: {
        devotional: todayDevotionalNode ? {
          title: todayDevotionalNode.title,
          content: todayDevotionalNode.content,
          scripture: todayDevotionalNode.devotionalEntryFields?.scripture || null,
        } as any : null,
        latestSermons: d?.latestSermons?.nodes || [],
        featuredSermons: d?.featuredSermons?.nodes || [],
        featuredArticle: d?.featuredArticle?.nodes?.[0] || null,
      },
      revalidate: 3600,
    };
  } catch {
    // WordPress unreachable; render placeholders.
    return {
      props: {
        devotional: null,
        latestSermons: [],
        featuredSermons: [],
        featuredArticle: null,
      },
      revalidate: 60,
    };
  }
};
