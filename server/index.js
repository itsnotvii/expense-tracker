const express = require('express')
const cors = require('cors')
const pool = require('./db')
require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/expenses', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC',
      ['demo-user']
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    res.status(500).json({ error: 'Database error' })
  }
})

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
    console.error('Error adding expense:', error)
    res.status(500).json({ error: 'Database error' })
  }
})

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM expenses WHERE id = $1 AND user_id = $2',
      [req.params.id, 'demo-user']
    )
    res.json({ message: 'Expense deleted' })
  } catch (error) {
    console.error('Error deleting expense:', error)
    res.status(500).json({ error: 'Database error' })
  }
})

app.get('/api/assets', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM assets WHERE user_id = $1 ORDER BY created_at DESC',
      ['demo-user']
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching assets:', error)
    res.status(500).json({ error: 'Database error' })
  }
})

app.post('/api/assets', async (req, res) => {
  console.log('req.body:', req.body)
  const { name, type, value } = req.body
  console.log('Parsed:', { name, type, value })

  if (!name || !value) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const result = await pool.query(
      `INSERT INTO assets (user_id, name, type, value)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      ['demo-user', name, type || 'Other', parseFloat(value)]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error adding asset:', error)
    res.status(500).json({ error: 'Database error' })
  }
})

app.delete('/api/assets/:id', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM assets WHERE id = $1 AND user_id = $2',
      [req.params.id, 'demo-user']
    )
    res.json({ message: 'Asset deleted' })
  } catch (error) {
    console.error('Error deleting asset:', error)
    res.status(500).json({ error: 'Database error' })
  }
})

app.put('/api/expenses/:id', async (req, res) => {
  const { category, amount, description, date, is_recurring, recurring_frequency } = req.body
  try {
    const result = await pool.query(
      `UPDATE expenses SET category=$1, amount=$2, description=$3, date=$4, is_recurring=$5, recurring_frequency=#6 WHERE id=$7 AND user_id=$8 RETURNING *`,
      [category, parseFloat(amount), description, date, is_recurring || false, recurring_frequency, req.params.id, 'demo-user']
    )
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating expense:', error)
    res.status(500).json({ error: 'Database error' })
  }
})

app.put('/api/income/:id', async (req, res) => {
  const { source, amount, description, date, is_recuring, recurring_frequency } = req.body
  try {
    const result = await pool.query(
      `UPDATE income SET source=$1, amount=$2, description=$3, date=$4, is_recurring=$5, recurring_frequency=$6 WHERE id=$7 AND user_ud=$8 RETURNING *`,
      [source, parseFloat(amount), description, date, is_recurring || false, recurring_frequency, req.params.id, 'demo-user']
    )
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating income', error)
    res.status(500).json({ error: 'Database error' })
  }
})

app.put('/api/assets/:id', async (req, res) => {
  const { name, type, value } = req.body
  try {
    const result = await pool.query(
      `UPDATE assets SET name=$1, type=$2, value=$3 WHERE id=$4 AND user_ID=$5 RETURNING *`,
      [name, type, parseFloat(value), req.params.id, 'demo-user']
    )
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating asset:', error)
    res.status(500).json({ error: 'Database error' })
  }
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/income', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM income WHERE user_id = $1 ORDER BY date DESC',
      ['demo-user']
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching income:', error)
    res.status(500).json({ error: 'Database error' })
  }
})

app.post('/api/income', async (req, res) => {
  const { source, amount, description, date, is_recurring, recurring_frequency } = req.body

  if (!source || !amount || !date) {
    return res.status(400).json({ error: 'Missing required fields!' })
  }

  try {
    const result = await pool.query(
      `INSERT INTO income (user_id, source, amount, description, date, is_recurring, recurring_frequency)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      ['demo-user', source, parseFloat(amount), description, date, is_recurring || false, recurring_frequency]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error adding income:', error)
    res.status(500).json({ error: 'Database error' })
  }
})

app.delete('/api/income/:id', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM income WHERE id = $1 AND user_id = $2',
      [req.params.id, 'demo-user']
    )
    res.json({ message: 'Income deleted' })
  } catch (error) {
    console.error('Error deleting income:', error)
    res.status(500).json({ error: 'Database error' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})