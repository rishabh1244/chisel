import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IProject extends Document {
  title: string
  description: string
  created_by: Types.ObjectId
  workers: Types.ObjectId[]
  maintainers: Types.ObjectId[]
  blueprint_id: Types.ObjectId
  status: string
  created_at: Date
}
const ProjectSchema = new Schema<IProject>({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  workers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  maintainers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  blueprint_id: { type: Schema.Types.ObjectId, ref: 'Blueprint' },
  status: { type: String, default: 'active' },
  created_at: { type: Date, default: Date.now },
})

export default mongoose.model<IProject>('Project', ProjectSchema)
