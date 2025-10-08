// Google Analytics Component
// Descomenta y usa este componente cuando tengas tu ID de Google Analytics

/*
import Script from 'next/script'

export default function GoogleAnalytics({ gaId }: { gaId: string }) {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  )
}

// Luego agrégalo en layout.tsx:
// import GoogleAnalytics from '@/components/google-analytics'
// Y dentro del body: <GoogleAnalytics gaId="G-XXXXXXXXXX" />
*/

export default function GoogleAnalytics() {
  return null
}
