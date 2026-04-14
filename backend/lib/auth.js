import jwt from 'jsonwebtoken'

export default function auth(req, res) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return decoded
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}
