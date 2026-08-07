import Project from '../../models/Project'
import { Types } from 'mongoose'

interface EditProjectParams {
  projectId: Types.ObjectId
  title?: string
  description?: string
  workers?: Types.ObjectId[]
  maintainers?: Types.ObjectId[]
  status?: string
}

export async function editProject(params: EditProjectParams) {
  const update: Record<string, unknown> = {}
  if (params.title !== undefined) update.title = params.title
  if (params.description !== undefined) update.description = params.description
  if (params.workers !== undefined) update.workers = params.workers
  if (params.maintainers !== undefined) update.maintainers = params.maintainers
  if (params.status !== undefined) update.status = params.status

  const project = await Project.findByIdAndUpdate(
    params.projectId,
    { $set: update },
    { new: true, runValidators: true }
  )

  if (!project) {
    throw new Error('Project not found')
  }

  return project
}