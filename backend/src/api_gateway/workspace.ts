import { Router, Request, Response } from 'express'
import { authenticate } from '../middleware/auth'
import { createProject } from '../services/project/createProject'
import { editProject } from '../services/project/editProject'
import { deleteProject } from '../services/project/deleteProject'
import { Types } from 'mongoose'

const router = Router()

router.use(authenticate)

router.post('/createProject', async (req: Request, res: Response) => {
  try {
    const { title, description, imageLink, workers, maintainers } = req.body
    if (!title) {
      res.status(400).json({ error: 'Title is required' })
      return
    }

    const project = await createProject({
      title,
      description: description || '',
      created_by: new Types.ObjectId(req.user!._id),
      imageLink,
      workers: workers?.map((id: string) => new Types.ObjectId(id)),
      maintainers: maintainers?.map((id: string) => new Types.ObjectId(id)),
    })
    res.status(201).json(project)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create project'
    res.status(400).json({ error: message })
  }
})

router.post('/editProject', async (req: Request, res: Response) => {
  try {
    const { projectId, title, description, workers, maintainers, status } = req.body
    if (!projectId) {
      res.status(400).json({ error: 'Project ID is required' })
      return
    }
    const project = await editProject({
      projectId: new Types.ObjectId(projectId),
      title,
      description,
      workers: workers?.map((id: string) => new Types.ObjectId(id)),
      maintainers: maintainers?.map((id: string) => new Types.ObjectId(id)),
      status,
    })
    res.json(project)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to edit project'
    res.status(400).json({ error: message })
  }
})

router.post('/deleteProject', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.body
    if (!projectId) {
      res.status(400).json({ error: 'Project ID is required' })
      return
    }
    const result = await deleteProject(new Types.ObjectId(projectId))
    res.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete project'
    res.status(400).json({ error: message })
  }
})

export default router