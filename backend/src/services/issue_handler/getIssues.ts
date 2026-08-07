import Issue from '../../models/Issue'
import Comment from '../../models/Comment'
import { Types } from 'mongoose'

export async function getIssuesForProject(projectId: Types.ObjectId) {
  const issues = await Issue.find({ project_id: projectId })
    .sort({ created_at: -1 })
    .populate('created_by', 'username')
    .populate('assigned_to', 'username')

  const commentCounts = await Comment.aggregate([
    { $match: { issue_id: { $in: issues.map((i) => i._id) } } },
    { $group: { _id: '$issue_id', count: { $sum: 1 } } },
  ])
  const countMap = new Map(commentCounts.map((c) => [String(c._id), c.count]))

  return issues.map((issue) => ({
    _id: issue._id,
    title: issue.title,
    description: issue.description,
    image_link: issue.image_link,
    status: issue.status,
    created_at: issue.created_at,
    created_by: issue.created_by,
    assigned_to: issue.assigned_to,
    comment_count: countMap.get(String(issue._id)) || 0,
  }))
}
