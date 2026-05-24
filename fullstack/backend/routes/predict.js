import express from 'express'
import { verifyToken } from '../middleware/auth.js'
import pool from '../db.js'

const router = express.Router()

const AI_URL = process.env.AI_API_URL || 'http://localhost:8000'

// ── Fungsi getWeekStart ────────────────────────────────────────────────────
function getWeekStart() {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now.setDate(diff))

  const year = monday.getFullYear()
  const month = String(monday.getMonth() + 1).padStart(2, '0')
  const date = String(monday.getDate()).padStart(2, '0')

  return `${year}-${month}-${date}`
}

// ── Predict & Simpan ke DB ─────────────────────────────────────────────────
router.post('/', verifyToken, async (req, res) => {
  try {
    const aiPayload = req.body
    const weekStart = getWeekStart()

    const [predictResponse, recommendResponse] = await Promise.all([
      fetch(`${AI_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiPayload)
      }),
      fetch(`${AI_URL}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiPayload)
      })
    ])

    const predictData = await predictResponse.json()
    const recommendData = await recommendResponse.json()

    if (!predictResponse.ok) return res.status(predictResponse.status).json(predictData)
    if (!recommendResponse.ok) return res.status(recommendResponse.status).json(recommendData)

    const predictedScore = predictData.predicted_exam_score
    const recommendations = recommendData.recommendations ?? []

    // Simpan ke database
    await pool.query(`
      INSERT INTO predictions (user_id, input, predicted_score, recommendations, week_start)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, week_start)
      DO UPDATE SET
        input = EXCLUDED.input,
        predicted_score = EXCLUDED.predicted_score,
        recommendations = EXCLUDED.recommendations,
        created_at = current_timestamp
    `, [req.user.id, JSON.stringify(aiPayload), predictedScore, JSON.stringify(recommendations), weekStart])

    res.json({
      predicted_exam_score: predictedScore,
      recommendations,
      status: 'success'
    })

  } catch (err) {
    console.error('Predict error:', err)
    res.status(500).json({ message: 'AI service unavailable', detail: err.message })
  }
})

// ── Ambil semua prediksi user ──────────────────────────────────────────────
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM predictions
      WHERE user_id = $1
      ORDER BY week_start DESC
    `, [req.user.id])

    res.json({ predictions: result.rows })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// ── Ambil prediksi minggu ini ──────────────────────────────────────────────
router.get('/current', verifyToken, async (req, res) => {
  try {
    const weekStart = getWeekStart()
    const result = await pool.query(`
      SELECT * FROM predictions
      WHERE user_id = $1 AND week_start = $2
    `, [req.user.id, weekStart])

    if (result.rows.length === 0) {
      return res.json({ prediction: null })
    }

    res.json({ prediction: result.rows[0] })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// ── Simulasi What-If — TIDAK disimpan ke database ──────────────────────────
router.post('/simulate', verifyToken, async (req, res) => {
  try {
    const response = await fetch(`${AI_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    })

    const data = await response.json()
    if (!response.ok) return res.status(response.status).json(data)

    res.json({ predicted_exam_score: data.predicted_exam_score, status: 'success' })
  } catch (err) {
    res.status(500).json({ message: 'AI service unavailable' })
  }
})

export default router