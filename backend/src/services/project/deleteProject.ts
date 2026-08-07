import Project from '../../models/Project'
import { Types } from 'mongoose'

export async function deleteProject(projectId: Types.ObjectId) {
  const project = await Project.findByIdAndDelete(projectId)

  if (!project) {
    throw new Error('Project not found')
  }

  return { message: 'Project deleted' }
}