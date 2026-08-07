import Project from '../../models/Project'
import Blueprint from '../../models/Blueprint'
import { Types } from 'mongoose'

interface CreateProjectParams {
  title: string
  description: string
  created_by: Types.ObjectId
  imageLink?: string
  workers?: Types.ObjectId[]
  maintainers?: Types.ObjectId[]
}
/*
  
  curl -X GET http://localhost:3000/api/projects/all \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjU1MjY2MSwidXNlcm5hbWUiOiJ0ZXN0dXNlciIsImlhdCI6MTc4NDc3OTY5NywiZXhwIjoxNzg1Mzg0NDk3fQ.tv03NPMiXFW-uP2ePclv-o8COg9MtvDDtyE-H1dXi1I"
  
  
  curl -X GET http://localhost:3000/api/projects/involved \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjU1MjY2MSwidXNlcm5hbWUiOiJ0ZXN0dXNlciIsImlhdCI6MTc4NDc3OTY5NywiZXhwIjoxNzg1Mzg0NDk3fQ.tv03NPMiXFW-uP2ePclv-o8COg9MtvDDtyE-H1dXi1I"
  
  curl -X GET http://localhost:3000/api/projects/created \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjU1MjY2MSwidXNlcm5hbWUiOiJ0ZXN0dXNlciIsImlhdCI6MTc4NDc3OTY5NywiZXhwIjoxNzg1Mzg0NDk3fQ.tv03NPMiXFW-uP2ePclv-o8COg9MtvDDtyE-H1dXi1I"
  



*/


export async function createProject(params: CreateProjectParams) {
  const project = await Project.create({
    title: params.title,
    description: params.description,
    created_by: params.created_by,
    workers: params.workers || [],
    maintainers: params.maintainers?.length ? params.maintainers : [params.created_by],
    status: 'inProgress',
    created_at: new Date(),
  })

  if (params.imageLink) {
    await Blueprint.create({
      project_id: project._id,
      original_image: params.imageLink,
      uploaded_by: params.created_by,
      created_at: new Date(),
    })
  }

  return project
}
