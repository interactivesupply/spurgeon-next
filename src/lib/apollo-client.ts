import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || '';

const httpLink = createHttpLink({
  uri: `${wpUrl}/graphql`,
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
