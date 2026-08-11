import { Router, Request, Response } from 'express'
import multer from 'multer'
import { authenticate } from '../middleware/auth'
import { authorizeProject } from '../middleware/authorizeProject'
import { createIssue } from '../services/issue_handler/createIssue'
import { editIssue } from '../services/issue_handler/editIssue'
import { getIssuesForProject } from '../services/issue_handler/getIssues'
import { commitChisel } from '../services/chisel_handler/commitChisel'
import cloudinary from '../config/cloudinary'
import Project from '../models/Project'
import { Types } from 'mongoose'

const router = Router()

router.use(authenticate)

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!/image\/(png|jpe?g|webp|gif|bmp)/.test(file.mimetype)) {
      cb(new Error('Only image files are allowed'))
      return
    }
    cb(null, true)
  },
})

router.get('/project/:projectId', authorizeProject, async (req: Request, res: Response) => {
  try {
    const issues = await getIssuesForProject(new Types.ObjectId(req.params.projectId as string))
    res.json(issues)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch issues'
    res.status(400).json({ error: message })
  }
})

router.post('/createIssue', upload.single('image'), authorizeProject, async (req: Request, res: Response) => {
  try {
    const { title, description, assignedTo, status, imageLink } = req.body
    const projectId = req.body.projectId || req.params.projectId || req.query.projectId

    if (!title) {
      res.status(400).json({ error: 'Title is required' })
      return
    }

    let issueImageLink = typeof imageLink === 'string' ? imageLink : ''

    if (req.file) {
      const mimeType = req.file.mimetype || 'image/png'
      const uploaded = await cloudinary.uploader.upload(
        `data:${mimeType};base64,${req.file.buffer.toString('base64')}`,
        {
          folder: 'chisel/issues',
          resource_type: 'image',
        }
      )
      issueImageLink = uploaded.secure_url
    }

    const issue = await createIssue({
      projectId: new Types.ObjectId(projectId),
      title,
      description: description || '',
      imageLink: issueImageLink,
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

    if (issue.status === 'RESOLVED') {
      const projectId = issue.project_id as unknown as Types.ObjectId
      const project = await Project.findById(projectId).select('created_by')
      await commitChisel({
        projectId,
        issueId: issue._id as unknown as Types.ObjectId,
        commitAuthor: project?.created_by as unknown as Types.ObjectId,
      })
    }

    res.json(issue)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to edit issue'
    res.status(400).json({ error: message })
  }
})

export default router
