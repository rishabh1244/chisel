import Comment from '../../models/Comment'
import { Types } from 'mongoose'

interface DeleteCommentParams {
  commentId: Types.ObjectId
  userId: Types.ObjectId
}

export async function deleteComment(params: DeleteCommentParams) {
  const comment = await Comment.findById(params.commentId)

  if (!comment) {
    throw new Error('Comment not found')
  }

  if (!comment.created_by.equals(params.userId)) {
    throw new Error('Not authorized to delete this comment')
  }

  await Comment.findByIdAndDelete(params.commentId)
  return { message: 'Comment deleted successfully' }
}
