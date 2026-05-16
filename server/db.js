import pg from 'pg'
import 'dotenv/config'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

pool.connect()
  .then(() => console.log('Connected to PostgreSQL!'))
  .catch(err => console.error('Database connection error:', err))

export default pool