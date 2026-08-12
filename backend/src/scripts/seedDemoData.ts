import mongoose, { Types } from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') })
import User from '../models/User'
import Project from '../models/Project'
import Blueprint from '../models/Blueprint'
import Issue from '../models/Issue'
import Comment from '../models/Comment'
import Chisel from '../models/Chisel'

const PROJECT_SEEDS = [
  {
    title: 'Riverside Heights – Tower B',
    description:
      '12-storey residential tower with 4 basements. Structural works nearing completion, MEP fit-out in progress.',
    status: 'inProgress',
  },
  {
    title: 'Green Valley Housing Phase 2',
    description:
      'Community of 48 independent houses. External cladding, roads and landscaping currently underway.',
    status: 'active',
  },
  {
    title: 'Metro Depot Maintenance Shed',
    description:
      'Industrial maintenance shed with overhead crane runway. Steel structure and cladding complete.',
    status: 'completed',
  },
  {
    title: 'Tech Park Commercial Plaza',
    description:
      'Grade A office plaza with retail podium. Foundation and basement waterproofing stage.',
    status: 'inProgress',
  },
]

const ISSUE_SEEDS = [
  {
    title: 'Crack in column C-8 on Level 3',
    description:
      'Visible crack detected in column C-8 at grid A-3 on Level 3. Needs structural inspection before formwork continues.',
  },
  {
    title: 'Water seepage in basement B2',
    description:
      'Seepage observed near the south retaining wall in basement B2. Waterproofing membrane check required.',
  },
  {
    title: 'Rebar spacing mismatch in Beam B-12',
    description:
      'Rebar spacing does not match drawing spec ST-B12-REV2. Need verification from the structural lead before slab pour.',
  },
  {
    title: 'Electrical conduit layout incomplete on Level 1',
    description:
      'Main distribution panel conduit routing not laid out as per drawing. Blocks overhead cable pulling on Level 1.',
  },
  {
    title: 'Roof waterproofing layer incomplete – Tower A',
    description:
      'Applied waterproofing layer on Tower A roof does not cover the parapet edge. Reapply to prevent roof leakage.',
  },
  {
    title: 'Plumbing riser leak near Warden office',
    description:
      'Leak reported in the plumbing riser adjacent to the Warden office on the ground floor.',
  },
  {
    title: 'Missing safety signage at trench edge',
    description:
      'Warning signage not placed at trench edges near Block B. Safety audit flagged violation SG-4.',
  },
  {
    title: 'Concrete slump test failed for slab pour',
    description:
      'Slump test for the Level 4 slab pour failed at 220mm against spec of 120mm. Pour halted pending mix correction.',
  },
  {
    title: 'HVAC duct clash with fire sprinkler lines',
    description:
      'Modelled duct route clashes with sprinkler mains on Level 2 corridor. Coordination required before ceiling works.',
  },
  {
    title: 'Tile work misalignment in main lobby',
    description:
      'Vitrified tiles in the lobby are misaligned along the entrance grid. Realignment required before grouting.',
  },
  {
    title: 'Excavation shoring needs reinforcement',
    description:
      'North side shoring showing slight deflection. Additional walers requested before next lift.',
  },
  {
    title: 'Paint bubbling on exterior facade',
    description:
      'Bubbling observed on the east facade after recent rains. Moisture ingress suspected behind the topcoat.',
  },
  {
    title: 'Window frame gap in east elevation',
    description:
      'Gap between window frame and reveal on the east elevation. Sealant application pending.',
  },
  {
    title: 'Drainage slope error near parking entry',
    description:
      'Surface drains near the parking entry are sloped towards the ramp. Rework of falls required.',
  },
]

const COMMENTS_POOL = [
  'Inspected on site this morning, recommended immediate epoxy injection.',
  'Scheduling the contractor for tomorrow morning.',
  'Vendor contacted, replacement material is on order.',
  'Measured onsite — off spec by about 15%, needs rework.',
  'Uploaded the revised drawing, please review.',
  'Re-coating completed and inspection passed.',
  'Leak traced to a loose joint, repacked and sealed.',
  'Barricades and signage installed around the area.',
  'Structural lead confirmed the fix approach.',
  'Mix design adjusted, next pour scheduled.',
  'Coordination meeting booked to resolve the clash.',
  'This can be closed after the final QA sign-off.',
  'Pending material delivery before work can restart.',
  'Marked up the as-built location for the record.',
]

const IMAGES = [
  'https://i.imgur.com/U7QmYxE.jpg',
  'https://i.imgur.com/rA9dGxR.jpg',
  'https://i.imgur.com/c3Afljm.jpg',
  'https://i.imgur.com/aKmRCgx.jpg',
  'https://i.imgur.com/vG5qvL0.jpg',
  'https://i.imgur.com/J3qWke0.jpg',
  'https://i.imgur.com/P6qLcf1.jpg',
  'https://5.imimg.com/data5/LI/DJ/MY-8327537/random-block-construction-500x500.jpg',
  'https://plus.unsplash.com/premium_photo-1681989486976-9ec9d2eac57a?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y29uc3RydWN0aW9ufGVufDB8fDB8fHww',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSW9MPebFO-rSROnFJY8om6Za7zkdUTK7Vg8nZ49oyFeML1QNDyeg9jryII&s=10',
  'https://www.shutterstock.com/shutterstock/photos/56915494/display_1500/stock-photo-a-random-building-under-construction-56915494.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7x10ttA2I2kTietWbdyLmJfwFp6I5Kqav8G_zQQBUARU3cS9vFiJFU-qY&s=10',
]

