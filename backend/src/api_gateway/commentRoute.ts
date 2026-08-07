import { Router, Request, Response } from 'express'
import { authenticate } from '../middleware/auth'
import { createComment } from '../services/comment_handler/createComment'
import { editComment } from '../services/comment_handler/editComment'
import { deleteComment } from '../services/comment_handler/deleteComment'
import { Types } from 'mongoose'

const router = Router()

router.use(authenticate)

router.post('/createComment', async (req: Request, res: Response) => {
  try {
    const { issueId, content, mediaLinks } = req.body

    if (!issueId || !content) {
      res.status(400).json({ error: 'issueId and content are required' })
      return
    }

    const comment = await createComment({
      issueId: new Types.ObjectId(issueId),
      createdBy: new Types.ObjectId(req.user!._id),
      content,
      mediaLinks: mediaLinks || [],
    })

    res.status(201).json(comment)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create comment'
    res.status(400).json({ error: message })
  }
})

router.post('/editComment', async (req: Request, res: Response) => {
  try {
    const { commentId, content, mediaLinks } = req.body

    if (!commentId) {
      res.status(400).json({ error: 'commentId is required' })
      return
    }

    const comment = await editComment({
      commentId: new Types.ObjectId(commentId),
      userId: new Types.ObjectId(req.user!._id),
      content,
      mediaLinks,
    })

    res.json(comment)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to edit comment'
    res.status(400).json({ error: message })
  }
})

router.delete('/deleteComment', async (req: Request, res: Response) => {
  try {
    const { commentId } = req.body

    if (!commentId) {
      res.status(400).json({ error: 'commentId is required' })
      return
    }

    const result = await deleteComment({
      commentId: new Types.ObjectId(commentId),
      userId: new Types.ObjectId(req.user!._id),
    })

    res.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete comment'
    res.status(400).json({ error: message })
  }
})

export default router
