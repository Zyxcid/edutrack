import express from 'express'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

// Forward request ke FastAPI
router.post('/', verifyToken, async (req, res) => {
  try {
    const response = await fetch('http://localhost:8000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json(data)
    }

    res.json(data)
  } catch (err) {
    res.status(500).json({ message: 'AI service unavailable' })
  }
})

export default router