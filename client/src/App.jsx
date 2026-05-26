import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

function App() {
  const [expenses, setExpenses] = useState([])
  const [income, setIncome] = useState([])
  const [assets, setAssets] = useState([])

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTab, setModalTab] = useState('expense')

  // Expense form
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringFrequency, setRecurringFrequency] = useState('monthly')

  // Date Defaults
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [incomeDate, setIncomeDate] = useState(today)

  // Success state
  const [success, setSuccess] = useState(null)

  // Income form
  const [incomeSource, setIncomeSource] = useState('')
  const [incomeAmount, setIncomeAmount] = useState('')
  const [incomeDescription, setIncomeDescription] = useState('')
  const [incomeIsRecurring, setIncomeIsRecurring] = useState(false)
  const [incomeRecurringFrequency, setIncomeRecurringFrequency] = useState('monthly')

  // Asset form
  const [assetName, setAssetName] = useState('')
  const [assetType, setAssetType] = useState('Cash')
  const [assetValue, setAssetValue] = useState('')

  const [timePeriod, setTimePeriod] = useState('month')
  const [darkMode, setDarkMode] = useState(false)

  const tw = (light, dark) => darkMode ? dark : light

  // ── Fetch all data ──────────────────────────────────────────
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/expenses`)
      .then(r => r.json()).then(d => setExpenses(Array.isArray(d) ? d : []))
      .catch(() => setExpenses([]))

    fetch(`${import.meta.env.VITE_API_URL}/api/income`)
      .then(r => r.json()).then(d => setIncome(Array.isArray(d) ? d : []))
      .catch(() => setIncome([]))

    fetch(`${import.meta.env.VITE_API_URL}/api/assets`)
      .then(r => r.json()).then(d => setAssets(Array.isArray(d) ? d : []))
      .catch(() => setAssets([]))
  }, [])

  // ── Filtering ───────────────────────────────────────────────
  const filterByPeriod = (items, dateKey = 'date') => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return items.filter(e => {
      const d = new Date(e[dateKey])
      switch (timePeriod) {
        case 'today': return d >= today
        case 'week': const w = new Date(today); w.setDate(w.getDate() - 7); return d >= w
        case 'month': return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        case 'year': return d.getFullYear() === now.getFullYear()
        default: return true
      }
    })
  }

  const filteredExpenses = filterByPeriod(expenses)
  const filteredIncome = filterByPeriod(income)

  const totalSpent = filteredExpenses.reduce((s, e) => s + parseFloat(e.amount), 0)
  const totalIncome = filteredIncome.reduce((s, i) => s + parseFloat(i.amount), 0)
  const totalAssets = assets.reduce((s, a) => { const v = parseFloat(a.value); return s + (isNaN(v) ? 0 : v) }, 0)
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpent) / totalIncome * 100).toFixed(1) : 0
  const netWorth = totalAssets + totalIncome - totalSpent

  const showSuccess = (type) => {
    setSuccess(type)
    setTimeout(() => setSuccess(null), 2000)
  }

  const byCategory = {}
  filteredExpenses.forEach(e => {
    byCategory[e.category] = (byCategory[e.category] || 0) + parseFloat(e.amount)
  })

  // ── Recent activity (mixed, last 10) ───────────────────────
  const recentActivity = [
    ...filteredExpenses.map(e => ({ ...e, _type: 'expense' })),
    ...filteredIncome.map(i => ({ ...i, _type: 'income' })),
    ...assets.map(a => ({ ...a, date: a.created_at?.split('T')[0] || '', _type: 'asset' }))
  ]
    .filter(i => i.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10)

  // ── CRUD ────────────────────────────────────────────────────
  const addExpense = () => {
    if (!category || !amount || !date) return alert('Fill in required fields')
    fetch(`${import.meta.env.VITE_API_URL}/api/expenses`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, amount: parseFloat(amount), description, date, is_recurring: isRecurring, recurring_frequency: recurringFrequency })
    }).then(r => r.json()).then(d => {
      setExpenses([{ ...d, amount: parseFloat(d.amount) }, ...expenses])
      setCategory(''); setAmount(''); setDescription(''); setDate(''); setIsRecurring(false)
      setModalOpen(false)
      showSuccess('expense')
    }).catch(err => console.error(err))
  }

  const addIncome = () => {

    console.log('addIncome called', { incomeSource, incomeAmount, incomeDate })

    if (!incomeSource || !incomeAmount || !incomeDate) return alert('Fill in required fields')
    fetch(`${import.meta.env.VITE_API_URL}/api/income`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: incomeSource, amount: parseFloat(incomeAmount), description: incomeDescription, date: incomeDate, is_recurring: incomeIsRecurring, recurring_frequency: incomeRecurringFrequency })
    }).then(r => r.json()).then(d => {
      setIncome([{ ...d, amount: parseFloat(d.amount) }, ...income])
      setIncomeSource(''); setIncomeAmount(''); setIncomeDescription(''); setIncomeDate(''); setIncomeIsRecurring(false)
      setModalOpen(false)
      showSuccess('income')
    }).catch(err => console.error(err))
  }

  const addAsset = () => {
    if (!assetName || !assetValue) return alert('Fill in required fields')
    fetch(`${import.meta.env.VITE_API_URL}/api/assets`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: assetName, type: assetType, value: parseFloat(assetValue) })
    }).then(r => r.json()).then(d => {
      setAssets([{ ...d, value: parseFloat(d.value) }, ...assets])
      setAssetName(''); setAssetValue('')
      setModalOpen(false)
      showSuccess('asset')
    }).catch(err => console.error(err))
  }

  const deleteExpense = id => fetch(`${import.meta.env.VITE_API_URL}/api/expenses/${id}`, { method: 'DELETE' })
    .then(() => setExpenses(expenses.filter(e => e.id !== id)))

  const deleteIncome = id => fetch(`${import.meta.env.VITE_API_URL}/api/income/${id}`, { method: 'DELETE' })
    .then(() => setIncome(income.filter(i => i.id !== id)))

  const deleteAsset = id => fetch(`${import.meta.env.VITE_API_URL}/api/assets/${id}`, { method: 'DELETE' })
    .then(() => setAssets(assets.filter(a => a.id !== id)))

  const handleDelete = item => {
    if (item._type === 'expense') deleteExpense(item.id)
    else if (item._type === 'income') deleteIncome(item.id)
    else deleteAsset(item.id)
  }

  const getChartData = () => {
    const days = 7
    const result = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const dateStr = d.toISOString().split('T')[0]
      const spent = expenses 
        .filter(e => e.date === dateStr)
        .reduce((s, e) => s + parseFloat(e.amount), 0)
      const earned = income 
        .filter(i => i.date === dateStr)
        .reduce((s, i) => s + parseFloat(i.amount), 0)
      result.push({ label, spent, earned })
    }
    return result
  }
  const chartData = getChartData()

  // ── Input class helper ──────────────────────────────────────
  const inputCls = tw(
    'w-full px-4 py-3 rounded-lg border border-gray-300 text-black bg-white focus:border-blue-500 focus:outline-none text-sm',
    'w-full px-4 py-3 rounded-lg border border-gray-700 text-white bg-gray-800 focus:border-blue-500 focus:outline-none text-sm'
  )

  return (
    <div className={tw('min-h-screen bg-gray-100', 'min-h-screen bg-gray-950')}>

      {/* ── Header ── */}
      <div className={tw('bg-white border-b border-gray-200 px-6 pt-10 pb-4', 'bg-gray-900 border-b border-gray-800 px-6 pt-10 pb-4')}>
        <div className="flex justify-between items-start">
          <div>
            <p className={tw('text-gray-400 text-xs', 'text-gray-500 text-xs')}>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'} 👋</p>
            <h1 className={tw('text-2xl font-bold text-black mt-0.5', 'text-2xl font-bold text-white mt-0.5')}>Dashboard</h1>
            <p className={tw('text-gray-400 text-xs mt-1', 'text-gray-500 text-xs mt-1')}>You've spent <span className={tw('text-black font-semibold', 'text-white font-semibold')}>${(() => { const w = new Date(); w.setDate(w.getDate() - 7); return expenses.filter(e => new Date(e.date) >= w).reduce((s, e) => s + parseFloat(e.amount), 0).toFixed(2) })()}</span> this week</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <button onClick={() => setDarkMode(!darkMode)}
              className={tw(
                'relative w-14 h-7 rounded-full bg-gray-200 transition-colors duration-300 flex items-center',
                'relative w-14 h-7 rounded-full bg-gray-700 transition-colors duration-300 flex items-center'
              )}>
              <span className={tw(
                'absolute left-1 w-5 h-5 rounded-full bg-white transition-transform duration-300 flex items-center justify-center',
                'absolute left-1 w-5 h-5 rounded-full bg-gray-900 transition-transform duration-300 translate-x-7 flex items-center justify-center'
              )}>
                {darkMode ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                )}
              </span>
            </button>
            <div className="text-right">
              <p className={tw('text-gray-400 text-xs mb-1', 'text-gray-500 text-xs mb-1')}>Net Worth</p>
              <span className={tw('inline-block text-2xl font-bold text-black border-2 border-black rounded-2xl px-4 py-1', 'inline-block text-2xl font-bold text-white border-2 border-white rounded-2xl px-4 py-1')}>${netWorth.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 pb-24">

        {/* ── Time Period Tabs ── */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['all', 'today', 'week', 'month', 'year'].map(p => (
            <button key={p} onClick={() => setTimePeriod(p)}
              className={tw(
                `px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${timePeriod === p ? 'bg-black text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`,
                `px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${timePeriod === p ? 'bg-white text-black' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'}`
              )}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className={tw('bg-white rounded-2xl p-4 shadow-sm', 'bg-gray-900 rounded-2xl p-4')}>
            <p className={tw('text-gray-400 text-xs font-medium mb-1', 'text-gray-500 text-xs font-medium mb-1')}>Total Spent</p>
            <p className={tw('text-2xl font-bold text-black', 'text-2xl font-bold text-white')}>${totalSpent.toFixed(2)}</p>
            <p className={tw('text-gray-400 text-xs mt-1', 'text-gray-500 text-xs mt-1')}>{filteredExpenses.length} transactions</p>
          </div>
          <div className={tw('bg-white rounded-2xl p-4 shadow-sm', 'bg-gray-900 rounded-2xl p-4')}>
            <p className={tw('text-gray-400 text-xs font-medium mb-1', 'text-gray-500 text-xs font-medium mb-1')}>Total Income</p>
            <p className="text-2xl font-bold text-green-500">${totalIncome.toFixed(2)}</p>
            <p className={tw('text-gray-400 text-xs mt-1', 'text-gray-500 text-xs mt-1')}>{filteredIncome.length} entries</p>
          </div>
          <div className={tw('bg-white rounded-2xl p-4 shadow-sm', 'bg-gray-900 rounded-2xl p-4')}>
            <p className={tw('text-gray-400 text-xs font-medium mb-1', 'text-gray-500 text-xs font-medium mb-1')}>Savings Rate</p>
            <p className={`text-2xl font-bold ${parseFloat(savingsRate) >= 0 ? 'text-blue-500' : 'text-red-500'}`}>{savingsRate}%</p>
            <p className={tw('text-gray-400 text-xs mt-1', 'text-gray-500 text-xs mt-1')}>of income saved</p>
          </div>
          <div className={tw('bg-white rounded-2xl p-4 shadow-sm', 'bg-gray-900 rounded-2xl p-4')}>
            <p className={tw('text-gray-400 text-xs font-medium mb-1', 'text-gray-500 text-xs font-medium mb-1')}>Total Assets</p>
            <p className="text-2xl font-bold text-purple-500">${totalAssets.toFixed(2)}</p>
            <p className={tw('text-gray-400 text-xs mt-1', 'text-gray-500 text-xs mt-1')}>{assets.length} assets</p>
          </div>
        </div>

        {/* Spending and Income Chart */}
        <div className={tw('bg-white rounded-2xl p-4 shadow-sm mb-6', 'bg-gray-900 rounded-2xl p-4 mb-6')}>
          <p className={tw('text-sm font-semibold text-black mb-4', 'text-sm font-semibold text-white mb-4')}>Last 7 Days</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1f2937': '#f3f4f6'} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: darkMode ? '#6b7280' : '#9ca3af'}} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: darkMode ? '#6b7280' : "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip
                formatter={(value, name) => [`$${value.toFixed(2)}`, name === 'spent' ? 'Spent' : 'Income']}
                contentStyle={{ background: darkMode ? '#111827' : '#fff', border: 'none', borderRadius: '12px', fontSize: '12px' }}
              />
              <Legend formatter={v => v === 'spent' ? 'Spent' : 'Income'} />
              <Line type="monotone" dataKey="spent" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="earned" stroke="#22c55e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        

        {/* ── Recent Activity ── */}
        <div className={tw('bg-white rounded-2xl p-4 shadow-sm', 'bg-gray-900 rounded-2xl p-4')}>
          <p className={tw('text-sm font-semibold text-black mb-3', 'text-sm font-semibold text-white mb-3')}>Recent Activity</p>
          {recentActivity.length === 0 ? (
            <p className={tw('text-gray-400 text-sm text-center py-6', 'text-gray-500 text-sm text-center py-6')}>No activity yet. Tap + to add something.</p>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((item, idx) => {
                const isExpense = item._type === 'expense'
                const isIncome = item._type === 'income'
                const isAsset = item._type === 'asset'
                const label = isExpense ? item.category : isIncome ? item.source : item.name
                const sub = isExpense ? (item.description || 'No description') : isIncome ? (item.description || 'No description') : item.type
                const amountVal = parseFloat(isAsset ? item.value : item.amount)
                const amountColor = isExpense ? 'text-red-500' : isIncome ? 'text-green-500' : 'text-purple-500'
                const amountPrefix = isExpense ? '-' : '+'
                const tag = isExpense ? { label: 'Expense', bg: tw('bg-red-50 text-red-500', 'bg-red-900/30 text-red-400') }
                  : isIncome ? { label: 'Income', bg: tw('bg-green-50 text-green-600', 'bg-green-900/30 text-green-400') }
                  : { label: 'Asset', bg: tw('bg-purple-50 text-purple-600', 'bg-purple-900/30 text-purple-400') }

                return (
                  <div key={`${item._type}-${item.id}-${idx}`}
                    className={tw('flex items-center justify-between p-3 rounded-xl bg-gray-50', 'flex items-center justify-between p-3 rounded-xl bg-gray-800')}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${tag.bg}`}>{tag.label}</span>
                      <div className="min-w-0">
                        <p className={tw('text-sm font-semibold text-black truncate', 'text-sm font-semibold text-white truncate')}>{label}</p>
                        <p className={tw('text-xs text-gray-400 truncate', 'text-xs text-gray-500 truncate')}>{sub} · {item.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-2">
                      <p className={`text-sm font-bold ${amountColor}`}>{isAsset ? '' : amountPrefix}${amountVal.toFixed(2)}</p>
                      <button onClick={() => handleDelete(item)}
                        className={tw('text-gray-300 hover:text-red-500 transition', 'text-gray-600 hover:text-red-400 transition')}>✕</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Success Toast */}
      {success && (
        <div className={tw(
          'fixed bottom-28 left-1/2 -translate-x-1/2 bg-black text-white px-5 py-3 rounded-2xl text-sm font-medium flex items-center gap-2 z-50 transition-all',
          'fixed bottom-28 left-1/2 -translate-x-1/2 bg-white text-black px-5 py-3 rounded-2xl text-sm font-medium flex items-center gap-2 z-50 transition-all'
        )}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {success === 'expense' ? 'Expense added' : success === 'income' ? 'Income added' : 'Asset added'}
        </div>
      )}

      {/* ── Floating + Button ── */}
      <button
        onClick={() => setModalOpen(true)}
        className={tw(
          'fixed bottom-8 right-6 w-16 h-16 bg-black text-white rounded-2xl shadow-lg flex items-center justify-center transition-all duration-200 active:scale-95 hover:scale-105 z-40',
          'fixed bottom-8 right-6 w-16 h-16 bg-white text-black rounded-2xl shadow-lg flex items-center justify-center transition-all duration-200 active:scale-95 hover:scale-105 z-40'
        )}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="10" y1="3" x2="10" y2="17"/>
          <line x1="3" y1="10" x2="17" y2="10"/>
        </svg>
      </button>

      {/* ── Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}>
          <div className={tw('bg-white rounded-t-3xl w-full max-w-2xl p-6 pb-10', 'bg-gray-900 rounded-t-3xl w-full max-w-2xl p-6 pb-10')}
            style={{ maxHeight: '85vh', overflowY: 'auto' }}>

            {/* Modal Header */}
            <div className="flex justify-between items-center mb-5">
              <h2 className={tw('text-lg font-bold text-black', 'text-lg font-bold text-white')}>Add New</h2>
              <button onClick={() => setModalOpen(false)}
                className={tw('text-gray-400 hover:text-black text-xl', 'text-gray-500 hover:text-white text-xl')}>✕</button>
            </div>

            {/* Tabs */}
            <div className={tw('flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl', 'flex gap-1 mb-6 bg-gray-800 p-1 rounded-xl')}>
              {['expense', 'income', 'asset'].map(tab => (
                <button key={tab} onClick={() => setModalTab(tab)}
                  className={tw(
                    `flex-1 py-2 rounded-lg text-sm font-semibold transition ${modalTab === tab ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`,
                    `flex-1 py-2 rounded-lg text-sm font-semibold transition ${modalTab === tab ? 'bg-gray-700 text-white' : 'text-gray-500'}`
                  )}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Expense Form */}
            {modalTab === 'expense' && (
              <div className="flex flex-col gap-3">
                <div>
                  <p className={tw('text-xs text-gray-400 mb-2', 'text-xs text-gray-500 mb-2')}>Category</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: 'Food', emoji: '🍔' },
                      { value: 'Rent', emoji: '🏠' },
                      { value: 'Utilities', emoji: '💡' },
                      { value: 'Transport', emoji: '🚗' },
                      { value: 'Entertainment', emoji: '🎬' },
                      { value: 'Health', emoji: '💊' },
                      { value: 'Shopping', emoji: '🛍️' },
                      { value: 'Other', emoji: '📌' },
                    ].map(c => (
                      <button
                        key={c.value}
                        onClick={() => setCategory(c.value)}
                        className={tw(
                          `flex flex-col items-center gap-1 p-2 rounded-xl border transition text-xs font-medium ${category === c.value ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'}`,
                          `flex flex-col items-center gap-1 p-2 rounded-xl border transition text-xs font-medium ${category === c.value ? 'border-white bg-white text-black' : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-500'}`
                        )}
                      >
                        <span className="text-xl">{c.emoji}</span>
                        <span>{c.value}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className={tw('flex items-center border border-gray-300 rounded-lg bg-white', 'flex items-center border border-gray-700 rounded-lg bg-gray-800')}>
                  <span className={tw('pl-4 text-gray-400 text-sm font-medium', 'pl-4 text-gray-500 text-sm font-medium')}>$</span>
                  <input className={tw('flex-1 px-2 py-3 text-black bg-transparent focus:outline-none text-sm', 'flex-1 px-2 py-3 text-white bg-transparent focus:outline-none text-sm')} placeholder="0.00" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
                </div>                
                <input className={inputCls} placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} />
                <input className={inputCls} type="date" value={date} onChange={e => setDate(e.target.value)} />
                <label className={tw('flex items-center gap-3 p-3 rounded-lg bg-gray-50', 'flex items-center gap-3 p-3 rounded-lg bg-gray-800')}>
                  <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="w-5 h-5" />
                  <span className={tw('text-black font-medium text-sm', 'text-white font-medium text-sm')}>Recurring?</span>
                </label>
                {isRecurring && (
                  <select className={inputCls} value={recurringFrequency} onChange={e => setRecurringFrequency(e.target.value)}>
                    <option>weekly</option><option>monthly</option><option>yearly</option>
                  </select>
                )}
                <button className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold mt-2 transition"
                  onClick={() => addExpense()}>Add Expense</button>
              </div>
            )}

            {/* Income Form */}
            {modalTab === 'income' && (
              <div className="flex flex-col gap-3">
                <input className={inputCls} placeholder="Source (e.g. Salary, Freelance)" value={incomeSource} onChange={e => setIncomeSource(e.target.value)} />
                <div className={tw('flex items-center border border-gray-300 rounded-lg bg-white', 'flex items-center border border-gray-700 rounded-lg bg-gray-800')}>
                  <span className={tw('pl-4 text-gray-400 text-sm font-medium', 'pl-4 text-gray-500 text-sm font-medium')}>$</span>
                  <input className={tw('flex-1 px-2 py-3 text-black bg-transparent focus:outline-none text-sm', 'flex-1 px-2 py-3 text-white bg-transparent focus:outline-none text-sm')} placeholder="0.00" type="number" value={incomeAmount} onChange={e => setIncomeAmount(e.target.value)} />
                </div>
                <input className={inputCls} placeholder="Description (optional)" value={incomeDescription} onChange={e => setIncomeDescription(e.target.value)} />
                <input className={inputCls} type="date" value={incomeDate} onChange={e => setIncomeDate(e.target.value)} />
                <label className={tw('flex items-center gap-3 p-3 rounded-lg bg-gray-50', 'flex items-center gap-3 p-3 rounded-lg bg-gray-800')}>
                  <input type="checkbox" checked={incomeIsRecurring} onChange={e => setIncomeIsRecurring(e.target.checked)} className="w-5 h-5" />
                  <span className={tw('text-black font-medium text-sm', 'text-white font-medium text-sm')}>Recurring?</span>
                </label>
                {incomeIsRecurring && (
                  <select className={inputCls} value={incomeRecurringFrequency} onChange={e => setIncomeRecurringFrequency(e.target.value)}>
                    <option>weekly</option><option>monthly</option><option>yearly</option>
                  </select>
                )}
                <button className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold mt-2 transition"
                  onClick={() => addIncome()}>Add Income</button>
              </div>
            )}

            {/* Asset Form */}
            {modalTab === 'asset' && (
              <div className="flex flex-col gap-3">
                <input className={inputCls} placeholder="Asset name" value={assetName} onChange={e => setAssetName(e.target.value)} />
                <select className={inputCls} value={assetType} onChange={e => setAssetType(e.target.value)}>
                  <option>Cash</option>
                  <option>Stocks</option>
                  <option>Crypto</option>
                  <option>Precious Metals</option>
                  <option>Real Estate</option>
                  <option>Other</option>
                </select>
                <div className={tw('flex items-center border border-gray-300 rounded-lg bg-white', 'flex items-center border border-gray-700 rounded-lg bg-gray-800')}>
                  <span className={tw('pl-4 text-gray-400 text-sm font-medium', 'pl-4 text-gray-500 text-sm font-medium')}>$</span>
                  <input className={tw('flex-1 px-2 py-3 text-black bg-transparent focus:outline-none text-sm', 'flex-1 px-2 py-3 text-white bg-transparent focus:outline-none text-sm')} placeholder="0.00" type="number" value={assetValue} onChange={e => setAssetValue(e.target.value)} />
                </div>
                <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl font-semibold mt-2 transition"
                  onClick={() => addAsset()}>Add Asset</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