const ISSUE_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED'] as const
const CHISEL_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickMany<T>(arr: readonly T[], count: number): T[] {
  const copy = [...arr]
  const out: T[] = []
  while (out.length < count && copy.length > 0) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0])
  }
  return out
}

function randomPastDate(maxDays: number): Date {
  const ms = Math.floor(Math.random() * maxDays * 24 * 60 * 60 * 1000)
  return new Date(Date.now() - ms)
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!)

  const demo = await User.findOne({ username: 'demo' })
  if (!demo) throw new Error('Demo user not found in database')

  const teammates = await User.find({
    username: { $in: ['arjun', 'neha', 'vikram', 'rahul', 'priya', 'karan'] },
  })
  if (teammates.length < 2) throw new Error('Expected team users to exist for realistic data')

  console.log('Clearing existing demo-owned data...')
  const existingProjects = await Project.find({ created_by: demo._id })
  const existingProjectIds = existingProjects.map((p) => p._id)
  const existingIssues = await Issue.find({ project_id: { $in: existingProjectIds } })
  const existingIssueIds = existingIssues.map((i) => i._id)
  await Blueprint.deleteMany({ project_id: { $in: existingProjectIds } })
  await Comment.deleteMany({ issue_id: { $in: existingIssueIds } })
  await Chisel.deleteMany({ project_id: { $in: existingProjectIds } })
  await Issue.deleteMany({ project_id: { $in: existingProjectIds } })
  await Project.deleteMany({ _id: { $in: existingProjectIds } })

  const sourceBlueprint = await Blueprint.findOne({
    original_image: { $exists: true, $ne: '' },
  }).lean()

  let projectCount = 0
  let issueCount = 0
  let commentCount = 0
  let chiselCount = 0

  for (const seed of PROJECT_SEEDS) {
    const workers = pickMany(teammates, 2 + Math.floor(Math.random() * 3))
    const maintainers = Array.from(
      new Set([demo, ...pickMany(teammates, 1 + Math.floor(Math.random() * 2))])
    )

    const project = await Project.create({
      title: seed.title,
      description: seed.description,
      created_by: demo._id,
      workers: workers.map((w) => w._id as Types.ObjectId),
      maintainers: maintainers.map((m) => m._id as Types.ObjectId),
      status: seed.status,
      created_at: randomPastDate(30),
    })
    projectCount += 1

    if (sourceBlueprint) {
      await Blueprint.create({
        project_id: project._id,
        original_image: sourceBlueprint.original_image,
        blueprint_json: sourceBlueprint.blueprint_json,
        threejs_json: sourceBlueprint.threejs_json,
        uploaded_by: demo._id,
        created_at: new Date(project.created_at.getTime() + 60 * 60 * 1000),
      })
    }

    const projectIssues = pickMany(ISSUE_SEEDS, 5 + Math.floor(Math.random() * 3))
    for (const issueSeed of projectIssues) {
      const assigned = pick(workers)
      const issue = await Issue.create({
        project_id: project._id,
        title: issueSeed.title,
        description: issueSeed.description,
        image_link: pick(IMAGES),
        created_by: assigned._id,
        assigned_to: assigned._id,
        status: pick(ISSUE_STATUSES),
        created_at: randomPastDate(14),
      })
      issueCount += 1

      const numComments = 1 + Math.floor(Math.random() * 3)
      for (let i = 0; i < numComments; i += 1) {
        const author = pick([...teammates, demo])
        const createdAt = new Date(issue.created_at.getTime() + (i + 1) * 3 * 60 * 60 * 1000)
        await Comment.create({
          issue_id: issue._id,
          created_by: author._id,
          content: pick(COMMENTS_POOL),
          media_links: Math.random() < 0.6 ? [pick(IMAGES)] : [],
          created_at: createdAt,
          updated_at: createdAt,
        })
        commentCount += 1
      }

      if (Math.random() < 0.7) {
        const author = pick(workers)
        const status = pick(CHISEL_STATUSES)
        const committedAt = new Date(issue.created_at.getTime() + 5 * 60 * 60 * 1000)
        const merged = status !== 'PENDING'
        await Chisel.create({
          project_id: project._id,
          issue_id: issue._id,
          commit_author: author._id,
          title: issueSeed.title,
          description: issueSeed.description,
          media_links: [pick(IMAGES)],
          status,
          merged_by: merged ? demo._id : undefined,
          committed_at: committedAt,
          merged_at: merged ? new Date(committedAt.getTime() + 6 * 60 * 60 * 1000) : undefined,
        })
        chiselCount += 1
      }
    }
  }

  console.log(
    `Done. Seeded ${projectCount} projects, ${issueCount} issues, ${commentCount} comments, ${chiselCount} chisels for demo user.`
  )
  await mongoose.disconnect()
}

main().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
