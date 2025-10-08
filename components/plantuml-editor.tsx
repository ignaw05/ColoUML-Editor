"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { FileCode2, Eye, Trash2, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

const DEFAULT_CODE = `@startuml
actor Colo
participant "UIColoPlantUML"
Colo -> UIColoPlantUML: jaja hice mi editor
UIColoPlantUML --> Colo
@enduml`

const STORAGE_KEY = "plantuml-code"
const AUTOSAVE_DELAY = 1000

export default function PlantUMLEditor() {
  const [code, setCode] = useState(DEFAULT_CODE)
  const diagramWindowRef = useRef<Window | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0)
  const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 })
  const suggestionsRef = useRef<HTMLDivElement>(null)

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

  // Extract participants and actors from code
  const extractEntities = useCallback((text: string): string[] => {
    const entities = new Set<string>()
    const lines = text.split("\n")

    for (const line of lines) {
      // Match participant "Name" or participant Name
      const participantMatch = line.match(/participant\s+(?:"([^"]+)"|(\S+))/)
      if (participantMatch) {
        entities.add(participantMatch[1] || participantMatch[2])
      }

      // Match actor Name
      const actorMatch = line.match(/actor\s+(?:"([^"]+)"|(\S+))/)
      if (actorMatch) {
        entities.add(actorMatch[1] || actorMatch[2])
      }
    }

    return Array.from(entities)
  }, [])

  // Handle autocomplete
  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newCode = e.target.value
      setCode(newCode)

      const textarea = e.target
      const cursorPos = textarea.selectionStart
      const textBeforeCursor = newCode.substring(0, cursorPos)

      // Check if we're after an arrow (-> or -->)
      const arrowMatch = textBeforeCursor.match(/(?:->|-->)\s*(\S*)$/)
      
      // Check if we're typing a word at the beginning of a line or after whitespace
      const wordMatch = textBeforeCursor.match(/(?:^|\s)(\S+)$/)

      let partialText = ""
      let shouldShowSuggestions = false

      if (arrowMatch) {
        partialText = arrowMatch[1]
        shouldShowSuggestions = true
      } else if (wordMatch) {
        partialText = wordMatch[1]
        // Only show suggestions if we have at least one character
        shouldShowSuggestions = partialText.length > 0
      }

      if (shouldShowSuggestions) {
        const entities = extractEntities(newCode)

        if (entities.length > 0) {
          const filtered = entities.filter((entity) => 
            entity.toLowerCase().startsWith(partialText.toLowerCase()) && 
            entity.toLowerCase() !== partialText.toLowerCase() // Don't suggest if it's already complete
          )

          if (filtered.length > 0) {
            setSuggestions(filtered)
            setShowSuggestions(true)
            setSelectedSuggestionIndex(0)

            // Calculate cursor position for suggestions dropdown
            const lines = textBeforeCursor.split("\n")
            const currentLine = lines.length
            const currentColumn = lines[lines.length - 1].length

            // Approximate position (you might need to adjust these values)
            setCursorPosition({
              top: currentLine * 20 + 60, // Approximate line height
              left: currentColumn * 8 + 20, // Approximate char width
            })
          } else {
            setShowSuggestions(false)
          }
        } else {
          setShowSuggestions(false)
        }
      } else {
        setShowSuggestions(false)
      }
    },
    [extractEntities]
  )

  // Handle keyboard navigation in suggestions
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!showSuggestions) return

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedSuggestionIndex((prev) => (prev + 1) % suggestions.length)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedSuggestionIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length)
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault()
        insertSuggestion(suggestions[selectedSuggestionIndex])
      } else if (e.key === "Escape") {
        setShowSuggestions(false)
      }
    },
    [showSuggestions, suggestions, selectedSuggestionIndex]
  )

  const insertSuggestion = useCallback(
    (suggestion: string) => {
      const textarea = textareaRef.current
      if (!textarea) return

      const cursorPos = textarea.selectionStart
      const textBeforeCursor = code.substring(0, cursorPos)
      const textAfterCursor = code.substring(cursorPos)

      // Find the start of the partial text (after arrow or at word boundary)
      const arrowMatch = textBeforeCursor.match(/(?:->|-->)\s*(\S*)$/)
      const wordMatch = textBeforeCursor.match(/(?:^|\s)(\S+)$/)
      
      let partialLength = 0
      if (arrowMatch) {
        partialLength = arrowMatch[1].length
      } else if (wordMatch) {
        partialLength = wordMatch[1].length
      }

      if (partialLength > 0 || arrowMatch || wordMatch) {
        const newTextBefore = textBeforeCursor.substring(0, textBeforeCursor.length - partialLength)
        const newCode = newTextBefore + suggestion + textAfterCursor

        setCode(newCode)
        setShowSuggestions(false)

        // Set cursor position after the inserted suggestion
        setTimeout(() => {
          const newPosition = newTextBefore.length + suggestion.length
          textarea.focus()
          textarea.setSelectionRange(newPosition, newPosition)
        }, 0)
      }
    },
    [code]
  )

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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
                  <title>PlantUML Diagram</title>
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
                  <img id="diagram" src="${data.url}" alt="PlantUML Diagram" />
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
          description: "Tu diagrama PlantUML está listo en la nueva pestaña",
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
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newCode = code.substring(0, start) + snippet + code.substring(end)

    setCode(newCode)

    // Set cursor position after the inserted snippet
    setTimeout(() => {
      const newPosition = start + snippet.length
      textarea.focus()
      textarea.setSelectionRange(newPosition, newPosition)
    }, 0)
  }

  const insertLoop = () => {
    insertSnippet("\nloop [condition]\n  \nend\n")
    toast({
      title: "Loop insertado",
      description: "Bloque loop agregado al editor",
    })
  }

  const insertAlt = () => {
    insertSnippet("\nalt [condition]\n  \nelse\n  \nend\n")
    toast({
      title: "Alt insertado",
      description: "Bloque alt/else agregado al editor",
    })
  }

  const insertClass = () => {
    insertSnippet("\nclass ClassName {\n  +attribute: Type\n  +method()\n}\n")
    toast({
      title: "Clase insertada",
      description: "Plantilla de clase agregada al editor",
    })
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
        <div className="flex-1 overflow-auto p-4 relative">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            className="h-full w-full resize-none rounded-md bg-editor-bg p-4 font-mono text-sm text-editor-text focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Escribe tu código PlantUML aquí... (El autocompletado se activa automáticamente)"
            spellCheck={false}
          />

          {/* Autocomplete suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-50 mt-1 rounded-md border border-border bg-popover shadow-lg"
              style={{
                top: `${cursorPosition.top}px`,
                left: `${cursorPosition.left}px`,
                maxHeight: "200px",
                overflowY: "auto",
                minWidth: "150px",
              }}
            >
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion}
                  className={`cursor-pointer px-3 py-2 text-sm font-mono ${
                    index === selectedSuggestionIndex
                      ? "bg-accent text-accent-foreground"
                      : "text-popover-foreground hover:bg-accent/50"
                  }`}
                  onClick={() => insertSuggestion(suggestion)}
                  onMouseEnter={() => setSelectedSuggestionIndex(index)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Toaster />
    </div>
  )
}
