import Comment from '../../models/Comment'
import Issue from '../../models/Issue'
import { Types } from 'mongoose'

interface CloseIssueParams {
  commentId: Types.ObjectId
}

export async function closeIssueWithComment(params: CloseIssueParams) {
  const comment = await Comment.findById(params.commentId)
  if (!comment) {
    throw new Error('Comment not found')
  }

  await Comment.updateMany(
    { issue_id: comment.issue_id, closes_issue: true },
    { $set: { closes_issue: false } }
  )

  comment.closes_issue = true
  await comment.save()

  await Issue.findByIdAndUpdate(comment.issue_id, { status: 'RESOLVED' })

  return comment
}