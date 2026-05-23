import 'dotenv/config' 
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import predictRoutes from './routes/predict.js'

const { HOST, PORT } = process.env;
const app = express();

app.use(express.json());

// Middleware
app.use(cors({
  origin: 'http://localhost:5173' // izinkan request dari Vite
}))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/predict', predictRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'EduTrack API is running!' })
})
app.listen(PORT, HOST, () => {
  console.log(`Server berjalan di http://${HOST}:${PORT}`);
});