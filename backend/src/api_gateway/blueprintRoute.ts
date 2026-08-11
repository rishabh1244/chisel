import { Router, Request, Response } from 'express'
import { Types } from 'mongoose'
import multer from 'multer'
import { authenticate } from '../middleware/auth'
import { blueprintToJson } from '../services/llm/blueprintToJson'
import { uploadBlueprintImage } from '../services/blueprint_handler/uploadBlueprint'
import { getProjectBlueprint } from '../services/blueprint_handler/getBlueprint'
import Blueprint_Model from '../models/Blueprint'

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

router.post('/convert', async (req: Request, res: Response) => {
  try {
    const projectId = String(req.body.projectId || '')

    if (!projectId || !Types.ObjectId.isValid(projectId)) {
      res.status(400).json({ error: 'A valid projectId is required' })
      return
    }

    const imageUrl =
      typeof req.body.imageUrl === 'string' ? req.body.imageUrl.trim() : ''

    if (!imageUrl) {
      res.status(400).json({ error: 'A blueprint imageUrl is required' })
      return
    }

    const description =
      typeof req.body.description === 'string' ? req.body.description : undefined

    const result = await blueprintToJson({ imageUrl, description })

    const existing = await Blueprint_Model.findOne({ project_id: projectId })

    let blueprint
    if (existing) {
      existing.blueprint_json = result
      blueprint = await existing.save()
    } else {
      blueprint = await Blueprint_Model.create({
        project_id: new Types.ObjectId(projectId),
        original_image: imageUrl,
        uploaded_by: new Types.ObjectId(req.user!._id),
        blueprint_json: result,
        created_at: new Date(),
      })
    }

    res.json({
      blueprint_id: blueprint._id,
      blueprint_json: result,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to convert blueprint'
    res.status(400).json({ error: message })
  }
})

router.post(
  '/upload',
  upload.single('image'),
  async (req: Request, res: Response) => {
    try {
      const projectId = String(req.body.projectId || '')

      if (!projectId || !Types.ObjectId.isValid(projectId)) {
        res.status(400).json({ error: 'A valid projectId is required' })
        return
      }

      if (!req.file) {
        res.status(400).json({ error: 'An image file is required' })
        return
      }

      const blueprint = await uploadBlueprintImage({
        projectId,
        imageBuffer: req.file.buffer,
        mimeType: req.file.mimetype,
        uploadedBy: req.user!._id,
      })

      res.json({
        blueprint_id: blueprint._id,
        image_url: blueprint.original_image,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload blueprint'
      res.status(400).json({ error: message })
    }
  }
)

router.get('/project/:projectId', async (req: Request, res: Response) => {
  try {
    const projectId = String(req.params.projectId || '')

    if (!Types.ObjectId.isValid(projectId)) {
      res.status(400).json({ error: 'Invalid projectId' })
      return
    }

    const blueprint = await getProjectBlueprint(projectId)

    if (!blueprint) {
      res.status(404).json({ error: 'No blueprint found for this project' })
      return
    }

    res.json(blueprint)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch blueprint'
    res.status(400).json({ error: message })
  }
})

export default router