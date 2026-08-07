import Comment from '../../models/Comment'
import { Types } from 'mongoose'

interface EditCommentParams {
  commentId: Types.ObjectId
  userId: Types.ObjectId
  content?: string
  mediaLinks?: string[]
}

export async function editComment(params: EditCommentParams) {
  const comment = await Comment.findById(params.commentId)

  if (!comment) {
    throw new Error('Comment not found')
  }

  if (!comment.created_by.equals(params.userId)) {
    throw new Error('Not authorized to edit this comment')
  }

  if (params.content !== undefined) comment.content = params.content
  if (params.mediaLinks !== undefined) comment.media_links = params.mediaLinks
  comment.updated_at = new Date()

  await comment.save()
  return comment
}
