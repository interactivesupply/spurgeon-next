import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || '';
const isServer = typeof window === 'undefined';

/**
 * Default Apollo client for unauthenticated GraphQL queries — used for
 * everything the public site renders. Browser and server both hit
 * WordPress directly. SSR/SSG paths use no-cache so getStaticProps + ISR
 * are the cache layer; the browser uses cache-first for fast in-session
 * navigation.
 */
export const apolloClient = new ApolloClient({
  link: createHttpLink({ uri: `${wpUrl}/graphql` }),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: { fetchPolicy: isServer ? 'no-cache' : 'cache-first' },
    watchQuery: { fetchPolicy: isServer ? 'no-cache' : 'cache-first' },
  },
  ssrMode: isServer,
});

/**
 * Authenticated Apollo client for preview-only SSR queries. Sends the
 * preview-bot Application Password as Basic Auth so WPGraphQL accepts
 * `asPreview: true` and returns the latest autosaved revision (lets
 * editors see unsaved changes via the Preview button).
 *
 * Lazily constructed — env vars aren't always present (preview-bot
 * credentials don't ship to production builds), and we don't want to
 * read them at module load.
 *
 * Server-only: callers should only invoke this from getStaticProps /
 * getServerSideProps / API routes, never from React components.
 */
let _previewClient: ApolloClient | null = null;
export function apolloPreviewClient(): ApolloClient {
  if (_previewClient) return _previewClient;

  const user = process.env.WP_PREVIEW_USER;
  const pass = process.env.WP_PREVIEW_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error(
      'apolloPreviewClient: WP_PREVIEW_USER / WP_PREVIEW_APP_PASSWORD not set. ' +
        'Generate an Application Password for an Editor user and add both to .env.local.'
    );
  }
  // App passwords come back from WP with spaces for readability; WP accepts
  // them with or without, but normalize so we don't have whitespace inside
  // a base64-encoded credential.
  const cred = Buffer.from(`${user}:${pass.replace(/\s+/g, '')}`).toString('base64');

  _previewClient = new ApolloClient({
    link: createHttpLink({
      uri: `${wpUrl}/graphql`,
      headers: { Authorization: `Basic ${cred}` },
    }),
    cache: new InMemoryCache(),
    defaultOptions: {
      query: { fetchPolicy: 'no-cache' },
      watchQuery: { fetchPolicy: 'no-cache' },
    },
    ssrMode: true,
  });
  return _previewClient;
}
