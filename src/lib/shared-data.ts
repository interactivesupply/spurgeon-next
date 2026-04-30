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

export interface SharedPageData {
  footer: SiteSettings;
  mbts: MBTSContent;
  timeline: TimelineContent;
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
};

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
    };
  } catch (err: any) {
    console.error('[getSharedPageData failed]', err?.message);
    return EMPTY;
  }
}
