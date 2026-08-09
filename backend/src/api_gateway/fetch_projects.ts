import { Router, Request, Response } from 'express'
import { authenticate } from '../middleware/auth'
import { getCreatedProjects, getInvolvedProjects, getAllUserProjects } from '../services/project/fetchProjects'
import { Types } from 'mongoose'
import Project from '../models/Project'

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

router.get('/:projectId/team', async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('created_by', 'username')
      .populate('workers', 'username')
      .populate('maintainers', 'username')

    if (!project) {
      res.status(404).json({ error: 'Project not found' })
      return
    }

    res.json({
      _id: project._id,
      title: project.title,
      created_by: project.created_by ?? null,
      workers: project.workers ?? [],
      maintainers: project.maintainers ?? [],
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch project team'
    res.status(400).json({ error: message })
  }
})

export default router