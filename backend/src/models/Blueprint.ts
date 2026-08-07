import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IBlueprint extends Document {
  project_id: Types.ObjectId
  original_image: string
  blueprint_json: object
  threejs_json: object
  uploaded_by: Types.ObjectId
  created_at: Date
}

const BlueprintSchema = new Schema<IBlueprint>({
  project_id: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  original_image: { type: String },
  blueprint_json: { type: Schema.Types.Mixed },
  threejs_json: { type: Schema.Types.Mixed },
  uploaded_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  created_at: { type: Date, default: Date.now },
})

export default mongoose.model<IBlueprint>('Blueprint', BlueprintSchema)
