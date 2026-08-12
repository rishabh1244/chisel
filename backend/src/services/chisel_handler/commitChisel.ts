import Chisel from '../../models/Chisel'
import Issue from '../../models/Issue'
import Comment from '../../models/Comment'
import { Types } from 'mongoose'

interface CommitChiselParams {
  projectId: Types.ObjectId
  issueId: Types.ObjectId
  commitAuthor: Types.ObjectId
}

export async function commitChisel(params: CommitChiselParams) {
  const issue = await Issue.findById(params.issueId)

  if (!issue) {
    throw new Error('Issue not found')
  }

  if (!issue.project_id.equals(params.projectId)) {
    throw new Error('Issue does not belong to this project')
  }

  const existing = await Chisel.findOne({ issue_id: issue._id })
  if (existing) {
    return existing
  }

  const closingComment = await Comment.findOne({
    issue_id: issue._id,
    closes_issue: true,
  })

  const commitAuthor = closingComment
    ? closingComment.created_by
    : params.commitAuthor

  const chisel = await Chisel.create({
    project_id: params.projectId,
    issue_id: issue._id,
    commit_author: commitAuthor,
    title: issue.title,
    description: issue.description,
    media_links: issue.image_link ? [issue.image_link] : [],
    status: 'PENDING',
  })

  return chisel
}