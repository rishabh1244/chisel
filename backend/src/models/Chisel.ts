import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IChisel extends Document {
  project_id: Types.ObjectId
  issue_id: Types.ObjectId
  commit_author: Types.ObjectId
  title: string
  description: string
  media_links: string[]
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  merged_by: Types.ObjectId
  committed_at: Date
  merged_at: Date
}

const ChiselSchema = new Schema<IChisel>({
  project_id: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  issue_id: { type: Schema.Types.ObjectId, ref: 'Issue', required: true },
  commit_author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  media_links: [{ type: String }],
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  },
  merged_by: { type: Schema.Types.ObjectId, ref: 'User' },
  committed_at: { type: Date, default: Date.now },
  merged_at: { type: Date },
})

export default mongoose.model<IChisel>('Chisel', ChiselSchema)