import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET

// Simulasi database sementara (nanti diganti database asli)
const users = []

// ── Register ──────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body

  // Cek apakah email sudah terdaftar
  const existingUser = users.find(u => u.email === email)
  if (existingUser) {
    return res.status(400).json({ message: 'Email already registered' })
  }

  // Enkripsi password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Simpan user
  const newUser = { id: users.length + 1, name, email, password: hashedPassword }
  users.push(newUser)

  res.status(201).json({ message: 'Register successful' })
})

// ── Login ─────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  // Cari user
  const user = users.find(u => u.email === email)
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }

  // Cek password
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }

  // Buat JWT token
  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
})

export default router