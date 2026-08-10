import fs from 'fs'
import path from 'path'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const REQUEST_TIMEOUT_MS = 60000
const DEFAULT_MODELS = [
  'openrouter/free',
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
  'nvidia/nemotron-nano-12b-v2-vl:free',
]

function loadPrompt(): string {
  const candidates = [
    path.join(__dirname, 'prompt.txt'),
    path.join(process.cwd(), 'src', 'services', 'llm', 'prompt.txt'),
    path.join(__dirname, '..', '..', '..', 'src', 'services', 'llm', 'prompt.txt'),
  ]
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return fs.readFileSync(candidate, 'utf-8')
    }
  }
  throw new Error('Could not locate src/services/llm/prompt.txt')
}

const SYSTEM_PROMPT = loadPrompt()

function mimeFromPath(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  const map: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
  }
  return map[ext] || 'image/png'
}

function extractJson(text: string): Record<string, unknown> {
  const cleaned = text.replace(/```json?/gi, '').replace(/```/g, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) {
    throw new Error(
      `LLM response did not contain a JSON object. Raw response: ${text.slice(0, 300)}`
    )
  }
  const parsed = JSON.parse(cleaned.slice(start, end + 1))
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('LLM response is not a JSON object')
  }
  return parsed as Record<string, unknown>
}

async function imageToDataUrl(imagePath?: string, imageUrl?: string): Promise<string> {
  if (imagePath) {
    const buffer = fs.readFileSync(imagePath)
    return `data:${mimeFromPath(imagePath)};base64,${buffer.toString('base64')}`
  }

  if (imageUrl) {
    const res = await fetch(imageUrl)
    if (!res.ok) {
      throw new Error(`Failed to fetch image from ${imageUrl}: ${res.status}`)
    }
    const buffer = Buffer.from(await res.arrayBuffer())
    const contentType = res.headers.get('content-type') || 'image/png'
    const mimeType = contentType.startsWith('image/') ? contentType : 'image/png'
    return `data:${mimeType};base64,${buffer.toString('base64')}`
  }

  throw new Error('A blueprint image (imagePath or imageUrl) is required')
}

async function callOpenRouter(opts: {
  apiKey: string
  model: string
  dataUrl: string
  description?: string
  jsonMode: boolean
}): Promise<string> {
  const { apiKey, model, dataUrl, description, jsonMode } = opts

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const userContent: unknown[] = [
      { type: 'image_url', image_url: { url: dataUrl } },
    ]
    if (description && description.trim()) {
      userContent.push({ type: 'text', text: `Additional context: ${description}` })
    }

    const body: Record<string, unknown> = {
      model,
      max_tokens: 8192,
      temperature: 0.2,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
    }
    if (jsonMode) {
      body.response_format = { type: 'json_object' }
    }

    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`OpenRouter request failed (${res.status}): ${text}`)
    }

    const json = await res.json()
    const content = json?.choices?.[0]?.message?.content

    if (typeof content !== 'string' || !content.trim()) {
      throw new Error('OpenRouter response contained no text content')
    }
    return content
  } finally {
    clearTimeout(timer)
  }
}

function parseBlueprintJson(text: string): Record<string, unknown> {
  const parsed = extractJson(text)
  const refusal =
    typeof parsed.error === 'string' && parsed.error.trim()
      ? parsed.error.trim()
      : ''
  if (refusal) {
    throw new Error(`AI could not convert this image: ${refusal}`)
  }
  return parsed
}

export async function blueprintToJson(opts: {
  imagePath?: string
  imageUrl?: string
  description?: string
}): Promise<Record<string, unknown>> {
  const apiKey = process.env.OPENROUTER_API_KEY || ''
  const configuredModel = process.env.OPENROUTER_MODEL || ''

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set in the environment')
  }

  const { imagePath, imageUrl, description } = opts

  const dataUrl = await imageToDataUrl(imagePath, imageUrl)

  const models = configuredModel
    ? configuredModel
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean)
    : DEFAULT_MODELS

  let lastError: Error | null = null

  for (const model of models) {
    try {
      let content: string
      try {
        content = await callOpenRouter({
          apiKey,
          model,
          dataUrl,
          description,
          jsonMode: true,
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        if (message.includes('400') && message.includes('response_format')) {
          content = await callOpenRouter({
            apiKey,
            model,
            dataUrl,
            description,
            jsonMode: false,
          })
        } else {
          throw error
        }
      }

      return parseBlueprintJson(content)
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
    }
  }

  throw lastError || new Error('AI blueprint conversion failed')
}