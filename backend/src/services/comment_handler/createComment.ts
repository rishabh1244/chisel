import Comment from '../../models/Comment'
import { Types } from 'mongoose'

interface CreateCommentParams {
  issueId: Types.ObjectId
  createdBy: Types.ObjectId
  content: string
  mediaLinks?: string[]
}

export async function createComment(params: CreateCommentParams) {
  const comment = await Comment.create({
    issue_id: params.issueId,
    created_by: params.createdBy,
    content: params.content,
    media_links: params.mediaLinks || [],
    created_at: new Date(),
    updated_at: new Date(),
  })

  return comment
}
