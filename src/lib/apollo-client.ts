import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || '';

/**
 * Two-mode HTTP link:
 * - Server-side (SSR/SSG/API routes): hits WordPress directly with basic
 *   auth from server-only env vars.
 * - Browser: hits our own /api/graphql proxy, which forwards to WordPress
 *   with the basic auth header attached server-side. No credentials in
 *   client JS, no CORS issues with the basic auth gate.
 *
 * Once the production WP install no longer requires basic auth, the
 * proxy still works fine — it's just a passthrough.
 */
const isServer = typeof window === 'undefined';

const ssrUser = process.env.WORDPRESS_BASIC_AUTH_USER;
const ssrPass = process.env.WORDPRESS_BASIC_AUTH_PASSWORD;
const ssrAuthHeader = isServer && ssrUser && ssrPass
  ? 'Basic ' + Buffer.from(`${ssrUser}:${ssrPass}`).toString('base64')
  : null;

const httpLink = createHttpLink({
  uri: isServer ? `${wpUrl}/graphql` : '/api/graphql',
  headers: ssrAuthHeader ? { Authorization: ssrAuthHeader } : {},
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    // SSR/SSG should always hit WordPress fresh so getStaticProps + ISR
    // are the single source of cache truth. Browser queries cache normally
    // for fast in-session navigation.
    query: { fetchPolicy: isServer ? 'no-cache' : 'cache-first' },
    watchQuery: { fetchPolicy: isServer ? 'no-cache' : 'cache-first' },
  },
  ssrMode: isServer,
});
