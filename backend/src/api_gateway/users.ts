import { Router, Request, Response } from 'express'
import { authenticate } from '../middleware/auth'

const router = Router()

router.use(authenticate)

router.get('/listUsers', (_req: Request, res: Response) => {
  res.json({ message: 'working' })
})

router.post('/sendInvite', (_req: Request, res: Response) => {
  res.json({ message: 'working' })
})

router.get('/searchUsers', (_req: Request, res: Response) => {
  res.json({ message: 'working' })
})

export default router
