import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose'
import connectDB from '../config/db'
import Issue from '../models/Issue'
import Chisel from '../models/Chisel'
import Project from '../models/Project'

async function migrateCompletedIssues() {
  await connectDB()

  const issues = await Issue.find({ status: 'RESOLVED' })
  console.log(`Found ${issues.length} completed issues`)

  let created = 0
  let skipped = 0

  for (const issue of issues) {
    const existing = await Chisel.findOne({ issue_id: issue._id })
    if (existing) {
      skipped++
      continue
    }

    const project = await Project.findById(issue.project_id).select('created_by')

    await Chisel.create({
      project_id: issue.project_id,
      issue_id: issue._id,
      commit_author: project?.created_by || new mongoose.Types.ObjectId(),
      title: issue.title,
      description: issue.description,
      media_links: issue.image_link ? [issue.image_link] : [],
      status: 'PENDING',
    })
    created++
    console.log(`Committed: ${issue.title}`)
  }

  console.log(`Done. Created ${created} chisels, skipped ${skipped} existing`)
  await mongoose.disconnect()
}

migrateCompletedIssues().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})