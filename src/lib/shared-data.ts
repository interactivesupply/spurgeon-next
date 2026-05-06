import { gql } from '@apollo/client';
import { apolloClient } from './apollo-client';

const GET_SITE_SETTINGS = gql`
  query GetSiteSettings {
    spurgeonSettings {
      siteSettings {
        footerSignatureImage { node { sourceUrl altText } }
        footerAboutText
        footerQuote
        footerQuoteAuthor
        footerMbtsPursueLabel
        footerMbtsPursueUrl
        mbtsEyebrow
        mbtsHeading
        mbtsBody
        mbtsCtaLabel
        mbtsCtaUrl
        timelineEyebrow
        timelineHeading
        timelineMilestones {
          year
          title
          description
        }
      }
      navigationSettings {
        headerSpurgeonWorks {
          id label icon description ctaLabel ctaUrl
          links { label url }
        }
        headerCenterResources {
          id label icon description ctaLabel ctaUrl
          links { label url }
        }
        headerInlineLinks {
          label url
        }
        footerColumns {
          heading
          links { label url newTab }
        }
      }
    }
  }
`;

export interface SiteSettings {
  signatureImage: string | null;
  aboutText: string;
  quote: string;
  quoteAuthor: string;
  mbtsPursueLabel: string;
  mbtsPursueUrl: string;
}

export interface MBTSContent {
  eyebrow: string;
  heading: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
}

export interface TimelineContent {
  eyebrow: string;
  heading: string;
  milestones: { year: string; title: string; description: string }[];
}

export interface NavLink { label: string; url: string }
export interface NavMegaMenuColumn {
  id: string;
  label: string;
  icon: string;        // Lucide icon name
  description: string;
  links: NavLink[];
  ctaLabel: string;
  ctaUrl: string;
}
export interface NavFooterColumn {
  heading: string;
  links: (NavLink & { newTab?: boolean })[];
}
export interface NavigationContent {
  headerSpurgeonWorks: NavMegaMenuColumn[];
  headerCenterResources: NavMegaMenuColumn[];
  headerInlineLinks: NavLink[];
  footerColumns: NavFooterColumn[];
}

export interface SharedPageData {
  footer: SiteSettings;
  mbts: MBTSContent;
  timeline: TimelineContent;
  nav: NavigationContent;
}

const EMPTY: SharedPageData = {
  footer: {
    signatureImage: null,
    aboutText: '',
    quote: '',
    quoteAuthor: '',
    mbtsPursueLabel: '',
    mbtsPursueUrl: '',
  },
  mbts: { eyebrow: '', heading: '', body: '', ctaLabel: '', ctaUrl: '' },
  timeline: { eyebrow: '', heading: '', milestones: [] },
  nav: { headerSpurgeonWorks: [], headerCenterResources: [], headerInlineLinks: [], footerColumns: [] },
};

/**
 * Convert WPGraphQL-for-ACF's navigation shape into our typed structure.
 * Repeater rows map straight through; we just default empty fields and
 * trim to the props the components consume.
 */
function reshapeNav(n: any): NavigationContent {
  const reshapeMega = (cols: any[] = []): NavMegaMenuColumn[] =>
    cols.map((c: any) => ({
      id: c.id || '',
      label: c.label || '',
      icon: c.icon || '',
      description: c.description || '',
      ctaLabel: c.ctaLabel || '',
      ctaUrl: c.ctaUrl || '',
      links: (c.links || []).map((l: any) => ({ label: l.label || '', url: l.url || '' })),
    }));
  return {
    headerSpurgeonWorks:    reshapeMega(n?.headerSpurgeonWorks),
    headerCenterResources:  reshapeMega(n?.headerCenterResources),
    headerInlineLinks:      (n?.headerInlineLinks || []).map((l: any) => ({ label: l.label || '', url: l.url || '' })),
    footerColumns:          (n?.footerColumns || []).map((c: any) => ({
      heading: c.heading || '',
      links: (c.links || []).map((l: any) => ({ label: l.label || '', url: l.url || '', newTab: !!l.newTab })),
    })),
  };
}

/**
 * Fetch the site settings shared by every page (footer, MBTS banner, timeline).
 * Used in getStaticProps so the page can pass them down to FooterSection,
 * MBTSBanner, TimelineSection, etc. Falls back to empty values if WordPress
 * is unreachable (the components themselves carry hardcoded defaults).
 */
export async function getSharedPageData(): Promise<SharedPageData> {
  try {
    const { data } = await apolloClient.query({ query: GET_SITE_SETTINGS });
    const s = (data as any)?.spurgeonSettings?.siteSettings || {};
    return {
      footer: {
        signatureImage: s.footerSignatureImage?.node?.sourceUrl || null,
        aboutText: s.footerAboutText || '',
        quote: s.footerQuote || '',
        quoteAuthor: s.footerQuoteAuthor || '',
        mbtsPursueLabel: s.footerMbtsPursueLabel || '',
        mbtsPursueUrl: s.footerMbtsPursueUrl || '',
      },
      mbts: {
        eyebrow: s.mbtsEyebrow || '',
        heading: s.mbtsHeading || '',
        body: s.mbtsBody || '',
        ctaLabel: s.mbtsCtaLabel || '',
        ctaUrl: s.mbtsCtaUrl || '',
      },
      timeline: {
        eyebrow: s.timelineEyebrow || '',
        heading: s.timelineHeading || '',
        milestones: s.timelineMilestones || [],
      },
      nav: reshapeNav((data as any)?.spurgeonSettings?.navigationSettings),
    };
  } catch (err: any) {
    console.error('[getSharedPageData failed]', err?.message);
    return EMPTY;
  }
}
