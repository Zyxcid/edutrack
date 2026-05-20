import jwt from 'jsonwebtoken'

export const verifyToken = (req, res, next) => {
  // Ambil token dari header
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // format: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' })
  }

  try {
    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // simpan data user ke request
    next() // lanjut ke route
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' })
  }
}