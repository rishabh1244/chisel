import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../../models/User'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me'

export async function login(username: string, password: string) {
  const user = await User.findOne({ username })
  if (!user) {
    throw new Error('Invalid username or password')
  }

  const isMatch = await bcrypt.compare(password, user.password_hash)
  if (!isMatch) {
    throw new Error('Invalid username or password')
  }

  const token = jwt.sign(
    { _id: user._id.toString(), username: user.username },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  return { token, user: { _id: user._id.toString(), username: user.username } }
}