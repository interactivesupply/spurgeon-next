import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { ApolloProvider } from '@apollo/client/react';
import { QueryClientProvider } from '@tanstack/react-query';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { apolloClient } from '@/lib/apollo-client';
import { queryClient } from '@/lib/query-client';
import Layout from '@/components/Layout';
import PreviewBanner from '@/components/PreviewBanner';
import UserbackLoader from '@/components/UserbackLoader';
import '@/styles/globals.css';

// Subtle top progress bar during Next.js route transitions so users see
// their clicks register immediately, even before the next page paints.
NProgress.configure({ showSpinner: false, trickleSpeed: 120, minimum: 0.15 });

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    // Only flash the bar when navigation takes longer than 100ms — instant
    // transitions don't need the indicator and would make the UI feel jumpy.
    const start = () => {
      timeout = setTimeout(() => NProgress.start(), 100);
    };
    const done = () => {
      if (timeout) { clearTimeout(timeout); timeout = null; }
      NProgress.done();
    };
    router.events.on('routeChangeStart', start);
    router.events.on('routeChangeComplete', done);
    router.events.on('routeChangeError', done);
    return () => {
      router.events.off('routeChangeStart', start);
      router.events.off('routeChangeComplete', done);
      router.events.off('routeChangeError', done);
    };
  }, [router]);

  // Pages that use getSharedPageData() expose `shared` via pageProps; the
  // home page builds its own props directly and exposes `nav` at the top
  // level. Try both sources; fall back to hardcoded menus otherwise.
  const pp = pageProps as any;
  const nav = pp?.shared?.nav || pp?.nav;
  return (
    <ApolloProvider client={apolloClient}>
      <QueryClientProvider client={queryClient}>
        <PreviewBanner />
        <UserbackLoader />
        <Layout nav={nav}>
          <Component {...pageProps} />
        </Layout>
      </QueryClientProvider>
    </ApolloProvider>
  );
}
