import pg from 'pg'
import 'dotenv/config'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Handle error tanpa crash server
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
})

// Test koneksi tanpa menyimpan client
pool.query('SELECT 1')
  .then(() => console.log('Connected to PostgreSQL!'))
  .catch(err => console.error('Database connection error:', err))

export default pool