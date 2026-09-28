const { Pool, types } = require('pg')
require('dotenv').config()

// Return DATE columns as plain 'YYYY-MM-DD' strings instead of JS Dates,
// which would otherwise be serialized as UTC timestamps and shift by timezone
types.setTypeParser(1082, v => v)

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  family: 4
})

module.exports = pool
