import { Router, Request, Response } from 'express'
import { authenticate } from '../middleware/auth'
import { getCreatedProjects, getInvolvedProjects, getAllUserProjects } from '../services/project/fetchProjects'
import { Types } from 'mongoose'

const router = Router()

router.use(authenticate)

router.get('/created', async (req: Request, res: Response) => {
  try {
    const projects = await getCreatedProjects(new Types.ObjectId(req.user!._id))
    res.json(projects)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch projects'
    res.status(400).json({ error: message })
  }
})

router.get('/involved', async (req: Request, res: Response) => {
  try {
    const projects = await getInvolvedProjects(new Types.ObjectId(req.user!._id))
    res.json(projects)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch projects'
    res.status(400).json({ error: message })
  }
})

router.get('/all', async (req: Request, res: Response) => {
  try {
    const projects = await getAllUserProjects(new Types.ObjectId(req.user!._id))
    res.json(projects)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch projects'
    res.status(400).json({ error: message })
  }
})

export default router