import Chisel from '../../models/Chisel'
import Issue from '../../models/Issue'
import Comment from '../../models/Comment'
import { Types } from 'mongoose'

export async function getChiselsForProject(projectId: Types.ObjectId) {
  const chisels = await Chisel.find({ project_id: projectId })
    .sort({ committed_at: -1 })
    .populate('commit_author', 'username')
    .populate('merged_by', 'username')

  const issueIds = chisels.map((c) => c.issue_id).filter(Boolean)
  const commentCounts = await Comment.aggregate([
    { $match: { issue_id: { $in: issueIds } } },
    { $group: { _id: '$issue_id', count: { $sum: 1 } } },
  ])
  const countMap = new Map(commentCounts.map((c) => [String(c._id), c.count]))

  const issueMap = new Map<string, Types.ObjectId>()
  const issues = await Issue.find({ _id: { $in: issueIds } })
  issues.forEach((issue) => issueMap.set(String(issue._id), issue._id as Types.ObjectId))

  return chisels.map((chisel) => ({
    _id: chisel._id,
    issue_id: chisel.issue_id,
    project_id: chisel.project_id,
    commit_author: chisel.commit_author,
    merged_by: chisel.merged_by ?? null,
    title: chisel.title,
    description: chisel.description,
    media_links: chisel.media_links,
    status: chisel.status,
    committed_at: chisel.committed_at,
    merged_at: chisel.merged_at,
    comment_count: countMap.get(String(chisel.issue_id)) || 0,
  }))
}