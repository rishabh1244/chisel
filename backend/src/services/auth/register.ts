import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../../models/User'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me'

export async function register(username: string, password: string) {
  const existing = await User.findOne({ username })
  if (existing) {
    throw new Error('Username already exists')
  }

  const salt = await bcrypt.genSalt(10)
  const password_hash = await bcrypt.hash(password, salt)

  const user = await User.create({ username, password_hash })

  const token = jwt.sign(
    { _id: user._id.toString(), username: user.username },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  return { token, user: { _id: user._id.toString(), username: user.username } }
}