import type { GetStaticProps } from "next";
import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import WeeklyPulpit from "@/components/home/WeeklyPulpit";
import TimelineSection from "@/components/home/TimelineSection";
import ResourcesSection from "@/components/home/ResourcesSection";
import LibraryVisitSection from "@/components/home/LibraryVisitSection";
import FooterSection from "@/components/home/FooterSection";
import ScrollPopup from "@/components/home/ScrollPopup";
import MBTSBanner from "@/components/home/MBTSBanner";
import PageHead from "@/components/PageHead";
import { apolloClient } from "@/lib/apollo-client";
import { GET_HOME_PAGE_CONTENT } from "@/lib/queries";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

interface HomeProps {
  hero: any;
  stats: any[];
  resources: { eyebrow: string; heading: string; intro: string; items: any[] };
  libvisit: any;
  timeline: { eyebrow: string; heading: string; milestones: any[] };
  mbts: any;
  footer: any;
  nav: any;
  // Dynamic data:
  devotional: any | null;
  latestSermons: any[];
  featuredSermons: any[];
  featuredArticle: { title?: string; slug?: string; excerpt?: string } | null;
}

export default function Home(props: HomeProps) {
  const flatDevotional = props.devotional ? {
    title: props.devotional.title,
    text: props.devotional.content,
    scripture: props.devotional.morningAndEveningFields?.scripture,
  } : null;

  return (
    <div className="min-h-screen">
      <PageHead
        title="The Spurgeon Library"
        description="The Spurgeon Library is a resource from Midwestern Seminary, hosting Charles Haddon Spurgeon's sermons, books, magazine, articles, and personal collection — the most comprehensive Spurgeon resource on the web."
        suppressSiteSuffix
        type="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "The Spurgeon Library",
          alternateName: "Spurgeon.org",
          publisher: { "@type": "Organization", name: "Midwestern Baptist Theological Seminary" },
        }}
      />
      <HeroSection content={props.hero} />
      <StatsSection stats={props.stats} />
      <WeeklyPulpit
        devotional={flatDevotional}
        latestSermons={props.latestSermons}
        article={props.featuredArticle} />
      <TimelineSection
        eyebrow={props.timeline?.eyebrow}
        heading={props.timeline?.heading}
        milestones={props.timeline?.milestones} />
      <ResourcesSection
        eyebrow={props.resources?.eyebrow}
        heading={props.resources?.heading}
        intro={props.resources?.intro}
        items={props.resources?.items} />
      <LibraryVisitSection content={props.libvisit} />
      <MBTSBanner content={props.mbts} />
      <FooterSection settings={props.footer} footerColumns={props.nav?.footerColumns} />
      <ScrollPopup />
    </div>
  );
}

function imageUrl(field: any): string | null {
  return field?.node?.sourceUrl || null;
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const now = new Date();
  const variables = {
    month: MONTHS[now.getMonth()],
    day: String(now.getDate()),
  };

  // Fallback shape used when WordPress is unreachable. Component-level
  // defaults still kick in if these are empty.
  const empty: HomeProps = {
    hero: null, stats: [], resources: null as any, libvisit: null,
    timeline: null as any, mbts: null, footer: null, nav: null,
    devotional: null, latestSermons: [], featuredSermons: [], featuredArticle: null,
  };

  try {
    const { data } = await apolloClient.query({
      query: GET_HOME_PAGE_CONTENT,
      variables,
    });
    const d: any = data;
    const settings = d?.spurgeonSettings?.siteSettings || {};
    const home = d?.page?.homePageFields || {};

    const props: HomeProps = {
      hero: {
        eyebrow: home.heroEyebrow,
        titleTop: home.heroTitleTop,
        titleBottom: home.heroTitleBottom,
        body: home.heroBody,
        backgroundImage: imageUrl(home.heroBackgroundImage),
        searchPlaceholder: home.heroSearchPlaceholder,
        quickSearches: (home.heroQuickSearches || []).map((q: any) => q.term).filter(Boolean),
      },
      stats: home.statsItems || [],
      resources: {
        eyebrow: home.resourcesEyebrow,
        heading: home.resourcesHeading,
        intro: home.resourcesIntro,
        items: (home.resourcesItems || []).map((r: any) => ({
          icon: r.icon,
          title: r.title,
          description: r.description,
          count: r.count,
          searchTerm: r.searchTerm,
          url: r.url || null,
        })),
      },
      libvisit: {
        eyebrow: home.libvisitEyebrow,
        titleTop: home.libvisitTitleTop,
        titleBottom: home.libvisitTitleBottom,
        body1: home.libvisitBody1,
        body2: home.libvisitBody2,
        image: imageUrl(home.libvisitImage),
        badgeNumber: home.libvisitBadgeNumber,
        badgeCaption: home.libvisitBadgeCaption,
        locationLabel: home.libvisitLocationLabel,
        locationLines: home.libvisitLocationLines,
        hoursLabel: home.libvisitHoursLabel,
        hoursLines: home.libvisitHoursLines,
        primaryLabel: home.libvisitPrimaryLabel,
        primaryUrl: home.libvisitPrimaryUrl,
        secondaryLabel: home.libvisitSecondaryLabel,
        secondaryUrl: home.libvisitSecondaryUrl,
      },
      timeline: {
        eyebrow: settings.timelineEyebrow,
        heading: settings.timelineHeading,
        milestones: settings.timelineMilestones || [],
      },
      mbts: {
        eyebrow: settings.mbtsEyebrow,
        heading: settings.mbtsHeading,
        body: settings.mbtsBody,
        ctaLabel: settings.mbtsCtaLabel,
        ctaUrl: settings.mbtsCtaUrl,
      },
      footer: {
        signatureImage: imageUrl(settings.footerSignatureImage),
        aboutText: settings.footerAboutText,
        quote: settings.footerQuote,
        quoteAuthor: settings.footerQuoteAuthor,
        mbtsPursueLabel: settings.footerMbtsPursueLabel,
        mbtsPursueUrl: settings.footerMbtsPursueUrl,
        copyrightLine: settings.footerCopyrightLine,
      },
      // Navigation (header mega-menus, inline links, footer columns) is
      // also read from spurgeonSettings.navigationSettings; passes straight
      // through. Layout (via _app pageProps.shared.nav) is what consumes
      // this; we also pass shared in the page props shape so _app picks it up.
      nav: (data as any)?.spurgeonSettings?.navigationSettings || null,
      devotional: d?.todayDevotional?.nodes?.[0] || null,
      latestSermons: d?.latestSermons?.nodes || [],
      // Editor-curated picks first (homePageFields.featuredSermons); if no
      // picks are set, fall back to the latest 6 sermons by date so the
      // section never renders empty.
      featuredSermons:
        home.featuredSermons?.nodes?.length
          ? home.featuredSermons.nodes
          : (d?.fallbackFeaturedSermons?.nodes || []),
      featuredArticle: d?.featuredArticle?.nodes?.[0] || null,
    };

    return { props, revalidate: 3600 };
  } catch (err: any) {
    console.error('[GetHomePageContent failed]', err?.message);
    return { props: empty, revalidate: 60 };
  }
};
