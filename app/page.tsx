import PlantUMLEditor from "@/components/plantuml-editor"
import JsonLd from "@/components/json-ld"

export default function Home() {
  return (
    <>
      <JsonLd />
      
      {/* SEO-friendly content */}
      <div className="sr-only">
        <h1>Editor PlantUML Online Gratis - ColoUML Editor</h1>
        <h2>Crea Diagramas UML Profesionales con Autocompletado Inteligente</h2>
        <p>
          ColoUML Editor es la mejor herramienta online gratuita para crear diagramas PlantUML en español. 
          Editor con autocompletado inteligente que sugiere clases, participantes y actores mientras escribes.
        </p>
        <h3>Características principales:</h3>
        <ul>
          <li>Editor PlantUML online gratis sin registro</li>
          <li>Autocompletado inteligente de clases, participantes y actores</li>
          <li>Autoguardado automático en tu navegador</li>
          <li>Creación de diagramas de clases online</li>
          <li>Diagramas de secuencia y casos de uso</li>
          <li>Vista previa instantánea de diagramas UML</li>
          <li>Interfaz profesional en español</li>
          <li>Snippets predefinidos para loop, alt y class</li>
        </ul>
        <h3>¿Qué es PlantUML?</h3>
        <p>
          PlantUML es un lenguaje de modelado que permite crear diagramas UML de forma rápida y sencilla 
          usando código de texto plano. Es ideal para desarrolladores, arquitectos de software y estudiantes 
          que necesitan crear diagramas de clases, diagramas de secuencia, casos de uso, y mucho más.
        </p>
        <h3>¿Por qué usar ColoUML Editor?</h3>
        <p>
          A diferencia de otros editores PlantUML online, ColoUML Editor incluye autocompletado inteligente 
          que detecta automáticamente tus clases, participantes y actores, facilitando la escritura de código 
          PlantUML. El autoguardado asegura que nunca pierdas tu trabajo.
        </p>
        <h3>Casos de uso:</h3>
        <ul>
          <li>Crear diagramas de clases para proyectos de software</li>
          <li>Diseñar diagramas de secuencia para documentación técnica</li>
          <li>Modelar casos de uso para análisis de requerimientos</li>
          <li>Crear diagramas de arquitectura de software</li>
          <li>Documentar APIs y sistemas complejos</li>
        </ul>
      </div>

      <main className="h-screen w-full">
        <PlantUMLEditor />
      </main>
    </>
  )
}
