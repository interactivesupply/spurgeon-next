import type { GetServerSideProps } from 'next';
import { gql } from '@apollo/client';
import { apolloClient } from '@/lib/apollo-client';

/**
 * Both `morning_and_evening` and `faiths_check_book` CPTs share /devotionals
 * permalinks (they both rewrite to that prefix in WordPress). Editors clicking
 * "View Post" in wp-admin land here. Look the post up by slug, read its month
 * + day (+ period for M&E), and 302 to the appropriate book reader URL with
 * those values as query params so the date-picker initializes there.
 */
const LOOKUP = gql`
  query LookupDevotional($slug: ID!) {
    morningAndEveningEntry(id: $slug, idType: SLUG) {
      slug
      morningAndEveningFields { month day period }
    }
    faithsCheckBookEntry(id: $slug, idType: SLUG) {
      slug
      faithsCheckBookFields { month day }
    }
  }
`;

export default function DevotionalRedirect() {
  // Body should never render — getServerSideProps always redirects or 404s.
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string;
  if (!slug) return { notFound: true };

  try {
    const { data } = await apolloClient.query({
      query: LOOKUP,
      variables: { slug },
      fetchPolicy: 'no-cache',
    });
    const me = (data as any)?.morningAndEveningEntry;
    const fcb = (data as any)?.faithsCheckBookEntry;

    if (me?.morningAndEveningFields) {
      const f = me.morningAndEveningFields;
      const qs = new URLSearchParams();
      if (f.month) qs.set('month', f.month);
      if (f.day != null) qs.set('day', String(f.day));
      if (f.period) qs.set('period', f.period);
      return {
        redirect: {
          destination: `/books/morning-and-evening${qs.toString() ? `?${qs}` : ''}`,
          permanent: false,
        },
      };
    }
    if (fcb?.faithsCheckBookFields) {
      const f = fcb.faithsCheckBookFields;
      const qs = new URLSearchParams();
      if (f.month) qs.set('month', f.month);
      if (f.day != null) qs.set('day', String(f.day));
      return {
        redirect: {
          destination: `/books/faiths-check-book${qs.toString() ? `?${qs}` : ''}`,
          permanent: false,
        },
      };
    }
    return { notFound: true };
  } catch (err: any) {
    console.error('[devotionals/[slug] redirect failed]', slug, err?.message);
    return { notFound: true };
  }
};
