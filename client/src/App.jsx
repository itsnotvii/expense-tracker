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
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white pt-12 pb-6 px-6 border-b border-gray-200">
        <h1 className="text-4xl font-bold text-black">Expenses</h1>
        <p className="text-gray-500 text-sm mt-1">Track your spending</p>
      </div>
  
      <div className="px-6 py-8">
        {/* Time Period Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {['all', 'today', 'week', 'month', 'year'].map(period => (
            <button
              key={period}
              onClick={() => setTimePeriod(period)}
              className={`ios-tab px-4 py-2 whitespace-nowrap font-medium ${
                timePeriod === period
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
  
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          <div className="ios-card p-6">
            <p className="text-gray-500 text-sm font-medium">Total Spent</p>
            <p className="text-5xl font-bold text-black mt-2">${parseFloat(totalSpent).toFixed(2)}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="ios-card p-4">
              <p className="text-gray-500 text-xs font-medium">Transactions</p>
              <p className="text-3xl font-bold text-black mt-2">{filteredExpenses.length}</p>
            </div>
            <div className="ios-card p-4">
              <p className="text-gray-500 text-xs font-medium">Average</p>
              <p className="text-3xl font-bold text-black mt-2">${parseFloat(totalSpent / (filteredExpenses.length || 1)).toFixed(2)}</p>
            </div>
          </div>
        </div>
  
        {/* Chart */}
        {Object.keys(byCategory).length > 0 && (
          <div className="ios-card p-6 mb-8">
            <h2 className="text-lg font-bold text-black mb-4">By Category</h2>
            <ResponsiveContainer width="100%" height={250}>
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
                  outerRadius={80}
                  fill="#0a84ff"
                  dataKey="value"
                >
                  {Object.keys(byCategory).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={['#0a84ff', '#ff3b30', '#34c759', '#ff9500', '#af52de', '#ff2d55'][index % 6]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${parseFloat(value).toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
  
        {/* Add Expense Form */}
        <div className="ios-card p-6 mb-8">
          <h2 className="text-lg font-bold text-black mb-4">Add Expense</h2>
          <div className="space-y-3">
            <select
              className="ios-input w-full px-4 py-3 text-black"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option value="">Select Category</option>
              <option value="Food">🍔 Food</option>
              <option value="Rent">🏠 Rent</option>
              <option value="Utilities">💡 Utilities</option>
              <option value="Transport">🚗 Transport</option>
              <option value="Entertainment">🎬 Entertainment</option>
              <option value="Health">💊 Health</option>
              <option value="Shopping">🛍️ Shopping</option>
              <option value="Other">📌 Other</option>
            </select>
            <input
              className="ios-input w-full px-4 py-3 text-black"
              placeholder="Amount"
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
            <input
              className="ios-input w-full px-4 py-3 text-black"
              placeholder="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            <input
              className="ios-input w-full px-4 py-3 text-black"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={e => setIsRecurring(e.target.checked)}
                className="w-5 h-5"
              />
              <span className="text-black font-medium">Recurring?</span>
            </label>
            {isRecurring && (
              <select
                className="ios-input w-full px-4 py-3 text-black"
                value={recurringFrequency}
                onChange={e => setRecurringFrequency(e.target.value)}
              >
                <option>weekly</option>
                <option>monthly</option>
                <option>yearly</option>
              </select>
            )}
            <button
              className="ios-button w-full bg-blue-500 hover:bg-blue-600 text-white py-3 font-semibold mt-4"
              onClick={addExpense}
            >
              Add Expense
            </button>
          </div>
        </div>
  
        {/* Expenses List */}
        <div>
          <h2 className="text-lg font-bold text-black mb-4">Recent</h2>
          <div className="space-y-2">
            {filteredExpenses.map(e => (
              <div key={e.id} className="ios-card p-4 flex justify-between items-center hover:bg-gray-50 transition">
                <div className="flex-1">
                  <p className="font-semibold text-black">{e.category}</p>
                  <p className="text-gray-500 text-sm">{e.description || 'No description'}</p>
                  <p className="text-gray-400 text-xs mt-1">{e.date}</p>
                </div>
                <div className="text-right mr-4">
                  <p className="text-lg font-bold text-black">${parseFloat(e.amount).toFixed(2)}</p>
                  {e.is_recurring && <p className="text-blue-500 text-xs font-medium">{e.recurring_frequency}</p>}
                </div>
                <button
                  onClick={() => deleteExpense(e.id)}
                  className="text-red-500 hover:text-red-600 font-semibold"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App