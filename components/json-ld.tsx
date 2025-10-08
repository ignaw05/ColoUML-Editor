export default function JsonLd() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "ColoUML Editor",
    "description": "Editor PlantUML online gratis con autocompletado inteligente y autoguardado para crear diagramas UML profesionales",
    "url": "https://colo-uml-editor.vercel.app",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Editor PlantUML online",
      "Autocompletado inteligente",
      "Autoguardado automático",
      "Diagramas de clases",
      "Diagramas de secuencia",
      "Casos de uso",
      "Vista previa en tiempo real"
    ],
    "inLanguage": "es",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "softwareVersion": "1.0",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "ratingCount": "1"
    },
    "author": {
      "@type": "Organization",
      "name": "ColoUML"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  )
}
