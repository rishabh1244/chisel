import Issue from '../../models/Issue'
import { Types } from 'mongoose'

interface EditIssueParams {
  issueId: Types.ObjectId
  title?: string
  description?: string
  imageLink?: string
  assignedTo?: Types.ObjectId | null
  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
}

export async function editIssue(params: EditIssueParams) {
  const update: Record<string, unknown> = {}

  if (params.title !== undefined) update.title = params.title
  if (params.description !== undefined) update.description = params.description
  if (params.imageLink !== undefined) update.image_link = params.imageLink
  if (params.assignedTo !== undefined) update.assigned_to = params.assignedTo || null
  if (params.status !== undefined) update.status = params.status

  const issue = await Issue.findByIdAndUpdate(params.issueId, update, { new: true })

  if (!issue) {
    throw new Error('Issue not found')
  }

  return issue
}
