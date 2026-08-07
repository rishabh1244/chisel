import { Router, Request, Response } from 'express'
import { authenticate } from '../middleware/auth'
import { authorizeProject } from '../middleware/authorizeProject'
import { createIssue } from '../services/issue_handler/createIssue'
import { editIssue } from '../services/issue_handler/editIssue'
import { getIssuesForProject } from '../services/issue_handler/getIssues'
import { Types } from 'mongoose'

const router = Router()

router.use(authenticate)

router.get('/project/:projectId', authorizeProject, async (req: Request, res: Response) => {
  try {
    const issues = await getIssuesForProject(new Types.ObjectId(req.params.projectId as string))
    res.json(issues)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch issues'
    res.status(400).json({ error: message })
  }
})

router.post('/createIssue', authorizeProject, async (req: Request, res: Response) => {
  try {
    const { title, description, assignedTo, status, imageLink } = req.body
    const projectId = req.body.projectId || req.params.projectId || req.query.projectId

    if (!title) {
      res.status(400).json({ error: 'Title is required' })
      return
    }

    const issue = await createIssue({
      projectId: new Types.ObjectId(projectId),
      title,
      description: description || '',
      imageLink: imageLink || '',
      createdBy: new Types.ObjectId(req.user!._id),
      assignedTo: assignedTo ? new Types.ObjectId(assignedTo) : null,
      status: status || 'OPEN',
    })

    res.status(201).json(issue)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create issue'
    res.status(400).json({ error: message })
  }
})

router.post('/editIssue', authorizeProject, async (req: Request, res: Response) => {
  try {
    const { issueId, title, description, assignedTo, status, imageLink } = req.body

    if (!issueId) {
      res.status(400).json({ error: 'issueId is required' })
      return
    }

    const issue = await editIssue({
      issueId: new Types.ObjectId(issueId),
      title,
      description,
      imageLink,
      assignedTo: assignedTo !== undefined ? (assignedTo ? new Types.ObjectId(assignedTo) : null) : undefined,
      status,
    })

    res.json(issue)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to edit issue'
    res.status(400).json({ error: message })
  }
})

export default router
