import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

function App() {
  const [expenses, setExpenses] = useState([])
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringFrequency, setRecurringFrequency] = useState('monthly')
  const [timePeriod, setTimePeriod] = useState('all')

  const addExpense = () => {
    if (!category || !amount || !date) {
      alert('Fill in required fields')
      return
    }
  
    fetch(`${import.meta.env.VITE_API_URL}/api/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category,
        amount: parseFloat(amount),
        description,
        date,
        is_recurring: isRecurring,
        recurring_frequency: recurringFrequency
      })
    })
      .then(res => res.json())
      .then(data => {
        console.log('Response:', data)
        const newExpense = { ...data, amount: parseFloat(data.amount) }
        setExpenses([newExpense, ...expenses])
        setCategory('')
        setAmount('')
        setDescription('')
        setDate('')
        setIsRecurring(false)
      })
      .catch(err => console.error('Error adding expense:', err))
  }

  const deleteExpense = (id) => {
    fetch(`${import.meta.env.VITE_API_URL}/api/expenses/${id}`, {
      method: 'DELETE'
    })
    .then(() => setExpenses(expenses.filter(e => e.id !== id)))
    .catch(err => console.error('Error deleting:', err))
  }



  const getFilteredExpenses = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
    return expenses.filter(e => {
      const expenseDate = new Date(e.date)
  
      switch(timePeriod) {
        case 'today': 
          return expenseDate >= today
        case 'week':
          const weekAgo = new Date(today)
          weekAgo.setDate(weekAgo.getDate() - 7)
          return expenseDate >= weekAgo
        case 'month':
          return expenseDate.getMonth() === now.getMonth() &&
                 expenseDate.getFullYear() === now.getFullYear()
        case 'year':
          return expenseDate.getFullYear() === now.getFullYear()
        default: 
          return true
      }
    })
  }
  
  const filteredExpenses = getFilteredExpenses()

  const totalSpent = Array.isArray(filteredExpenses) ? filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0) : 0
  const byCategory = {}
  expenses.forEach(e => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount
  })

  useEffect(() => {
  fetch(`${import.meta.env.VITE_API_URL}/api/expenses`)
    .then(res => res.json())
    .then(data => setExpenses(data))
    .catch(err => console.error('Error fetching expenses:', err))
  }, [])

  

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Expenses Tracker</h1>

      <div className="flex gap-2 mb-8">
        {['all', 'today', 'week', 'month', 'year'].map(period => (
          <button
            key={period}
            onClick={() => setTimePeriod(period)}
            className={`px-4 py-2 rounded font-semibold transition-colors ${
              timePeriod === period
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <p className="text-gray-400 text-sm">Total Spent</p>
          <p className="text-3xl font-bold mt-2">${parseFloat(totalSpent).toFixed(2)}</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <p className="text-gray-400 text-sm">Transactions</p>
          <p className="text-3xl font-bold mt-2">{expenses.length}</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <p className="text-gray-400 text-sm">Average</p>
          <p className="text-3xl font-bold mt-2">${parseFloat(totalSpent / (expenses.length || 1)).toFixed(2)}</p>
        </div>
      </div>

      {/* Add Expense Form */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add Expense</h2>
        <div className="grid grid-cols-2 gap-4">
          <select
            className="bg-gray-800 rounded p-3 text-white placeholder-gray-500"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            <option value="Food">Food</option>
            <option value="Rent">Rent</option>
            <option value="Utilities">Utilities</option>
            <option value="Transport">Transport</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Health">Health</option>
            <option value="Shopping">Shopping</option>
            <option value="Other">Other</option>
          </select>
          <input 
            className="bg-gray-800 rounded p-3 text-white placeholder-gray-500"
            placeholder="Amount"
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
          <input 
            className="bg-gray-800 rounded p-3 text-white placholder-gray-500"
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <input
            className="bg-gray-800 rounded p-3 text-white"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
          <label className="flex items-center gap-2">
            <input 
              type="checkbox"
              checked={isRecurring}
              onChange={e => setIsRecurring(e.target.checked)}
            />
            <span>Recurring?</span>
          </label>
          {isRecurring && (
            <select 
              className="bg-gray-800 rounded p-3 text-white"
              value={recurringFrequency}
              onChange={e => setRecurringFrequency(e.target.value)}
            >
              <option>weekly</option>
              <option>monthly</option>
              <option>yearly</option>
            </select>
          )}
        </div>
        <button 
          className="w-full bg-blue-600 hover:bg-blue-500 rounded p-3 font-semibold mt-4 transition-colors"
          onClick={addExpense}
        >
          Add Expense
        </button>
      </div>

      {/* Spending by Category Chart */ }
      {Object.keys(byCategory).length > 0 && (
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 mb-8">
          <h2 className="text-xl font-semibold mb-4">Spending By Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={Object.entries(byCategory).map(([name, value]) => ({
                  name, 
                  value: parseFloat(value)
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {Object.keys(byCategory).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={['#3b8246', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][index % 6]} />  
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${parseFloat(value).toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Expenses List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Expenses</h2>
        <div className="flex flex-col gap-2">
          {filteredExpenses.map(e => (
            <div key={e.id} className="bg-gray-900 rounded-lg p-4 border border-gray-800 flex justify-between items-center">
              <div className="flex-1">
                <p className="font-semibold">{e.category}</p>
                <p className="text-gray-400 text-sm">{e.description || 'No description'}</p>
                <p className="text-gray-500 text-xs mt-1">{e.date}</p>
              </div>
              <div className="text-right">
              <p className="text-lg font-bold">${parseFloat(e.amount).toFixed(2)}</p>
                {e.is_recurring && <p className="text-gray-400 text-xs">{e.recurring_frequency}</p>}
              </div>
              <button 
                onClick={() => deleteExpense(e.id)}
                className="text-red-400 hover:text-red-300 ml-4 font-semibold"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )  
}

export default App