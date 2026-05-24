import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import predictRoutes from './routes/predict.js'

const PORT = process.env.PORT || 3000
const app = express()

app.use(express.json())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}))

app.use('/api/auth', authRoutes)
app.use('/api/predict', predictRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'EduTrack API is running!' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server berjalan di port ${PORT}`)
})