import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import connectDB from './config/db'
import authRoutes from './api_gateway/auth'
import workspaceRoutes from './api_gateway/workspace'
import usersRoutes from './api_gateway/users'
import fetchProblemsRoutes from './api_gateway/fetch_projects'
import issueRoutes from './api_gateway/issueRoute'
import commentRoutes from './api_gateway/commentRoute'
import blueprintRoutes from './api_gateway/blueprintRoute'
import bcrypt from 'bcryptjs'
import User from './models/User'

const app = express()
const port = process.env.PORT || 3000

connectDB()

app.use(express.json())

// CORS: allow the frontend dev server to talk to this API
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') {
    res.sendStatus(204)
    return
  }
  next()
})

// Seed a demo account for quick logins
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
seedDemoUser()

app.use('/api/auth', authRoutes)
app.use('/api/workspace', workspaceRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/projects', fetchProblemsRoutes)
app.use('/api/issues', issueRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/blueprint', blueprintRoutes)

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
