import type { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { apolloClient } from '@/lib/apollo-client';
import { queryClient } from '@/lib/query-client';
import Layout from '@/components/Layout';
import PreviewBanner from '@/components/PreviewBanner';
import UserbackLoader from '@/components/UserbackLoader';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={apolloClient}>
      <QueryClientProvider client={queryClient}>
        <PreviewBanner />
        <UserbackLoader />
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </QueryClientProvider>
    </ApolloProvider>
  );
}
