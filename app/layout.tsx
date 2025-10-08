import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://colo-uml-editor.vercel.app'),
  title: {
    default: 'ColoUML Editor - Editor PlantUML Online Gratis en Español',
    template: '%s | ColoUML Editor',
  },
  description: 'Editor PlantUML online gratis con autocompletado inteligente y autoguardado. Crea diagramas UML, diagramas de clases, diagramas de secuencia, casos de uso y más. Herramienta profesional en español para desarrolladores.',
  keywords: [
    'plantuml online',
    'editor plantuml',
    'editor uml online',
    'diagrama online',
    'diagrama de clases online',
    'diagrama de secuencia online',
    'casos de uso online',
    'editor uml gratis',
    'crear diagramas uml',
    'plantuml español',
    'editor uml español',
    'herramienta uml',
    'diagrama de arquitectura',
    'modelado uml',
    'uml online gratis',
    'editor plantuml gratis',
    'autocompletado plantuml',
  ],
  authors: [{ name: 'ColoUML' }],
  creator: 'ColoUML',
  publisher: 'ColoUML',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://colo-uml-editor.vercel.app',
    title: 'ColoUML Editor - Editor PlantUML Online Gratis en Español',
    description: 'Editor PlantUML online gratis con autocompletado inteligente y autoguardado. Crea diagramas UML profesionales en segundos.',
    siteName: 'ColoUML Editor',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ColoUML Editor - Editor PlantUML Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ColoUML Editor - Editor PlantUML Online Gratis',
    description: 'Editor PlantUML online con autocompletado inteligente. Crea diagramas UML, de clases, secuencia y más.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Agregar después: google: 'tu-código-de-verificación',
    // yandex: 'tu-código-de-verificación',
  },
  alternates: {
    canonical: 'https://colo-uml-editor.vercel.app',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
