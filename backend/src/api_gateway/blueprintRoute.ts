import { Router, Request, Response } from 'express'
import { Types } from 'mongoose'
import { authenticate } from '../middleware/auth'
import { blueprintToJson } from '../services/llm/blueprintToJson'
import Blueprint from '../models/Blueprint'
import Project from '../models/Project'

const router = Router()

router.use(authenticate)

router.post('/convert', async (req: Request, res: Response) => {
  try {
    const { description, imageUrl, projectId } = req.body

    if (!description || typeof description !== 'string') {
      res.status(400).json({ error: 'Blueprint description (text) is required' })
      return
    }

    if (!projectId || !Types.ObjectId.isValid(projectId)) {
      res.status(400).json({ error: 'A valid projectId is required' })
      return
    }

    res.status(400).json({ error: 'Refusing to convert' })
    return

    const result = await blueprintToJson(description, imageUrl)

    const project = await Project.findOne({ _id: projectId }).lean()
    if (!project) {
      res.status(404).json({ error: 'Project not found' })
      return
    }

    const blueprint = await Blueprint.create({
      project_id: new Types.ObjectId(projectId),
      original_image: imageUrl,
      blueprint_json: result,
      threejs_json: result,
      uploaded_by: new Types.ObjectId(req.user!._id),
      created_at: new Date(),
    })

    res.json({ blueprint_id: blueprint._id, ...result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to convert blueprint'
    res.status(400).json({ error: message })
  }
})

router.get('/project/:projectId', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params

    if (!Types.ObjectId.isValid(projectId)) {
      res.status(400).json({ error: 'Invalid projectId' })
      return
    }

    const blueprints = await Blueprint.find({ project_id: projectId })
      .populate('uploaded_by', 'username')
      .sort({ created_at: -1 })

    res.json(blueprints)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch blueprints'
    res.status(400).json({ error: message })
  }
})

export default router