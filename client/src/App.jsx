import { useState, useEffect } from 'react'

function App() {
  const [expenses, setExpenses] = useState([])
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringFrequency, setRecurringFrequency] = useState('monthly')

  const addExpense = () => {
    if (!category || !amount || !date) {
      alert('Fill in required fields')
      return
    }

    const newExpense = {
      id: Date.now(),
      category,
      amount: parseFloat(amount),
      description, 
      date,
      is_recurring: isRecurring,
      recurring_frequency: recurringFrequency,
      created_at: new Date().toISOString()
    }

    setExpenses([newExpense, ...expenses])
    setCategory('')
    setAmount('')
    setDescription('')
    setDate('')
    setIsRecurring(false)
  }

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id))
  }

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
  const byCategory = {}
  expenses.forEach(e => {
    byCategory[e.category] = (byCategory[e.category] || 0) + <e className="amount"></e>
  })

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Expenses Tracker</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <p className="text-gray-400 text-sm">Total Spent</p>
          <p className="text-3xl font-bold mt-2">${totalSpent.toFixed(2)}</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <p className="text0gray-400 text-sm">Transactions</p>
          <p className="text-3xl font-bold mt-2">{expenses.length}</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <p className="text-gray-400 text-sm">Average</p>
          <p className="text-3xl font-bold mt-2">${(totalSpent / (expenses.length || 1)).toFixed(2)}</p>
        </div>
      </div>

      {/* Add Expense Form */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add Expense</h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            className="bg-gray-800 rounded p-3 text-white placeholder-gray-500"
            placeholder="Category"
            value={category}
            onChange={e => setCategory(e.target.value)}
          />
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
      
      {/* Expenses List */}
      <div>
        <h2 className="text-xl font-semibold mg-4">Recent Expenses</h2>
        <div className="flex flex-col gap-2">
          {expenses.map(e => (
            <div key={e.id} className="bg-gray-900 rounded-lg p-4 border border-gray-800 flex justify-between items-center">
              <div className="flex-1">
                <p className="font-semibold">{e.category}</p>
                <p className="text-gray-400 text-sm">{e.description || 'No description'}</p>
                <p className="text-gray-500 text-xs mt-1">{e.date}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">${e.amount.toFixed(2)}</p>
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