import { Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import Project from '../models/Project'

export async function authorizeManager(req: Request, res: Response, next: NextFunction) {
  const projectId = req.body?.projectId || req.params.projectId || req.query.projectId

  if (!projectId) {
    res.status(400).json({ error: 'projectId is required' })
    return
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    res.status(400).json({ error: 'Invalid projectId' })
    return
  }

  const project = await Project.findById(projectId)
  if (!project) {
    res.status(404).json({ error: 'Project not found' })
    return
  }

  const userId = new mongoose.Types.ObjectId(req.user!._id)

  const isCreator = project.created_by.equals(userId)
  const isMaintainer = project.maintainers.some((m) => m.equals(userId))

  if (!isCreator && !isMaintainer) {
    res.status(403).json({ error: 'Access denied. Only the project manager can commit issues' })
    return
  }

  next()
}
