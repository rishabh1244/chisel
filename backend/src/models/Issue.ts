import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IIssue extends Document {
  project_id: Types.ObjectId
  title: string
  description: string
  image_link : string 
  created_by: Types.ObjectId
  assigned_to: Types.ObjectId
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
  created_at: Date
}

const IssueSchema = new Schema<IIssue>({
  project_id: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assigned_to: { type: Schema.Types.ObjectId, ref: 'User' },
  image_link: {type: String , required:false},
  status: {
    type: String,
    enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED'],
    default: 'OPEN',
  },
  created_at: { type: Date, default: Date.now },
})

export default mongoose.model<IIssue>('Issue', IssueSchema)
