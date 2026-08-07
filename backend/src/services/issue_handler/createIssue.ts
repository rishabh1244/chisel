import Issue from '../../models/Issue'
import { Types } from 'mongoose'

interface CreateIssueParams {
  projectId: Types.ObjectId
  title: string
  description?: string
  imageLink?: string
  createdBy: Types.ObjectId
  assignedTo?: Types.ObjectId | null
  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
}

export async function createIssue(params: CreateIssueParams) {
 const issue = await Issue.create({
    project_id: params.projectId,
    title: params.title,
    description: params.description || '',
    image_link: params.imageLink || '',
    created_by: params.createdBy,
    assigned_to: params.assignedTo || undefined,
    status: params.status || 'OPEN',
    created_at: new Date(),
  })

  return issue
}
