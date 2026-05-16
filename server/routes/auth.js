import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pool from '../db.js'

const router = express.Router()

// ── Register ──────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body

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

export default router