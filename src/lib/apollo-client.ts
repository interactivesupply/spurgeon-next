import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || '';

/**
 * Optional HTTP Basic Auth for the WordPress install.
 * These vars are intentionally NOT prefixed with NEXT_PUBLIC_ — they're
 * available only during SSR/SSG/API-route execution, never bundled into
 * the client JavaScript. Browser-side queries (useQuery/useLazyQuery) will
 * NOT include the credentials, which is correct: WordPress basic auth
 * should be removed on the install before browser-side queries can work.
 */
const basicAuthUser = process.env.WORDPRESS_BASIC_AUTH_USER;
const basicAuthPassword = process.env.WORDPRESS_BASIC_AUTH_PASSWORD;
const basicAuthHeader =
  basicAuthUser && basicAuthPassword && typeof window === 'undefined'
    ? 'Basic ' + Buffer.from(`${basicAuthUser}:${basicAuthPassword}`).toString('base64')
    : null;

const httpLink = createHttpLink({
  uri: `${wpUrl}/graphql`,
  headers: basicAuthHeader ? { Authorization: basicAuthHeader } : {},
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    query: { fetchPolicy: 'cache-first' },
    watchQuery: { fetchPolicy: 'cache-first' },
  },
  ssrMode: typeof window === 'undefined',
});
