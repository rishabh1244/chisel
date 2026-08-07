import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  username: string
  password_hash: string
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
})

export default mongoose.model<IUser>('User', UserSchema)
