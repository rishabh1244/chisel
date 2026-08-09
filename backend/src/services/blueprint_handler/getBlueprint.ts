import Blueprint from '../../models/Blueprint'
import mongoose from 'mongoose'

export async function getProjectBlueprint(projectId: string) {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error('Invalid project id')
  }

  const blueprint = await Blueprint.findOne({
    project_id: new mongoose.Types.ObjectId(projectId),
  })
    .populate('uploaded_by', 'username')
    .lean()

  return blueprint
}