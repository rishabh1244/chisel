import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import mongoose from 'mongoose'
import connectDB from './config/db'
import authRoutes from './api_gateway/auth'
import workspaceRoutes from './api_gateway/workspace'
import usersRoutes from './api_gateway/users'
import fetchProblemsRoutes from './api_gateway/fetch_projects'
import issueRoutes from './api_gateway/issueRoute'
import commentRoutes from './api_gateway/commentRoute'
import blueprintRoutes from './api_gateway/blueprintRoute'
import chiselRoutes from './api_gateway/chiselRoute'
import bcrypt from 'bcryptjs'
import User from './models/User'

const app = express()
const port = Number(process.env.PORT) || 3000
const host = process.env.HOST || '0.0.0.0'

app.disable('x-powered-by')
app.use(express.json())

// CORS: allow the frontend to call this API
const allowedOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use((req, res, next) => {
  const origin = req.headers.origin
  const allow = allowedOrigins.includes('*') || (origin && allowedOrigins.includes(origin))
  if (allow) {
    res.header('Access-Control-Allow-Origin', allowedOrigins.includes('*') ? '*' : origin)
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') {
    res.sendStatus(204)
    return
  }
  next()
})

async function seedDemoUser() {
  try {
    const existing = await User.findOne({ username: 'demo' })
    if (!existing) {
      const salt = await bcrypt.genSalt(10)
      const password_hash = await bcrypt.hash('demo1234', salt)
      await User.create({ username: 'demo', password_hash })
      console.log('Seeded demo account: demo / demo1234')
    }
  } catch (error) {
    console.error('Failed to seed demo user:', error)
  }
}

const dbReady = connectDB()
  .then(() => seedDemoUser())
  .catch((error) => {
    console.error('Failed to connect to database:', error)
    throw error
  })

app.use(async (req, res, next) => {
  if (req.path === '/health') {
    next()
    return
  }

  try {
    await dbReady
    next()
  } catch {
    res.status(503).json({ error: 'Database unavailable' })
  }
})

// Health check for load balancers / monitoring
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState // 0=disconnected 1=connected 2=connecting 3=disconnecting
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting']
  res.status(dbState === 1 ? 200 : 503).json({
    status: dbState === 1 ? 'ok' : 'unavailable',
    db: states[dbState] || 'unknown',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/workspace', workspaceRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/projects', fetchProblemsRoutes)
app.use('/api/issues', issueRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/blueprint', blueprintRoutes)
app.use('/api/chisel', chiselRoutes)

export default app

if (!process.env.VERCEL) {
  dbReady
    .then(() => {
      const server = app.listen(port, host, () => {
        console.log(`Server running on ${host}:${port}`)
      })

      const shutdown = (signal: string) => {
        console.log(`${signal} received, shutting down gracefully...`)
        server.close(() => {
          console.log('HTTP server closed')
          mongoose.connection.close(false).then(() => {
            console.log('MongoDB connection closed')
            process.exit(0)
          })
        })
        setTimeout(() => process.exit(1), 10000).unref()
      }

      process.on('SIGINT', () => shutdown('SIGINT'))
      process.on('SIGTERM', () => shutdown('SIGTERM'))
    })
    .catch((err) => {
      console.error('Failed to start server:', err)
      process.exit(1)
    })
}
