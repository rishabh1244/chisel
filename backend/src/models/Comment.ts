import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IComment extends Document {
  issue_id: Types.ObjectId
  created_by: Types.ObjectId
  content: string
  media_links: string[]
  created_at: Date
  updated_at: Date
}

const CommentSchema = new Schema<IComment>({
  issue_id: { type: Schema.Types.ObjectId, ref: 'Issue', required: true },
  created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  media_links: [{ type: String }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
})

export default mongoose.model<IComment>('Comment', CommentSchema)
