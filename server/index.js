const express = require('express')
const cors = require('cors')
const pool = require('./db')
require('dotenv').config()

const app = express()

// CLIENT_ORIGIN can be a comma-separated list, e.g. https://your-app.vercel.app,http://localhost:5173
app.use(cors({ origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',').map(o => o.trim()) : '*' }))
app.use(express.json())

const USER_ID = 'demo-user'
const FREQUENCIES = ['weekly', 'monthly', 'yearly']

// Returns a non-negative number, or null if the input isn't one
const parseMoney = value => {
  const n = typeof value === 'string' && value.trim() === '' ? NaN : Number(value)
  return Number.isFinite(n) && n >= 0 ? n : null
}

const isValidDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(new Date(value))

// Validates an expense/income body. `labelField` is 'category' or 'source'.
const parseEntry = (body, labelField) => {
  const label = typeof body[labelField] === 'string' ? body[labelField].trim() : ''
  const amount = parseMoney(body.amount)
  const isRecurring = body.is_recurring === true
  const frequency = isRecurring ? body.recurring_frequency : null

  if (!label || amount === null || !isValidDate(body.date)) {
    return { error: `${labelField}, a valid non-negative amount, and a date (YYYY-MM-DD) are required` }
  }
  if (isRecurring && !FREQUENCIES.includes(frequency)) {
    return { error: `recurring_frequency must be one of: ${FREQUENCIES.join(', ')}` }
  }
  return { label, amount, description: body.description || null, date: body.date, isRecurring, frequency }
}

const parseAsset = body => {
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const value = parseMoney(body.value)
  if (!name || value === null) {
    return { error: 'name and a valid non-negative value are required' }
  }
  return { name, type: body.type || 'Other', value }
}

app.get('/api/expenses', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC',
      [USER_ID]
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    res.status(500).json({ error: 'Database error' })
  }
})

app.post('/api/expenses', async (req, res) => {
  const e = parseEntry(req.body, 'category')
  if (e.error) return res.status(400).json({ error: e.error })

  try {
    const result = await pool.query(
      `INSERT INTO expenses (user_id, category, amount, description, date, is_recurring, recurring_frequency)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [USER_ID, e.label, e.amount, e.description, e.date, e.isRecurring, e.frequency]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error adding expense:', error)
    res.status(500).json({ error: 'Database error' })
  }
})

app.put('/api/expenses/:id', async (req, res) => {
  const e = parseEntry(req.body, 'category')
  if (e.error) return res.status(400).json({ error: e.error })

  try {
    const result = await pool.query(
      `UPDATE expenses SET category=$1, amount=$2, description=$3, date=$4, is_recurring=$5, recurring_frequency=$6
       WHERE id=$7 AND user_id=$8 RETURNING *`,
      [e.label, e.amount, e.description, e.date, e.isRecurring, e.frequency, req.params.id, USER_ID]
    )
    if (result.rowCount === 0) return res.status(404).json({ error: 'Expense not found' })
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating expense:', error)
    res.status(500).json({ error: 'Database error' })
  }
})

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM expenses WHERE id = $1 AND user_id = $2',
      [req.params.id, USER_ID]
    )
    if (result.rowCount === 0) return res.status(404).json({ error: 'Expense not found' })
    res.json({ message: 'Expense deleted' })
  } catch (error) {
    console.error('Error deleting expense:', error)
    res.status(500).json({ error: 'Database error' })
  }
})

app.get('/api/income', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM income WHERE user_id = $1 ORDER BY date DESC',
      [USER_ID]
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching income:', error)
    res.status(500).json({ error: 'Database error' })
  }
})

app.post('/api/income', async (req, res) => {
  const e = parseEntry(req.body, 'source')
  if (e.error) return res.status(400).json({ error: e.error })

  try {
    const result = await pool.query(
      `INSERT INTO income (user_id, source, amount, description, date, is_recurring, recurring_frequency)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [USER_ID, e.label, e.amount, e.description, e.date, e.isRecurring, e.frequency]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error adding income:', error)
    res.status(500).json({ error: 'Database error' })
  }
})

app.put('/api/income/:id', async (req, res) => {
  const e = parseEntry(req.body, 'source')
  if (e.error) return res.status(400).json({ error: e.error })

  try {
    const result = await pool.query(
      `UPDATE income SET source=$1, amount=$2, description=$3, date=$4, is_recurring=$5, recurring_frequency=$6
       WHERE id=$7 AND user_id=$8 RETURNING *`,
      [e.label, e.amount, e.description, e.date, e.isRecurring, e.frequency, req.params.id, USER_ID]
    )
    if (result.rowCount === 0) return res.status(404).json({ error: 'Income not found' })
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating income:', error)
    res.status(500).json({ error: 'Database error' })
  }
})

app.delete('/api/income/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM income WHERE id = $1 AND user_id = $2',
      [req.params.id, USER_ID]
    )
    if (result.rowCount === 0) return res.status(404).json({ error: 'Income not found' })
    res.json({ message: 'Income deleted' })
  } catch (error) {
    console.error('Error deleting income:', error)
    res.status(500).json({ error: 'Database error' })
  }
})

app.get('/api/assets', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM assets WHERE user_id = $1 ORDER BY created_at DESC',
      [USER_ID]
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching assets:', error)
    res.status(500).json({ error: 'Database error' })
  }
})

app.post('/api/assets', async (req, res) => {
  const a = parseAsset(req.body)
  if (a.error) return res.status(400).json({ error: a.error })

  try {
    const result = await pool.query(
      `INSERT INTO assets (user_id, name, type, value)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [USER_ID, a.name, a.type, a.value]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error adding asset:', error)
    res.status(500).json({ error: 'Database error' })
  }
})

app.put('/api/assets/:id', async (req, res) => {
  const a = parseAsset(req.body)
  if (a.error) return res.status(400).json({ error: a.error })

  try {
    const result = await pool.query(
      `UPDATE assets SET name=$1, type=$2, value=$3 WHERE id=$4 AND user_id=$5 RETURNING *`,
      [a.name, a.type, a.value, req.params.id, USER_ID]
    )
    if (result.rowCount === 0) return res.status(404).json({ error: 'Asset not found' })
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating asset:', error)
    res.status(500).json({ error: 'Database error' })
  }
})

app.delete('/api/assets/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM assets WHERE id = $1 AND user_id = $2',
      [req.params.id, USER_ID]
    )
    if (result.rowCount === 0) return res.status(404).json({ error: 'Asset not found' })
    res.json({ message: 'Asset deleted' })
  } catch (error) {
    console.error('Error deleting asset:', error)
    res.status(500).json({ error: 'Database error' })
  }
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
