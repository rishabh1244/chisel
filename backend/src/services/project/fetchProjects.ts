import Project from '../../models/Project'
import { Types } from 'mongoose'

export async function getCreatedProjects(userId: Types.ObjectId) {
  return Project.find({ created_by: userId })
}

export async function getInvolvedProjects(userId: Types.ObjectId) {
  return Project.find({
    $or: [
      { workers: userId },
      { maintainers: userId },
    ],
  })
}

export async function getAllUserProjects(userId: Types.ObjectId) {
  return Project.find({
    $or: [
      { created_by: userId },
      { workers: userId },
      { maintainers: userId },
    ],
  })
}