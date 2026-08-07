import { Router, Request, Response } from 'express'
import { authenticate } from '../middleware/auth'
import { blueprintToJson } from '../services/llm/blueprintToJson'

const router = Router()

router.use(authenticate)

router.post('/convert', async (req: Request, res: Response) => {
  try {
    const { description, imageUrl } = req.body

    if (!description || typeof description !== 'string') {
      res.status(400).json({ error: 'Blueprint description (text) is required' })
      return
    }

    const result = await blueprintToJson(description, imageUrl)

    res.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to convert blueprint'
    res.status(400).json({ error: message })
  }
})

export default router
