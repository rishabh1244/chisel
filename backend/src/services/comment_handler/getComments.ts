import Comment from '../../models/Comment'
import { Types } from 'mongoose'

export async function getCommentsForIssue(issueId: Types.ObjectId) {
  const comments = await Comment.find({ issue_id: issueId })
    .sort({ created_at: 1 })
    .populate('created_by', 'username')

  return comments.map((comment) => ({
    _id: comment._id,
    issue_id: comment.issue_id,
    created_by: comment.created_by,
    content: comment.content,
    media_links: comment.media_links,
    created_at: comment.created_at,
    updated_at: comment.updated_at,
  }))
}