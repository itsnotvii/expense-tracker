const express = require('express')
const cors = require('cors')
const pool = require('./db')
require('dotenv').config()

const app = express()

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/expenses', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC',
      ['demo-user']
    )
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Database error' })
  }
})

// POST new expense
app.post('/api/expenses', async (req, res) => {
  const { category, amount, description, date, is_recurring, recurring_frequency } = req.body

  if (!category || !amount || !date) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const result = await pool.query(
      `INSERT INTO expenses (user_id, category, amount, description, date, is_recurring, recurring_frequency)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      ['demo-user', category, amount, description, date, is_recurring || false, recurring_frequency]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Database error' })
  }
})

// DELETE expense
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM expenses WHERE id = $1 AND user_id = $2',
      [req.params.id, 'demo-user']
    )
    res.json({ message: 'Expense deleted' })
  } catch (error) {
    console.error(error)
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