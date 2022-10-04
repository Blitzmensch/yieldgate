import { Layout } from '@components/layout/Layout'
import { cache } from '@emotion/css'
import { CacheProvider } from '@emotion/react'
import { chains, wagmiClient } from '@lib/wagmiClient'
import { lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import GlobalStyles from '@styles/GlobalStyles'
import { DefaultSeo } from 'next-seo'
import type { AppProps } from 'next/app'
import Router from 'next/router'
import nProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { WagmiConfig } from 'wagmi'

// Router Loading Animation with @tanem/react-nprogress
Router.events.on('routeChangeStart', () => nProgress.start())
Router.events.on('routeChangeComplete', () => nProgress.done())
Router.events.on('routeChangeError', () => nProgress.done())

const MyApp = ({ Component, pageProps }: AppProps): JSX.Element => {
  return (
    <>
      <DefaultSeo
        defaultTitle="Stake for Earth"
        description="Do something good for our climate at zero cost. – All with yield."
        openGraph={{
          type: 'website',
          locale: 'en',
          url: 'https://stakefor.earth',
          site_name: 'Stake for Earth',
          // TODO
          // images: [
          //   {
          //     url: `${env.url}/og/og.jpg`,
          //     width: 1728,
          //     height: 972,
          //   },
          // ],
        }}
      />

      <CacheProvider value={cache}>
        <GlobalStyles />
        <WagmiConfig client={wagmiClient}>
          <RainbowKitProvider
            chains={chains}
            theme={lightTheme({
              accentColor: '#edf2f7',
              accentColorForeground: '#1a202c',
              borderRadius: 'medium',
              fontStack: 'system',
              overlayBlur: 'small',
            })}
          >
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </RainbowKitProvider>
        </WagmiConfig>
      </CacheProvider>
    </>
  )
}

export default MyApp
