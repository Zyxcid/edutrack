import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pool from '../db.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

// ── Register ──────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body
  
  // ── Validasi input ──
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' })
  }

  if (name.trim().length < 2) {
    return res.status(400).json({ message: 'Name must be at least 2 characters' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' })
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' })
  }
  
  // Cek email sudah terdaftar
  const existing = await pool.query(
    'SELECT * FROM users WHERE email = $1', [email]
  )
  if (existing.rows.length > 0) {
    return res.status(400).json({ message: 'Email already registered' })
  }
  
  // Enkripsi password
  const hashedPassword = await bcrypt.hash(password, 10)
  
  // Simpan ke database
  const result = await pool.query(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
    [name, email, hashedPassword]
  )
  
  res.status(201).json({ message: 'Register successful', user: result.rows[0] })
})

// ── Login ─────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  
  // Cari user
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1', [email]
  )
  if (result.rows.length === 0) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }
  
  const user = result.rows[0]
  
  // Cek password
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }
  
  // Buat token
  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
  
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
})

// Route yang dilindungi — hanya bisa diakses kalau login
router.get('/me', verifyToken, async (req, res) => {
  // req.user berisi data dari token: { id, name, email }
  const result = await pool.query(
    'SELECT id, name, email, created_at FROM users WHERE id = $1',
    [req.user.id]
  )
  res.json({ user: result.rows[0] })
})

export default router