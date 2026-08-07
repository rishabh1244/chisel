import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

const SYSTEM_PROMPT = `You are a blueprint-to-JSON converter. Given a text description of a building floor plan, output a JSON object with an "objects" array. Each object must follow this schema:

- Wall: { "type": "wall", "start": [x, z], "end": [x, z], "height": number }
- Door: { "type": "door", "position": [x, z], "width": number, "height"?: number }
- Window: { "type": "window", "position": [x, z], "width": number, "height"?: number }
- Room: { "type": "room", "corners": [[x, z], ...], "height": number }
- Floor: { "type": "floor", "position": [x, z], "width": number, "depth": number }

Use coordinates where 1 unit = 1 meter. Output ONLY valid JSON with no markdown formatting or code blocks.`

export async function blueprintToJson(
  description: string,
  imageUrl?: string
): Promise<{ objects: Record<string, unknown>[] }> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const parts: any[] = [
    { text: SYSTEM_PROMPT },
  ]

  if (imageUrl) {
    parts.push({
      fileData: { mimeType: 'image/png', fileUri: imageUrl },
    })
  }

  parts.push({ text: `Convert this building blueprint to JSON:\n\n${description}` })

  const result = await model.generateContent(parts)

  const text = result.response.text().trim()

  const cleaned = text.replace(/```json?/gi, '').replace(/```/g, '').trim()

  const parsed = JSON.parse(cleaned)

  if (!parsed.objects || !Array.isArray(parsed.objects)) {
    throw new Error('LLM response missing "objects" array')
  }

  return parsed
}
