import { Router, Request, Response } from 'express'
import { authenticate } from '../middleware/auth'
import { authorizeProject } from '../middleware/authorizeProject'
import { authorizeManager } from '../middleware/authorizeManager'
import { commitChisel } from '../services/chisel_handler/commitChisel'
import { getChiselsForProject } from '../services/chisel_handler/getChisels'
import { Types } from 'mongoose'

const router = Router()

router.use(authenticate)

router.get('/project/:projectId', authorizeProject, async (req: Request, res: Response) => {
  try {
    const chisels = await getChiselsForProject(new Types.ObjectId(req.params.projectId as string))
    res.json(chisels)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch chisels'
    res.status(400).json({ error: message })
  }
})

router.post('/commit', authorizeManager, async (req: Request, res: Response) => {
  try {
    const { projectId, issueId } = req.body

    if (!projectId || !issueId) {
      res.status(400).json({ error: 'projectId and issueId are required' })
      return
    }

    const chisel = await commitChisel({
      projectId: new Types.ObjectId(projectId),
      issueId: new Types.ObjectId(issueId),
      commitAuthor: new Types.ObjectId(req.user!._id),
    })

    res.status(201).json(chisel)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to commit issue'
    res.status(400).json({ error: message })
  }
})

export default router