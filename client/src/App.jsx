import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function App() {
  const [expenses, setExpenses] = useState([])
  const [income, setIncome] = useState([])
  const [assets, setAssets] = useState([])

  const [headerBg, setHeaderBg] = useState({ type: 'solid', value: '' })
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [hamburgerFlipped, setHamburgerFlipped] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalTab, setModalTab] = useState('expense')

  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringFrequency, setRecurringFrequency] = useState('monthly')

  const todayStr = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(todayStr)
  const [incomeDate, setIncomeDate] = useState(todayStr)

  const [success, setSuccess] = useState(null)

  const [incomeSource, setIncomeSource] = useState('')
  const [incomeAmount, setIncomeAmount] = useState('')
  const [incomeDescription, setIncomeDescription] = useState('')
  const [incomeIsRecurring, setIncomeIsRecurring] = useState(false)
  const [incomeRecurringFrequency, setIncomeRecurringFrequency] = useState('monthly')

  const [assetName, setAssetName] = useState('')
  const [assetType, setAssetType] = useState('Cash')
  const [assetValue, setAssetValue] = useState('')

  const [timePeriod, setTimePeriod] = useState('month')
  const [darkMode, setDarkMode] = useState(false)

  const [bannerIndex, setBannerIndex] = useState(0)
  const [bannerVisible, setBannerVisible] = useState(true)

  const [cardModal, setCardModal] = useState(null)

  const [editingItem, setEditingItem] = useState(null)

  const tw = (light, dark) => darkMode ? dark : light

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/expenses`)
      .then(r => r.json()).then(d => setExpenses(Array.isArray(d) ? d : [])).catch(() => setExpenses([]))
    fetch(`${import.meta.env.VITE_API_URL}/api/income`)
      .then(r => r.json()).then(d => setIncome(Array.isArray(d) ? d : [])).catch(() => setIncome([]))
    fetch(`${import.meta.env.VITE_API_URL}/api/assets`)
      .then(r => r.json()).then(d => setAssets(Array.isArray(d) ? d : [])).catch(() => setAssets([]))
  }, [])

  const filterByPeriod = (items) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return items.filter(e => {
      const d = new Date(e.date)
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

  const headerDark = headerBg.type === 'photo' ||
    ['#000000','#0f172a','#1e3a5f','#14532d','#3b0764','#7f1d1d','#431407'].includes(headerBg.value) ||
    headerBg.type === 'gradient'

  const showSuccess = (type) => { setSuccess(type); setTimeout(() => setSuccess(null), 2000) }

  const byCategory = {}
    filteredExpenses.forEach(e => { 
    byCategory[e.category] = (byCategory[e.category] || 0) + parseFloat(e.amount) 
  })

  const recentActivity = [
    ...filteredExpenses.map(e => ({ ...e, _type: 'expense' })),
    ...filteredIncome.map(i => ({ ...i, _type: 'income' })),
    ...assets.map(a => ({ ...a, date: a.created_at?.split('T')[0] || '', _type: 'asset' }))
  ].filter(i => i.date).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10)

  useEffect(() => {
    const greetingTimeout = setTimeout(() => {
      setBannerVisible(false)
      setTimeout(() => {
        setBannerIndex(1)
        setBannerVisible(true)
      }, 300)
    }, 3000) 
    return () => clearTimeout(greetingTimeout)
  }, [])

  useEffect(() => {
    if (bannerIndex === 0) return
    const interval = setInterval(() => {
      setBannerVisible(false)
      setTimeout(() => {
        setBannerIndex(prev => prev === bannerMessages.length - 1 ? 1 : prev + 1)
        setBannerVisible(true)
      }, 300)
    }, 4000)
    return () => clearInterval(interval)
  }, [bannerIndex])

  const addExpense = () => {
    if (!category || !amount || !date) return alert('Fill in required fields')
    fetch(`${import.meta.env.VITE_API_URL}/api/expenses`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, amount: parseFloat(amount), description, date, is_recurring: isRecurring, recurring_frequency: recurringFrequency })
    }).then(r => r.json()).then(d => {
      setExpenses([{ ...d, amount: parseFloat(d.amount) }, ...expenses])
      setCategory(''); setAmount(''); setDescription(''); setDate(todayStr); setIsRecurring(false)
      setModalOpen(false); showSuccess('expense')
    }).catch(err => console.error(err))
  }

  const addIncome = () => {
    if (!incomeSource || !incomeAmount || !incomeDate) return alert('Fill in required fields')
    fetch(`${import.meta.env.VITE_API_URL}/api/income`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: incomeSource, amount: parseFloat(incomeAmount), description: incomeDescription, date: incomeDate, is_recurring: incomeIsRecurring, recurring_frequency: incomeRecurringFrequency })
    }).then(r => r.json()).then(d => {
      setIncome([{ ...d, amount: parseFloat(d.amount) }, ...income])
      setIncomeSource(''); setIncomeAmount(''); setIncomeDescription(''); setIncomeDate(todayStr); setIncomeIsRecurring(false)
      setModalOpen(false); showSuccess('income')
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
      setModalOpen(false); showSuccess('asset')
    }).catch(err => console.error(err))
  }

  // Handlers for deletion
  const deleteExpense = id => fetch(`${import.meta.env.VITE_API_URL}/api/expenses/${id}`, { method: 'DELETE' }).then(() => setExpenses(expenses.filter(e => e.id !== id)))
  const deleteIncome = id => fetch(`${import.meta.env.VITE_API_URL}/api/income/${id}`, { method: 'DELETE' }).then(() => setIncome(income.filter(i => i.id !== id)))
  const deleteAsset = id => fetch(`${import.meta.env.VITE_API_URL}/api/assets/${id}`, { method: 'DELETE' }).then(() => setAssets(assets.filter(a => a.id !== id)))
  const handleDelete = item => {
    if (item._type === 'expense') deleteExpense(item.id)
    else if (item._type === 'income') deleteIncome(item.id)
    else deleteAsset(item.id)
  }

  const startEdit = (item) => {
    setEditingItem(item)
    if (item._type === 'expense') {
      setModalTab('expense')
      setCategory(item.category)
      setAmount(String(item.amount))
      setDescription(item.description || '')
      setDate(item.date)
      setIsRecurring(item.is_recurring || false)
      setRecurringFrequency(item.recurring_frequency || 'monthly')
    } else if (item._type === 'income') {
      setModalTab('income')
      setIncomeSource(item.source)
      setIncomeAmount(String(item.amount))
      setIncomeDescription(item.description || '')
      setIncomeDate(item.date)
      setIncomeIsRecurring(item.is_recurring ||  false)
      setIncomeRecurringFrequency(item.recurring_frequency || 'monthly')
    } else {
      setModalTab('asset')
      setAssetName(item.name)
      setAssetType(item.type)
      setAssetValue(String(item.value))
    }
    setModalOpen(true)
  }

  const updateExpense = () => {
    if (!category || !amount || !date) return alert('Fill in required fields')
    fetch(`${import.meta.env.VITE_API_URL}/api/expenses/${editingItem.id}`, {
      method: 'PUT', header: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, amount: parseFloat(amount), description, date, is_recurring: isRecurring, recurring_frequency: recurringFrequency })
    }).then(r => r.json()).then(d => {
      setExpenses(expenses.map(e => e.id === d.id ? {...d, amount: parseFloat(d.amount) } : e))
      setEditingItem(null); setModalOpen(false); showSuccess('expense')
    }).catch(err => console.error(err))
  }

  const updateIncome = () => {
    if (!incomeSource || !incomeAmount || !incomeDate) return alert('Fill in required fields')
    fetch(`${import.meta.env.VITE_API_URL}/api/income/${editingItem.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: incomeSource, amount: parseFloat(incomeAmount), description: incomeDescription, date: incomeDate, is_recurring: incomeIsRecurring, recurring_frequency: incomeRecurringFrequency })
    }).then(r => r.json()).then(d => {
      setIncome(income.map(i => i.id === d.id ? { ...d, amount: parseFloat(d.amount) } : i))
      setEditingItem(null); setModalOpen(false); showSuccess('income')
    }).catch(err => console.error(err))
  }

  const updateAsset = () => {
    if (!assetName || !assetValue) return alert('Fill in required fields')
    fetch(`${import.meta.env.VITE_API_URL}/api/income/${editingItem.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ name: assetName, type: assetType, value: parseFloat(assetValue) })
    }).then(r => r.json()).then(d => {
      setAssets(assets.map(a => a.id === d.id ? { ...d, value: parseFloat(d.value) } : a))
      setEditingItem(null); setModalOpen(false); showSuccess('asset')
    }).catch(err => console.error(err))
  }

  const getChartData = () => {
    const days = 7
    const result = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const dateStr = d.toISOString().split('T')[0]
      const spent = expenses.filter(e => e.date === dateStr).reduce((s, e) => s + parseFloat(e.amount), 0)
      const earned = income.filter(i => i.date === dateStr).reduce((s, i) => s + parseFloat(i.amount), 0)
      result.push({ label, spent, earned })
    }
    return result
  }
  const chartData = getChartData()

  const inputCls = tw(
    'w-full px-4 py-3 rounded-xl border border-gray-200 text-black bg-white focus:border-gray-400 focus:outline-none text-sm',
    'w-full px-4 py-3 rounded-xl border border-gray-700 text-white bg-gray-800 focus:border-gray-500 focus:outline-none text-sm'
  )

  const solidColors = ['#ffffff', '#000000', '#0f172a', '#1e3a5f', '#14532d', '#3b0764', '#7f1d1d', '#431407']
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    'linear-gradient(135deg, #232526, #414345)',
  ]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const latestTransaction = recentActivity[0]
  const bannerMessages = [
    `${greeting}`,
    latestTransaction ? `Latest: ${latestTransaction._type === 'expense' ? '-' : '+'}$${parseFloat(latestTransaction._type === 'asset' ? latestTransaction.value : latestTransaction.amount).toFixed(2)} · ${latestTransaction._type === 'expense' ? latestTransaction.category : latestTransaction._type === 'income' ? latestTransaction.source : latestTransaction.name}` : `${greeting}`, 
    `This month: $${totalSpent.toFixed(2)} spent`,
    `Savings rate: ${savingsRate}%`,
  ]

  const openSettings = () => {
    setHamburgerFlipped(true)
    setSettingsOpen(true)
  }
  const closeSettings = () => {
    setHamburgerFlipped(false)
    setSettingsOpen(false)
  }

  return (
    <div className={tw('min-h-screen bg-gray-100', 'min-h-screen bg-gray-950')}>

      {/* ── Header ── */}
      <div className="px-6 pt-7 pb-6 border-b"
        style={{
          background: headerBg.type === 'photo' ? `url(${headerBg.value}) center/cover no-repeat` :
            headerBg.type === 'gradient' ? headerBg.value :
            headerBg.type === 'solid' && headerBg.value ? headerBg.value :
            darkMode ? '#111827' : '#ffffff',
          borderColor: darkMode ? '#1f2937' : '#e5e7eb'
        }}>
        <div className="flex justify-between items-center relative">
          <h1 style={{ color: headerDark ? '#fff' : darkMode ? '#fff' : '#000' }} className="text-3xl font-bold tracking-tight">Dashboard</h1>

          {/* Cycling banner */}
          <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none">
            <p style={{
              color: headerDark ? '#ffffffcc' : darkMode ? '#9ca3af' : '#6b7280',
              opacity: bannerVisible ? 1 : 0,
              transition: 'opacity 0.3s ease',
              fontSize: '12px',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}>
              {bannerMessages[bannerIndex]}
            </p>
          </div>

          {/* Hamburger */}
          <button
            onClick={settingsOpen ? closeSettings : openSettings}
            className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all duration-300`}
            style={{ transform: hamburgerFlipped ? 'rotate(90deg)' : 'rotate(0deg)' }}
          >
            <span style={{ background: headerDark || darkMode ? '#fff' : '#333' }} className="w-5 h-0.5 rounded-full transition-all" />
            <span style={{ background: headerDark || darkMode ? '#fff' : '#333' }} className="w-3.5 h-0.5 rounded-full transition-all" />
            <span style={{ background: headerDark || darkMode ? '#fff' : '#333' }} className="w-5 h-0.5 rounded-full transition-all" />
          </button>
        </div>
      </div>

      <div className="px-6 py-6 pb-28">

        {/* ── Time Period Tabs ── */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {['all', 'today', 'week', 'month', 'year'].map(p => (
            <button key={p} onClick={() => setTimePeriod(p)}
              className={tw(
                `px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${timePeriod === p ? 'bg-black text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`,
                `px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${timePeriod === p ? 'bg-white text-black' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'}`
              )}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: 'Total Spent', value: `$${totalSpent.toFixed(2)}`, sub: `${filteredExpenses.length} transactions`, color: tw('text-black', 'text-white'), key: 'spent' },
            { label: 'Total Income', value: `$${totalIncome.toFixed(2)}`, sub: `${filteredIncome.length} entries`, color: 'text-green-500', key: 'income' },
            { label: 'Savings Rate', value: `${savingsRate}%`, sub: 'of income saved', color: parseFloat(savingsRate) >= 0 ? 'text-blue-500' : 'text-red-500', key: 'savings' },
            { label: 'Total Assets', value: `$${totalAssets.toFixed(2)}`, sub: `${assets.length} assets`, color: 'text-purple-500', key: 'assets' },
          ].map((card, i) => (
            <div key={i} onClick={() => setCardModal(card.key)}
              className={tw('bg-white rounded-2xl p-4 shadow-sm', 'bg-gray-900 rounded-2xl p-4')}>
                <p className={tw('text-gray-400 text-xs font-medium mb-2', 'text-gray-500 text-xs font-medium mb-2')}>{card.label}</p>
                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                <p className={tw('text-gray-400 text-xs mt-1', 'text-gray-500 text-xs mt-1')}>{card.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Line Chart ── */}
        <div className={tw('bg-white rounded-2xl p-5 shadow-sm mb-6', 'bg-gray-900 rounded-2xl p-5 mb-6')}>
          <p className={tw('text-sm font-semibold text-black mb-4', 'text-sm font-semibold text-white mb-4')}>Last 7 Days</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1f2937' : '#f3f4f6'} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: darkMode ? '#6b7280' : '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: darkMode ? '#6b7280' : '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip
                formatter={(value, name) => [`$${value.toFixed(2)}`, name === 'spent' ? 'Spent' : 'Income']}
                contentStyle={{ background: darkMode ? '#111827' : '#fff', border: 'none', borderRadius: '12px', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="spent" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="earned" stroke="#22c55e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ── Spending by Category ── */}
        {Object.keys(byCategory).length > 0 && (
          <div className={tw('bg-white rounded-2xl p-5 shadow-sm mb-6', 'bg-gray-900 rounded-2xl p-5 mb-6')}>
            <p className={tw('text-sm font-semibold text-black mb-4', 'text-sm font-semibold text-white mb-4')}>Spending by Category</p>
            <div className="space-y-3">
              {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([name, value], i) => {
                const colors = ['#3b82f6','#ef4444','#22c55e','#f97316','#a855f7','#ec4899']
                const color = colors[i % colors.length]
                const pct = (value / totalSpent * 100).toFixed(0)
                return (
                  <div key={name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className={tw('text-xs font-medium text-gray-600', 'text-xs font-medium text-gray-400')}>{name}</span>
                      <div className="flex items-center gap-2">
                        <span className={tw('text-xs text-gray-400', 'text-xs text-gray-500')}>{pct}%</span>
                        <span className={tw('text-xs font-semibold text-black', 'text-xs font-semibold text-white')}>${parseFloat(value).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className={tw('w-full bg-gray-100 rounded-full h-2', 'w-full bg-gray-800 rounded-full h-2')}>
                      <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Recent Activity ── */}
        <div className={tw('bg-white rounded-2xl p-5 shadow-sm', 'bg-gray-900 rounded-2xl p-5')}>
          <p className={tw('text-sm font-semibold text-black mb-4', 'text-sm font-semibold text-white mb-4')}>Recent Activity</p>
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
                const tag = isExpense
                  ? { label: 'Expense', bg: tw('bg-red-50 text-red-500', 'bg-red-900/30 text-red-400') }
                  : isIncome
                  ? { label: 'Income', bg: tw('bg-green-50 text-green-600', 'bg-green-900/30 text-green-400') }
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
                      <button onClick={() => startEdit(item)}
                        className={tw('text-gray-300 hover:text-blue-500 transition', 'text-gray-600 hover:text-blue-400 transition')}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
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

      {/* ── Card Detail Modal ── */}
      {cardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setCardModal(null) }}>
          <div className={tw('bg-white rounded-3xl w-full max-w-md p-6', 'bg-gray-900 rounded-3xl w-full max-w-md p-6')}
            style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="flex justify-between items-center mb-5">
              <h2 className={tw('text-lg font-bold text-black', 'text-lg font-bold text-white')}>
                {cardModal === 'spent' ? 'Total Spent' : cardModal === 'income' ? 'Total Income' : cardModal === 'assets' ? 'Total Assets' : 'Savings Rate'}
              </h2>
              <button onClick={() => setCardModal(null)}
                className={tw('w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200', 'w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-700')}>✕</button>
            </div>

            {/* Spent breakdown */}
            {cardModal === 'spent' && (
              <div className="space-y-3">
                <p className={tw('text-3xl font-bold text-black mb-4', 'text-3xl font-bold text-white mb-4')}>${totalSpent.toFixed(2)}</p>
                {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([name, value], i) => {
                  const colors = ['#3b82f6','#ef4444','#22c55e','#f97316','#a855f7','#ec4899']
                  const pct = (value / totalSpent * 100).toFixed(0)
                  return (
                    <div key={name}>
                      <div className="flex justify-between mb-1">
                        <span className={tw('text-sm font-medium text-gray-700', 'text-sm font-medium text-gray-300')}>{name}</span>
                        <div className="flex gap-2">
                          <span className={tw('text-xs text-gray-400', 'text-xs text-gray-500')}>{pct}%</span>
                          <span className={tw('text-sm font-semibold text-black', 'text-sm font-semibold text-white')}>${parseFloat(value).toFixed(2)}</span>
                        </div>
                      </div>
                      <div className={tw('w-full bg-gray-100 rounded-full h-2', 'w-full bg-gray-800 rounded-full h-2')}>
                        <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: colors[i % colors.length] }} />
                      </div>
                    </div>
                  )
                })}
                {Object.keys(byCategory).length === 0 && <p className={tw('text-gray-400 text-sm text-center py-4', 'text-gray-500 text-sm text-center py-4')}>No expenses yet</p>}
              </div>
            )}

            {/* Income breakdown */}
            {cardModal === 'income' && (
              <div className="space-y-3">
                <p className={tw('text-3xl font-bold text-black mb-4', 'text-3xl font-bold text-white mb-4')}>${totalIncome.toFixed(2)}</p>
                {filteredIncome.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount)).map(i => (
                  <div key={i.id} className={tw('flex justify-between items-center p-3 rounded-xl bg-gray-50', 'flex justify-between items-center p-3 rounded-xl bg-gray-800')}>
                    <div>
                      <p className={tw('text-sm font-semibold text-black', 'text-sm font-semibold text-white')}>{i.source}</p>
                      <p className={tw('text-xs text-gray-400', 'text-xs text-gray-500')}>{i.date}</p>
                    </div>
                    <p className="text-sm font-bold text-green-500">+${parseFloat(i.amount).toFixed(2)}</p>
                  </div>
                ))}
                {filteredIncome.length === 0 && <p className={tw('text-gray-400 text-sm text-center py-4', 'text-gray-500 text-sm text-center py-4')}>No income yet</p>}
              </div>
            )}

            {/* Assets breakdown */}
            {cardModal === 'assets' && (
              <div className="space-y-3">
                <p className={tw('text-3xl font-bold text-black mb-4', 'text-3xl font-bold text-white mb-4')}>${totalAssets.toFixed(2)}</p>
                {[...assets].sort((a, b) => parseFloat(b.value) - parseFloat(a.value)).map(a => {
                  const pct = (parseFloat(a.value) / totalAssets * 100).toFixed(0)
                  return (
                    <div key={a.id} className={tw('p-3 rounded-xl bg-gray-50', 'p-3 rounded-xl bg-gray-800')}>
                      <div className="flex justify-between mb-1">
                        <div>
                          <p className={tw('text-sm font-semibold text-black', 'text-sm font-semibold text-white')}>{a.name}</p>
                          <p className={tw('text-xs text-gray-400', 'text-xs text-gray-500')}>{a.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-purple-500">${parseFloat(a.value).toFixed(2)}</p>
                          <p className={tw('text-xs text-gray-400', 'text-xs text-gray-500')}>{pct}%</p>
                        </div>
                      </div>
                      <div className={tw('w-full bg-gray-100 rounded-full h-1.5 mt-2', 'w-full bg-gray-700 rounded-full h-1.5 mt-2')}>
                        <div className="h-1.5 rounded-full bg-purple-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
                {assets.length === 0 && <p className={tw('text-gray-400 text-sm text-center py-4', 'text-gray-500 text-sm text-center py-4')}>No assets yet</p>}
              </div>
            )}

            {/* Savings breakdown */}
            {cardModal === 'savings' && (
              <div>
                <p className={`text-3xl font-bold mb-4 ${parseFloat(savingsRate) >= 0 ? 'text-blue-500' : 'text-red-500'}`}>{savingsRate}%</p>
                <div className="space-y-3">
                  {[
                    { label: 'Total Income', value: `$${totalIncome.toFixed(2)}`, color: 'text-green-500' },
                    { label: 'Total Spent', value: `$${totalSpent.toFixed(2)}`, color: 'text-red-500' },
                    { label: 'Saved', value: `$${(totalIncome - totalSpent).toFixed(2)}`, color: parseFloat(totalIncome - totalSpent) >= 0 ? 'text-blue-500' : 'text-red-500' },
                  ].map(row => (
                    <div key={row.label} className={tw('flex justify-between items-center p-3 rounded-xl bg-gray-50', 'flex justify-between items-center p-3 rounded-xl bg-gray-800')}>
                      <p className={tw('text-sm font-medium text-gray-600', 'text-sm font-medium text-gray-400')}>{row.label}</p>
                      <p className={`text-sm font-bold ${row.color}`}>{row.value}</p>
                    </div>
                  ))}
                </div>
                <div className={tw('mt-4 w-full bg-gray-100 rounded-full h-3', 'mt-4 w-full bg-gray-800 rounded-full h-3')}>
                  <div className="h-3 rounded-full bg-blue-500 transition-all" style={{ width: `${Math.min(Math.max(parseFloat(savingsRate), 0), 100)}%` }} />
                </div>
                <p className={tw('text-xs text-gray-400 mt-2 text-center', 'text-xs text-gray-500 mt-2 text-center')}>{savingsRate}% of income saved</p>
              </div>
            )}
          </div>
        </div>
      )}


      {/* ── Toast ── */}
      {success && (
        <div className={tw(
          'fixed bottom-28 left-1/2 -translate-x-1/2 bg-black text-white px-5 py-3 rounded-2xl text-sm font-medium flex items-center gap-2 z-50',
          'fixed bottom-28 left-1/2 -translate-x-1/2 bg-white text-black px-5 py-3 rounded-2xl text-sm font-medium flex items-center gap-2 z-50'
        )}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {success === 'expense' ? 'Expense added' : success === 'income' ? 'Income added' : 'Asset added'}
        </div>
      )}

      {/* ── Floating + Button ── */}
      <button onClick={() => setModalOpen(true)}
        className={tw(
          'fixed bottom-8 right-6 w-16 h-16 bg-black text-white rounded-2xl shadow-xl flex items-center justify-center transition-all duration-200 active:scale-95 hover:scale-105 z-40',
          'fixed bottom-8 right-6 w-16 h-16 bg-white text-black rounded-2xl shadow-xl flex items-center justify-center transition-all duration-200 active:scale-95 hover:scale-105 z-40'
        )}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="10" y1="3" x2="10" y2="17"/>
          <line x1="3" y1="10" x2="17" y2="10"/>
        </svg>
      </button>

      {/* ── Add Modal (centered) ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}>
          <div className={tw('bg-white rounded-3xl w-full max-w-md p-6', 'bg-gray-900 rounded-3xl w-full max-w-md p-6')}
            style={{ maxHeight: '85vh', overflowY: 'auto' }}>
            <div className="flex justify-between items-center mb-5">
              <h2 className={tw('text-lg font-bold text-black', 'text-lg font-bold text-white')}>Add New</h2>
              <button onClick={() => { setModalOpen(false); setEditingItem(null) }}
                className={tw('w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200', 'w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-700')}>✕</button>
            </div>

            <div className={tw('flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl', 'flex gap-1 mb-5 bg-gray-800 p1 rounded-xl')}>
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

            {modalTab === 'expense' && (
              <div className="flex flex-col gap-3">
                <div>
                  <p className={tw('text-xs text-gray-400 mb-2', 'text-xs text-gray-500 mb-2')}>Category</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: 'Food', emoji: '🍔' }, { value: 'Rent', emoji: '🏠' },
                      { value: 'Utilities', emoji: '💡' }, { value: 'Transport', emoji: '🚗' },
                      { value: 'Entertainment', emoji: '🎬' }, { value: 'Health', emoji: '💊' },
                      { value: 'Shopping', emoji: '🛍️' }, { value: 'Other', emoji: '📌' },
                    ].map(c => (
                      <button key={c.value} onClick={() => setCategory(c.value)}
                        className={tw(
                          `flex flex-col items-center gap-1 p-2 rounded-xl border transition text-xs font-medium ${category === c.value ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`,
                          `flex flex-col items-center gap-1 p-2 rounded-xl border transition text-xs font-medium ${category === c.value ? 'border-white bg-white text-black' : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'}`
                        )}>
                        <span className="text-xl">{c.emoji}</span>
                        <span>{c.value}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className={tw('flex items-center border border-gray-200 rounded-xl bg-white', 'flex items-center border border-gray-700 rounded-xl bg-gray-800')}>
                  <span className={tw('pl-4 text-gray-400 text-sm', 'pl-4 text-gray-500 text-sm')}>$</span>
                  <input className={tw('flex-1 px-2 py-3 text-black bg-transparent focus:outline-none text-sm', 'flex-1 px-2 py-3 text-white bg-transparent focus:outline-none text-sm')} placeholder="0.00" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
                </div>
                <input className={inputCls} placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} />
                <input className={inputCls} type="date" value={date} onChange={e => setDate(e.target.value)} />
                <label className={tw('flex items-center gap-3 p-3 rounded-xl bg-gray-50', 'flex items-center gap-3 p-3 rounded-xl bg-gray-800')}>
                  <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="w-4 h-4" />
                  <span className={tw('text-black text-sm', 'text-white text-sm')}>Recurring?</span>
                </label>
                {isRecurring && (
                  <select className={inputCls} value={recurringFrequency} onChange={e => setRecurringFrequency(e.target.value)}>
                    <option>weekly</option><option>monthly</option><option>yearly</option>
                  </select>
                )}
                <button className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition mt-1"
                  onClick={() => editingItem ? updateExpense() : addExpense()}>
                  {editingItem ? 'Save Changes' : 'Add Expense'}
                </button>
              </div>
            )}

            {modalTab === 'income' && (
              <div className="flex flex-col gap-3">
                <input className={inputCls} placeholder="Source (e.g. Salary, Freelance)" value={incomeSource} onChange={e => setIncomeSource(e.target.value)} />
                <div className={tw('flex items-center border border-gray-200 rounded-xl bg-white', 'flex items-center border border-gray-700 rounded-xl bg-gray-800')}>
                  <span className={tw('pl-4 text-gray-400 text-sm', 'pl-4 text-gray-500 text-sm')}>$</span>
                  <input className={tw('flex-1 px-2 py-3 text-black bg-transparent focus:outline-none text-sm', 'flex-1 px-2 py-3 text-white bg-transparent focus:outline-none text-sm')} placeholder="0.00" type="number" value={incomeAmount} onChange={e => setIncomeAmount(e.target.value)} />
                </div>
                <input className={inputCls} placeholder="Description (optional)" value={incomeDescription} onChange={e => setIncomeDescription(e.target.value)} />
                <input className={inputCls} type="date" value={incomeDate} onChange={e => setIncomeDate(e.target.value)} />
                <label className={tw('flex items-center gap-3 p-3 rounded-xl bg-gray-50', 'flex items-center gap-3 p-3 rounded-xl bg-gray-800')}>
                  <input type="checkbox" checked={incomeIsRecurring} onChange={e => setIncomeIsRecurring(e.target.checked)} className="w-4 h-4" />
                  <span className={tw('text-black text-sm', 'text-white text-sm')}>Recurring?</span>
                </label>
                {incomeIsRecurring && (
                  <select className={inputCls} value={incomeRecurringFrequency} onChange={e => setIncomeRecurringFrequency(e.target.value)}>
                    <option>weekly</option><option>monthly</option><option>yearly</option>
                  </select>
                )}
                <button className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition mt-1"
                  onClick={() => editingItem ? updateIncome() : addIncome()}>
                  {editingItem ? 'Save Changes' : 'Add Income'}
                </button>
              </div>
            )}

            {modalTab === 'asset' && (
              <div className="flex flex-col gap-3">
                <input className={inputCls} placeholder="Asset name" value={assetName} onChange={e => setAssetName(e.target.value)} />
                <select className={inputCls} value={assetType} onChange={e => setAssetType(e.target.value)}>
                  <option>Cash</option><option>Stocks</option><option>Crypto</option>
                  <option>Precious Metals</option><option>Real Estate</option><option>Other</option>
                </select>
                <div className={tw('flex items-center border border-gray-200 rounded-xl bg-white', 'flex items-center border border-gray-700 rounded-xl bg-gray-800')}>
                  <span className={tw('pl-4 text-gray-400 text-sm', 'pl-4 text-gray-500 text-sm')}>$</span>
                  <input className={tw('flex-1 px-2 py-3 text-black bg-transparent focus:outline-none text-sm', 'flex-1 px-2 py-3 text-white bg-transparent focus:outline-none text-sm')} placeholder="0.00" type="number" value={assetValue} onChange={e => setAssetValue(e.target.value)} />
                </div>
                <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl font-semibold transition mt-1"
                  onClick={() => editingItem ? updateAsset() : addAsset()}>
                  {editingItem ? 'Save Changes' : 'Add Asset'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Settings Panel ── */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) closeSettings() }}>
          <div className={tw('bg-white rounded-3xl w-full max-w-2xl p-6 pb-10', 'bg-gray-900 rounded-3xl w-full max-w-2xl p-6 pb-10')}
            style={{ maxHeight: '85vh', overflowY: 'auto' }}>

            <div className="flex justify-between items-center mb-6">
              <h2 className={tw('text-lg font-bold text-black', 'text-lg font-bold text-white')}>Settings</h2>
              <button onClick={closeSettings}
                className={tw('w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200', 'w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-700')}>✕</button>
            </div>

            {/* Net Worth */}
            <div className={tw('bg-gray-50 rounded-2xl p-4 mb-6', 'bg-gray-800 rounded-2xl p-4 mb-6')}>
              <p className={tw('text-xs text-gray-400 mb-1', 'text-xs text-gray-500 mb-1')}>Net Worth</p>
              <p className={tw('text-3xl font-bold text-black', 'text-3xl font-bold text-white')}>${netWorth.toFixed(2)}</p>
              <div className="flex gap-4 mt-3">
                <div>
                  <p className="text-xs text-green-500 font-medium">Income</p>
                  <p className={tw('text-sm font-semibold text-black', 'text-sm font-semibold text-white')}>${totalIncome.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-red-500 font-medium">Spent</p>
                  <p className={tw('text-sm font-semibold text-black', 'text-sm font-semibold text-white')}>${totalSpent.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-500 font-medium">Assets</p>
                  <p className={tw('text-sm font-semibold text-black', 'text-sm font-semibold text-white')}>${totalAssets.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Dark Mode */}
            <div className={tw('flex items-center justify-between p-4 rounded-2xl bg-gray-50 mb-6', 'flex items-center justify-between p-4 rounded-2xl bg-gray-800 mb-6')}>
              <p className={tw('text-sm font-semibold text-black', 'text-sm font-semibold text-white')}>Dark Mode</p>
              <button onClick={() => setDarkMode(!darkMode)}
                className={`relative w-14 h-7 rounded-full transition-colors duration-300 flex items-center ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <span className={`absolute left-1 w-5 h-5 rounded-full transition-transform duration-300 flex items-center justify-center ${darkMode ? 'translate-x-7 bg-gray-900' : 'bg-white'}`}>
                  {darkMode ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="5"/>
                      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                    </svg>
                  )}
                </span>
              </button>
            </div>

            {/* Header Colors */}
            <p className={tw('text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide', 'text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide')}>Header Color</p>
            <div className="flex gap-2 mb-6 flex-wrap">
              {solidColors.map(color => (
                <button key={color} onClick={() => setHeaderBg({ type: 'solid', value: color })}
                  style={{ background: color, border: color === '#ffffff' ? '1px solid #e5e7eb' : 'none' }}
                  className={`w-10 h-10 rounded-xl border-2 transition-transform ${headerBg.value === color ? 'ring-2 ring-blue-500 scale-110' : ''}`} />
              ))}
            </div>

            <p className={tw('text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide', 'text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide')}>Gradients</p>
            <div className="flex gap-2 mb-6 flex-wrap">
              {gradients.map((g, i) => (
                <button key={i} onClick={() => setHeaderBg({ type: 'gradient', value: g })}
                  style={{ background: g }}
                  className={`w-10 h-10 rounded-xl transition-transform ${headerBg.value === g ? 'ring-2 ring-blue-500 scale-110' : ''}`} />
              ))}
            </div>

            <p className={tw('text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide', 'text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide')}>Custom Photo</p>
            <label className={tw('flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-gray-300 transition', 'flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-gray-700 cursor-pointer hover:border-gray-500 transition')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={darkMode ? '#9ca3af' : '#6b7280'} strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <span className={tw('text-sm text-gray-500', 'text-sm text-gray-400')}>
                {headerBg.type === 'photo' ? '✓ Photo set — click to change' : 'Upload a photo'}
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={e => {
                const file = e.target.files[0]; if (!file) return
                const reader = new FileReader()
                reader.onload = ev => setHeaderBg({ type: 'photo', value: ev.target.result })
                reader.readAsDataURL(file)
              }} />
            </label>

            <button onClick={() => setHeaderBg({ type: 'solid', value: '' })}
              className={tw('mt-4 text-xs text-gray-400 hover:text-gray-600 underline block', 'mt-4 text-xs text-gray-500 hover:text-gray-300 underline block')}>
              Reset to default
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
