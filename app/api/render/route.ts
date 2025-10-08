import { type NextRequest, NextResponse } from "next/server"
import pako from "pako"

// PlantUML encoding function with proper deflate compression
function encodePlantUML(text: string): string {
  const compressed = pako.deflate(text, { level: 9 })
  return encode64(compressed)
}

function encode64(data: Uint8Array): string {
  let r = ""
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_"

  for (let i = 0; i < data.length; i += 3) {
    if (i + 2 === data.length) {
      r += append3bytes(data[i], data[i + 1], 0, chars)
    } else if (i + 1 === data.length) {
      r += append3bytes(data[i], 0, 0, chars)
    } else {
      r += append3bytes(data[i], data[i + 1], data[i + 2], chars)
    }
  }
  return r
}

function append3bytes(b1: number, b2: number, b3: number, chars: string): string {
  const c1 = b1 >> 2
  const c2 = ((b1 & 0x3) << 4) | (b2 >> 4)
  const c3 = ((b2 & 0xf) << 2) | (b3 >> 6)
  const c4 = b3 & 0x3f
  let r = ""
  r += chars.charAt(c1 & 0x3f)
  r += chars.charAt(c2 & 0x3f)
  r += chars.charAt(c3 & 0x3f)
  r += chars.charAt(c4 & 0x3f)
  return r
}

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 })
    }

    // Encode the PlantUML code
    const encoded = encodePlantUML(code)

    const plantUMLUrl = `https://www.plantuml.com/plantuml/png/~1${encoded}`

    return NextResponse.json({
      url: plantUMLUrl,
      encoded,
      metadata: {
        timestamp: new Date().toISOString(),
        originalCode: code,
      },
    })
  } catch (error) {
    console.error("[v0] Error generating PlantUML URL:", error)
    return NextResponse.json({ error: "Failed to generate diagram" }, { status: 500 })
  }
}
