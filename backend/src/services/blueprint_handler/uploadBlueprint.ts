import cloudinary from '../../config/cloudinary'
import Blueprint from '../../models/Blueprint'
import Project from '../../models/Project'
import { Types } from 'mongoose'

export async function uploadBlueprintImage(params: {
  projectId: string
  imagePath: string
  uploadedBy: string
}) {
  const { projectId, imagePath } = params

  const project = await Project.findOne({ _id: projectId })
  if (!project) {
    throw new Error('Project not found')
  }

  const uploaded = await cloudinary.uploader.upload(imagePath, {
    folder: 'chisel/blueprints',
    resource_type: 'image',
  })

  const existing = await Blueprint.findOne({ project_id: projectId })

  let blueprint
  if (existing) {
    existing.original_image = uploaded.secure_url
    existing.uploaded_by = new Types.ObjectId(params.uploadedBy)
    blueprint = await existing.save()
  } else {
    blueprint = await Blueprint.create({
      project_id: new Types.ObjectId(projectId),
      original_image: uploaded.secure_url,
      uploaded_by: new Types.ObjectId(params.uploadedBy),
      created_at: new Date(),
    })
  }

  await Project.updateOne(
    { _id: projectId },
    { $set: { blueprint_id: blueprint._id } }
  )

  return blueprint
}