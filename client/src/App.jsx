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
  const [darkMode, setDarkMode] = useState(false)
  const [assets, setAssets] = useState([])
  const [assetName, setAssetName] = useState('')
  const [assetType, setAssetType] = useState('Cash')
  const [assetValue, setAssetValue] = useState('')

  const tw = (light, dark) => darkMode ? dark : light

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

  const addAsset = () => {
    if (!assetName || !assetValue) {
      alert('Fill in required fields')
      return
    }

    fetch(`${import.meta.env.VITE_API_URL}/api/assets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: assetName,
        type: assetType,
        value: parseFloat(assetValue)
      })
    })

      .then(res => res.json())
      .then(data => {
        setAssets([data, ...assets])
        setAssetName('')
        setAssetValue('')
      })
      .catch(err => console.error('Error adding asset:', err))
  }

  const deleteAsset = (id) => {
    fetch(`${import.meta.env.VITE_API_URL}/api/assets/${id}`, {
      method: 'DELETE'
    })
      .then(() => setAssets(assets.filter(a => a.id !== id)))
      .catch(err => console.error('Error deleting asset:', err))
  }

  const filteredExpenses = getFilteredExpenses()
  const totalSpent = Array.isArray(filteredExpenses) ? filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0) : 0
  const byCategory = {}
  expenses.forEach(e => {
    byCategory[e.category] = (byCategory[e.category] || 0) + parseFloat(e.amount)
  })
  const totalAssets = assets.reduce((sum, a) => sum + parseFloat(a.value), 0)
  const netWorth = totalAssets - totalSpent


  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/expenses`)
      .then(res => res.json())
      .then(data => setExpenses(data))
      .catch(err => console.error('Error fetching expenses:', err))

    fetch(`${import.meta.env.VITE_API_URL}/api/assets`)
      .then(res => res.json())
      .then(data => setAssets(data))
      .catch(err => console.error('Error fetching assets:', err))
  }, [])


  return (
    <div className={tw('min-h-screen bg-gray-50 pb-12', 'min-h-screen bg-gray-950 pb-12')}>
      {/* Header */}
      <div className={tw('bg-white pt-12 pb-6 px-6 border-b border-gray-200', 'bg-gray-900 pt-12 pb-6 px-6 border-b border-gray-800')}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className={tw('text-4xl font-bold text-black', 'text-4xl font-bold text-white')}>Expenses</h1>
            <p className={tw('text-gray-500 text-sm mt-1', 'text-gray-400 text-sm mt-1')}>Track your spending</p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={tw('px-4 py-2 rounded-full font-semibold transition bg-gray-200 text-gray-700 hover:bg-gray-300', 'px-4 py-2 rounded-full font-semibold transition bg-gray-800 text-yellow-400 hover:bg-gray-700')}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      <div className={tw('px-6 py-8', 'px-6 py-8')}>
        {/* Time Period Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {['all', 'today', 'week', 'month', 'year'].map(period => (
            <button
              key={period}
              onClick={() => setTimePeriod(period)}
              className={tw(
                `px-4 py-2 whitespace-nowrap font-medium rounded-lg transition ${
                  timePeriod === period
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`,
                `px-4 py-2 whitespace-nowrap font-medium rounded-lg transition ${
                  timePeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`
              )}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          <div className={tw('bg-white p-6 rounded-xl shadow-sm', 'bg-gray-900 p-6 rounded-xl shadow-sm')}>
            <p className={tw('text-gray-500 text-sm font-medium', 'text-gray-400 text-sm font-medium')}>Total Spent</p>
            <p className={tw('text-5xl font-bold text-black mt-2', 'text-5xl font-bold text-white mt-2')}>${parseFloat(totalSpent).toFixed(2)}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className={tw('bg-white p-4 rounded-xl shadow-sm', 'bg-gray-900 p-4 rounded-xl shadow-sm')}>
              <p className={tw('text-gray-500 text-xs font-medium', 'text-gray-400 text-xs font-medium')}>Transactions</p>
              <p className={tw('text-3xl font-bold text-black mt-2', 'text-3xl font-bold text-white mt-2')}>{filteredExpenses.length}</p>
            </div>
            <div className={tw('bg-white p-4 rounded-xl shadow-sm', 'bg-gray-900 p-4 rounded-xl shadow-sm')}>
              <p className={tw('text-gray-500 text-xs font-medium', 'text-gray-400 text-xs font-medium')}>Average</p>
              <p className={tw('text-3xl font-bold text-black mt-2', 'text-3xl font-bold text-white mt-2')}>${parseFloat(totalSpent / (filteredExpenses.length || 1)).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Net Worth Section */}
        <div className={tw('bg-white p-6 rounded-xl shadow-sm mb-8', 'bg-gray-900 p-6 rounded-xl shadow-sm mb-8')}>
          <h2 className={tw('text-lg font-bold text-black mb-4', 'text-lg font-bold text-white mb-4')}>Net Worth</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <p className={tw('text-gray-500 text-sm', 'text-gray-400 text-sm')}>Total Assets</p>
              <p className={tw('text-2xl font-bold text-green-600 mt-1', 'text-2xl font-bold text-green-400 mt-1')}>${parseFloat(totalAssets).toFixed(2)}</p>
            </div>
            <div>
              <p className={tw('text-gray-500 text-sm', 'text-gray-400 text-sm')}>Total Spent</p>
              <p className={tw('text-2xl font-bold text-red-600 mt-1', 'text-2xl font-bold text-red-400 mt-1')}>${parseFloat(totalSpent).toFixed(2)}</p>
            </div>
            <div>
              <p className={tw('text-gray-500 text-sm', 'text-gray-400 text-sm')}>Net Worth</p>
              <p className={tw('text-2xl font-bold text-blue-600 mt-1', 'text-2xl font-bold text-blue-400 mt-1')}>${parseFloat(netWorth).toFixed(2)}</p>
            </div>
          </div>

          {/* Add Asset Form */}
          <div className={tw('bg-gray-50 p-4 rounded-lg mb-4', 'bg-gray-800 p-4 rounded-lg mb-4')}>
            <h3 className={tw('text-sm font-semibold text-black mb-3', 'text-sm font-semibold text-white mb-3')}>Add Asset</h3>
            <div className="grid grid-cols-3 gap-2">
              <input
                className={tw('px-3 py-2 rounded border border-gray-300 text-black text-sm', 'px-3 py-2 rounded border border-gray-700 text-white text-sm bg-gray-700')}
                placeholder="Asset name"
                value={assetName}
                onChange={e => setAssetName(e.target.value)}
              />
              <select
                className={tw('px-3 py-2 rounded border border-gray-300 text-black text-sm', 'px-3 py-2 rounded border border-gray-700 text-white text-sm bg-gray-700')}
                value={assetType}
                onChange={e => setAssetType(e.target.value)}
              >
                <option>Cash</option>
                <option>Stocks</option>
                <option>Crypto</option>
                <option>Precious Metals</option>
                <option>Real Estate</option>
                <option>Other</option>
              </select>
              <div className="flex gap-2">
                <input
                  className={tw('flex-1 px-3 py-2 rounded border border-gray-300 text-black text-sm', 'flex-1 px-3 py-2 rounded border-gray-700 text-white text-sm bg-gray-700')}
                  placeholder="Value"
                  type="number"
                  value={assetValue}
                  onChange={e => setAssetValue(e.target.value)}
                />
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded font-semibold text-sm"
                  onClick={addAsset}
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Assets List */}
          <div className="space-y-2">
            {assets.map(a => (
              <div key={a.id} className={tw('flex justify-between items-center p-3 rounded-lg bg-gray-50', 'flex justify-between items-center p-3 rounded-lg bg-gray-800')}>
                <div>
                  <p className={tw('font-semibold text-black', 'font-semibold text-white')}>{a.name}</p>
                  <p className={tw('text-gray-500 text-xs', 'text-gray-400 text-xs')}>{a.type}</p>
                </div>
                <div className="flex gap-4 items-center">
                  <p className={tw('font-bold text-black', 'font-bold text-white')}>${parseFloat(a.value).toFixed(2)}</p>
                  <button
                    onClick={() => deleteAsset(a.id)}
                    className={tw('text-red-500 hover:text-red-600', 'text-red-400 hover:text-red-300')}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart */}
        {Object.keys(byCategory).length > 0 && (
          <div className={tw('bg-white p-6 rounded-xl shadow-sm mb-8', 'bg-gray-900 p-6 rounded-xl shadow-sm mb-8')}>
            <h2 className={tw('text-lg font-bold text-black mb-4', 'text-lg font-bold text-white mb-4')}>By Category</h2>
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
        <div className={tw('bg-white p-6 rounded-xl shadow-sm mb-8', 'bg-gray-900 p-6 rounded-xl shadow-sm mb-8')}>
          <h2 className={tw('text-lg font-bold text-black mb-4', 'text-lg font-bold text-white mb-4')}>Add Expense</h2>
          <div className="space-y-3">
            <select
              className={tw('w-full px-4 py-3 rounded-lg border border-gray-300 text-black bg-white focus:border-blue-500 focus:outline-none', 'w-full px-4 py-3 rounded-lg border border-gray-700 text-white bg-gray-800 focus:border-blue-500 focus:outline-none')}
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
              className={tw('w-full px-4 py-3 rounded-lg border border-gray-300 text-black bg-white focus:border-blue-500 focus:outline-none', 'w-full px-4 py-3 rounded-lg border border-gray-700 text-white bg-gray-800 focus:border-blue-500 focus:outline-none')}
              placeholder="Amount"
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
            <input
              className={tw('w-full px-4 py-3 rounded-lg border border-gray-300 text-black bg-white focus:border-blue-500 focus:outline-none', 'w-full px-4 py-3 rounded-lg border border-gray-700 text-white bg-gray-800 focus:border-blue-500 focus:outline-none')}
              placeholder="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            <input
              className={tw('w-full px-4 py-3 rounded-lg border border-gray-300 text-black bg-white focus:border-blue-500 focus:outline-none', 'w-full px-4 py-3 rounded-lg border border-gray-700 text-white bg-gray-800 focus:border-blue-500 focus:outline-none')}
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
            <label className={tw('flex items-center gap-3 p-3 rounded-lg bg-gray-50', 'flex items-center gap-3 p-3 rounded-lg bg-gray-800')}>
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={e => setIsRecurring(e.target.checked)}
                className="w-5 h-5"
              />
              <span className={tw('text-black font-medium', 'text-white font-medium')}>Recurring?</span>
            </label>
            {isRecurring && (
              <select
                className={tw('w-full px-4 py-3 rounded-lg border border-gray-300 text-black bg-white focus:border-blue-500 focus:outline-none', 'w-full px-4 py-3 rounded-lg border border-gray-700 text-white bg-gray-800 focus:border-blue-500 focus:outline-none')}
                value={recurringFrequency}
                onChange={e => setRecurringFrequency(e.target.value)}
              >
                <option>weekly</option>
                <option>monthly</option>
                <option>yearly</option>
              </select>
            )}
            <button
              className={tw('w-full bg-blue-500 hover:bg-blue-600 text-white py-3 font-semibold mt-4 rounded-lg transition', 'w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold mt-4 rounded-lg transition')}
              onClick={addExpense}
            >
              Add Expense
            </button>
          </div>
        </div>

        {/* Expenses List */}
        <div>
          <h2 className={tw('text-lg font-bold text-black mb-4', 'text-lg font-bold text-white mb-4')}>Recent</h2>
          <div className="space-y-2">
            {filteredExpenses.map(e => (
              <div key={e.id} className={tw('bg-white p-4 rounded-lg flex justify-between items-center hover:bg-gray-50 transition', 'bg-gray-900 p-4 rounded-lg flex justify-between items-center hover:bg-gray-800 transition')}>
                <div className="flex-1">
                  <p className={tw('font-semibold text-black', 'font-semibold text-white')}>{e.category}</p>
                  <p className={tw('text-gray-500 text-sm', 'text-gray-400 text-sm')}>{e.description || 'No description'}</p>
                  <p className={tw('text-gray-400 text-xs mt-1', 'text-gray-500 text-xs mt-1')}>{e.date}</p>
                </div>
                <div className="text-right mr-4">
                  <p className={tw('text-lg font-bold text-black', 'text-lg font-bold text-white')}>${parseFloat(e.amount).toFixed(2)}</p>
                  {e.is_recurring && <p className="text-blue-500 text-xs font-medium">{e.recurring_frequency}</p>}
                </div>
                <button
                  onClick={() => deleteExpense(e.id)}
                  className={tw('text-red-500 hover:text-red-600 font-semibold', 'text-red-400 hover:text-red-300 font-semibold')}
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