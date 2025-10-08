"use client"

import { StreamLanguage } from "@codemirror/language"
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language"
import { tags as t } from "@lezer/highlight"
import { autocompletion, CompletionContext } from "@codemirror/autocomplete"
import { Extension } from "@codemirror/state"

// PlantUML keywords
const keywords = [
  "loop", "alt", "else", "end", "class", "actor", "participant",
  "interface", "enum", "abstract", "@startuml", "@enduml"
]

// Simple PlantUML language mode
const plantumlMode = StreamLanguage.define({
  token(stream) {
    // Skip whitespace
    if (stream.eatSpace()) return null

    // Check for keywords
    for (const keyword of keywords) {
      if (stream.match(keyword, true, false)) {
        return "keyword"
      }
    }

    // Check for strings
    if (stream.match(/"[^"]*"?/)) {
      return "string"
    }

    // Check for arrows
    if (stream.match(/->|-->|<-|<--/)) {
      return "operator"
    }

    // Default: consume one character
    stream.next()
    return null
  },
})

// Create a custom highlight style for PlantUML
export const plantumlHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: "#c084fc", fontWeight: "600" },
  { tag: t.string, color: "#98c379" },
  { tag: t.operator, color: "#61afef" },
])

// Extract entities (participants, actors, classes) from code
function extractEntities(text: string): string[] {
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

    // Match class Name
    const classMatch = line.match(/class\s+(?:"([^"]+)"|(\S+))/)
    if (classMatch) {
      entities.add(classMatch[1] || classMatch[2])
    }

    // Match interface Name
    const interfaceMatch = line.match(/interface\s+(?:"([^"]+)"|(\S+))/)
    if (interfaceMatch) {
      entities.add(interfaceMatch[1] || interfaceMatch[2])
    }

    // Match abstract class Name
    const abstractMatch = line.match(/abstract\s+(?:class\s+)?(?:"([^"]+)"|(\S+))/)
    if (abstractMatch) {
      entities.add(abstractMatch[1] || abstractMatch[2])
    }

    // Match enum Name
    const enumMatch = line.match(/enum\s+(?:"([^"]+)"|(\S+))/)
    if (enumMatch) {
      entities.add(enumMatch[1] || enumMatch[2])
    }
  }

  return Array.from(entities)
}

// Autocompletion function
function plantumlCompletions(context: CompletionContext) {
  const word = context.matchBefore(/\w*/)
  if (!word || (word.from === word.to && !context.explicit)) {
    return null
  }

  const text = context.state.doc.toString()
  const entities = extractEntities(text)

  if (entities.length === 0) {
    return null
  }

  return {
    from: word.from,
    options: entities.map((entity) => ({
      label: entity,
      type: "variable",
      info: "PlantUML Entity",
    })),
  }
}

// Basic PlantUML language support
export const plantumlLanguage: Extension[] = [
  plantumlMode,
  syntaxHighlighting(plantumlHighlightStyle),
  autocompletion({
    override: [plantumlCompletions],
    activateOnTyping: true,
    maxRenderedOptions: 10,
  }),
]
