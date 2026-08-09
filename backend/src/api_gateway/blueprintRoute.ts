import { Router, Request, Response } from 'express'
import { Types } from 'mongoose'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { authenticate } from '../middleware/auth'
import { blueprintToJson } from '../services/llm/blueprintToJson'
import { uploadBlueprintImage } from '../services/blueprint_handler/uploadBlueprint'
import { getProjectBlueprint } from '../services/blueprint_handler/getBlueprint'
import Blueprint_Model from '../models/Blueprint'

const router = Router()

router.use(authenticate)

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', '..', 'tmp')
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png'
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`)
  },
})

const upload = multer({
  storage,
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
    const description = typeof req.body.description === 'string' ? req.body.description : ''
    const imageUrl = typeof req.body.imageUrl === 'string' ? req.body.imageUrl : undefined
    const projectId = String(req.body.projectId || '')

    if (!description) {
      res.status(400).json({ error: 'Blueprint description (text) is required' })
      return
    }

    if (!projectId || !Types.ObjectId.isValid(projectId)) {
      res.status(400).json({ error: 'A valid projectId is required' })
      return
    }

    const result = await blueprintToJson(description, imageUrl)

    const existing = await Blueprint_Model.findOne({ project_id: projectId })

    let blueprint
    if (existing) {
      existing.threejs_json = result
      blueprint = await existing.save()
    } else {
      blueprint = await Blueprint_Model.create({
        project_id: new Types.ObjectId(projectId),
        original_image: imageUrl,
        uploaded_by: new Types.ObjectId(req.user!._id),
        threejs_json: result,
        created_at: new Date(),
      })
    }

    res.json({ blueprint_id: blueprint._id, ...result })
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
        imagePath: req.file.path,
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