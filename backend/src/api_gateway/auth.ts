import { Router, Request, Response } from 'express'
import { login } from '../services/auth/login'
import { register } from '../services/auth/register'

const router = Router()

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' })
      return
    }
    const result = await login(username, password)
    res.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed'
    res.status(401).json({ error: message })
  }
})

router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' })
      return
    }
    const result = await register(username, password)
    res.status(201).json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed'
    res.status(400).json({ error: message })
  }
})

export default router
