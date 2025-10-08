"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { FileCode2, Eye, Trash2, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import CodeMirror from "@uiw/react-codemirror"
import { EditorView } from "@codemirror/view"
import { plantumlLanguage } from "@/lib/plantuml-lang"

const DEFAULT_CODE = `@startuml
actor Colo
participant "UIColoUML"
Colo -> UIColoUML: jaja hice mi editor
UIColoUML --> Colo
@enduml`

const STORAGE_KEY = "plantuml-code"
const AUTOSAVE_DELAY = 1000

export default function PlantUMLEditor() {
  const [code, setCode] = useState(DEFAULT_CODE)
  const diagramWindowRef = useRef<Window | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [copied, setCopied] = useState(false)
  const [editorTheme, setEditorTheme] = useState<'light' | 'dark'>('light')
  const { toast } = useToast()

  // Load code from localStorage on mount
  useEffect(() => {
    const savedCode = localStorage.getItem(STORAGE_KEY)
    if (savedCode) {
      setCode(savedCode)
      setLastSaved(new Date())
    }
  }, [])

  // Autosave to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, code)
      setLastSaved(new Date())
    }, AUTOSAVE_DELAY)

    return () => clearTimeout(timer)
  }, [code])

  const generateDiagram = useCallback(async () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Por favor escribe código PlantUML",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })

      const data = await response.json()

      if (data.url) {
        // Check if the diagram window is still open
        if (!diagramWindowRef.current || diagramWindowRef.current.closed) {
          // Open a new window if it doesn't exist or was closed
          diagramWindowRef.current = window.open("", "plantuml-diagram", "width=1200,height=800")

          if (diagramWindowRef.current) {
            // Write initial HTML structure
            diagramWindowRef.current.document.open()
            diagramWindowRef.current.document.write(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>ColoUML Diagram</title>
                  <style>
                    body {
                      margin: 0;
                      padding: 20px;
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      min-height: 100vh;
                      background: #f5f5f5;
                    }
                    img {
                      max-width: 100%;
                      height: auto;
                      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                      background: white;
                      padding: 20px;
                      border-radius: 8px;
                    }
                  </style>
                </head>
                <body>
                  <img id="diagram" src="${data.url}" alt="ColoUML Diagram" />
                </body>
              </html>
            `)
            diagramWindowRef.current.document.close()
          }
        } else {
          // Update existing image
          const img = diagramWindowRef.current.document.getElementById("diagram") as HTMLImageElement
          if (img) {
            img.src = data.url
          }
        }

        toast({
          title: "Diagrama generado",
          description: "Tu diagrama ColoUML está listo en la nueva pestaña",
        })
      } else {
        throw new Error("No se pudo generar la URL")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el diagrama",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [code, toast])

  const insertSnippet = (snippet: string) => {
    setCode((prev) => prev + snippet)
    toast({
      title: "Snippet insertado",
      description: "Bloque agregado al editor",
    })
  }

  const insertLoop = () => {
    insertSnippet("\nloop [condition]\n  \nend\n")
  }

  const insertAlt = () => {
    insertSnippet("\nalt [condition]\n  \nelse\n  \nend\n")
  }

  const insertClass = () => {
    insertSnippet("\nclass ClassName {\n  +attribute: Type\n  +method()\n}\n")
  }

  const clearCode = () => {
    setCode(DEFAULT_CODE)
    diagramWindowRef.current?.close()
    localStorage.removeItem(STORAGE_KEY)
    toast({
      title: "Editor limpiado",
      description: "El código ha sido restaurado al ejemplo por defecto",
    })
  }

  const copyCode = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "Copiado",
      description: "Código copiado al portapapeles",
    })
  }

  const toggleTheme = () => {
    setEditorTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FileCode2 className="h-6 w-6" />
              <h1 className="text-xl font-semibold">ColoUML Editor</h1>
            </div>
            {lastSaved && (
              <span className="text-xs text-muted-foreground">Guardado {lastSaved.toLocaleTimeString()}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={copyCode}>
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              Copiar
            </Button>
            <Button variant="outline" size="sm" onClick={clearCode}>
              <Trash2 className="mr-2 h-4 w-4" />
              Limpiar
            </Button>
            <Button onClick={generateDiagram} disabled={isLoading}>
              <Eye className="mr-2 h-4 w-4" />
              {isLoading ? "Generando..." : "Generar Diagrama"}
            </Button>
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              {editorTheme === 'light' ? 'Oscuro' : 'Claro'}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Editor Panel */}
        <div className="flex items-center justify-between border-b border-border bg-muted px-4 py-2">
          <span className="text-sm font-medium text-muted-foreground">Editor</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={insertLoop} className="h-7 text-xs">
              Loop
            </Button>
            <Button variant="ghost" size="sm" onClick={insertAlt} className="h-7 text-xs">
              Alt
            </Button>
            <Button variant="ghost" size="sm" onClick={insertClass} className="h-7 text-xs">
              Class
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <CodeMirror
            value={code}
            height="100%"
            onChange={(value) => setCode(value)}
            extensions={[plantumlLanguage, EditorView.lineWrapping]}
            theme={editorTheme}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLineGutter: true,
              highlightSpecialChars: true,
              foldGutter: true,
              drawSelection: true,
              dropCursor: true,
              allowMultipleSelections: true,
              indentOnInput: true,
              syntaxHighlighting: true,
              bracketMatching: true,
              closeBrackets: true,
              autocompletion: true,
              rectangularSelection: true,
              crosshairCursor: true,
              highlightActiveLine: true,
              highlightSelectionMatches: true,
              closeBracketsKeymap: true,
              defaultKeymap: true,
              searchKeymap: true,
              historyKeymap: true,
              foldKeymap: true,
              completionKeymap: true,
              lintKeymap: true,
            }}
            className="h-full"
            style={{ height: "100%", fontSize: "14px", background: editorTheme === 'light' ? '#fff' : '#18181b' }}
          />
        </div>
      </div>

      <Toaster />
    </div>
  )
}
