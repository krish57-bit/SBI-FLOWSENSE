import { useState, useEffect, useRef } from 'react'
import './index.css'

const API_BASE = 'http://localhost:8001'

// ─── SVG Icons ───
const I = {
  overview: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  transactions: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  journeys: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>,
  agents: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>,
  settings: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  bell: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  trendUp: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  trendDown: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>,
  send: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  zap: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  logout: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  chevron: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  close: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  lock: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  user: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  shield: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  eye: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  wallet: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/></svg>,
  arrowUp: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>,
  arrowDown: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>,
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount)
}

function timeAgo(timestamp) {
  if (!timestamp) return ''
  const diffMin = Math.floor((Date.now() - new Date(timestamp)) / 60000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  return `${Math.floor(diffHr / 24)}d ago`
}

function formatDate() {
  return new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

// ─── Login Screen ───
function LoginScreen({ onLogin }) {
  const [step, setStep] = useState('welcome') // welcome, account, mpin
  const [accountNo, setAccountNo] = useState('')
  const [mpin, setMpin] = useState(['', '', '', '', '', ''])
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const pinRefs = useRef([])

  function handleAccountSubmit(e) {
    e.preventDefault()
    if (accountNo.length < 8) {
      setError('Please enter a valid account number')
      return
    }
    setError('')
    setStep('mpin')
    setTimeout(() => pinRefs.current[0]?.focus(), 100)
  }

  function handlePinChange(index, value) {
    if (!/^\d*$/.test(value)) return
    const newPin = [...mpin]
    newPin[index] = value.slice(-1)
    setMpin(newPin)

    if (value && index < 5) {
      pinRefs.current[index + 1]?.focus()
    }
  }

  function handlePinKeyDown(index, e) {
    if (e.key === 'Backspace' && !mpin[index] && index > 0) {
      pinRefs.current[index - 1]?.focus()
    }
  }

  function handlePinSubmit(e) {
    e.preventDefault()
    const pin = mpin.join('')
    if (pin.length < 6) {
      setError('Please enter your 6-digit MPIN')
      return
    }
    setError('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onLogin({ name: 'Rahul Kumar', customerId: 'cust_123', accountNo })
    }, 1200)
  }

  if (step === 'welcome') {
    return (
      <div className="login">
        <div className="login__bg" />
        <div className="login__card login__card--welcome">
          <div className="login__logo-row">
            <img src="/logo.svg" alt="SBI Sense" className="login__brand-img" />
          </div>
          <div className="login__shield">{I.shield}</div>
          <h1 className="login__title">Welcome to SBI Sense</h1>
          <p className="login__subtitle">Your AI-powered banking intelligence platform. Secure, smart, and personalized.</p>
          <button className="login__cta" onClick={() => setStep('account')}>
            Sign In to Your Account
          </button>
          <div className="login__footer">
            <span className="login__secure">{I.lock} 256-bit encrypted</span>
            <span className="login__powered">Powered by SBI</span>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'account') {
    return (
      <div className="login">
        <div className="login__bg" />
        <div className="login__card">
          <button className="login__back" onClick={() => setStep('welcome')}>&larr; Back</button>
          <div className="login__logo-row login__logo-row--sm">
            <img src="/logo-icon.svg" alt="SBI Sense" className="login__icon-img" />
          </div>
          <h2 className="login__heading">Enter Your Account Number</h2>
          <p className="login__desc">Please enter your SBI account number or customer ID to continue</p>
          <form onSubmit={handleAccountSubmit}>
            <div className="login__field">
              <label className="login__label">Account Number / Customer ID</label>
              <div className="login__input-wrap">
                {I.user}
                <input
                  type="text"
                  className="login__input"
                  placeholder="e.g., 20012345678 or cust_123"
                  value={accountNo}
                  onChange={e => setAccountNo(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            {error && <div className="login__error">{error}</div>}
            <button type="submit" className="login__submit">
              Continue {I.chevron}
            </button>
          </form>
          <div className="login__help">Demo: Use any number (8+ digits) or type "cust_123"</div>
        </div>
      </div>
    )
  }

  return (
    <div className="login">
      <div className="login__bg" />
      <div className="login__card">
        <button className="login__back" onClick={() => { setStep('account'); setMpin(['','','','','','']); setError('') }}>&larr; Back</button>
        <div className="login__logo-row login__logo-row--sm">
          <img src="/logo-icon.svg" alt="SBI Sense" className="login__icon-img" />
        </div>
        <h2 className="login__heading">Enter Your MPIN</h2>
        <p className="login__desc">Enter your 6-digit MPIN to securely access your account</p>
        <form onSubmit={handlePinSubmit}>
          <div className="mpin-row">
            {mpin.map((digit, i) => (
              <input
                key={i}
                ref={el => pinRefs.current[i] = el}
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={1}
                className="mpin-input"
                value={digit}
                onChange={e => handlePinChange(i, e.target.value)}
                onKeyDown={e => handlePinKeyDown(i, e)}
              />
            ))}
          </div>
          <button type="button" className="login__toggle-pin" onClick={() => setShowPin(!showPin)}>
            {showPin ? I.eyeOff : I.eye}
            {showPin ? 'Hide MPIN' : 'Show MPIN'}
          </button>
          {error && <div className="login__error">{error}</div>}
          <button type="submit" className="login__submit" disabled={loading}>
            {loading ? (
              <span className="login__spinner" />
            ) : (
              <>Verify & Sign In {I.lock}</>
            )}
          </button>
        </form>
        <div className="login__help">Demo: Enter any 6 digits to continue</div>
      </div>
    </div>
  )
}

// ─── Notification Panel ───
function NotificationPanel({ actions, journeys, onClose, onNavigate }) {
  const notifications = []

  actions.forEach(a => {
    notifications.push({
      id: `action-${a.id}`,
      type: 'agent',
      title: a.title,
      message: a.message?.substring(0, 80) + (a.message?.length > 80 ? '...' : ''),
      time: a.timestamp,
      read: false,
      tab: 'agents',
    })
  })

  journeys.forEach(j => {
    const done = j.steps.filter(s => s.status === 'COMPLETED').length
    const total = j.steps.length
    notifications.push({
      id: `journey-${j.journey_id}`,
      type: 'journey',
      title: j.name,
      message: `${done}/${total} steps completed`,
      time: j.updated_at || j.created_at,
      read: false,
      tab: 'journeys',
    })
  })

  notifications.sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0))

  return (
    <>
      <div className="notif-overlay" onClick={onClose} />
      <div className="notif-panel">
        <div className="notif-panel__header">
          <h3 className="notif-panel__title">Notifications</h3>
          <span className="notif-panel__count">{notifications.length}</span>
          <button className="notif-panel__close" onClick={onClose}>{I.close}</button>
        </div>
        <div className="notif-panel__body">
          {notifications.length === 0 ? (
            <div className="notif-panel__empty">
              <div style={{ opacity: 0.3, marginBottom: 12 }}>{I.bell}</div>
              <div>No notifications yet</div>
              <div className="notif-panel__empty-sub">Simulate events to trigger agent alerts</div>
            </div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`notif-item notif-item--${n.type}`} onClick={() => { onNavigate(n.tab); onClose() }}>
                <div className={`notif-item__icon notif-item__icon--${n.type}`}>
                  {n.type === 'agent' ? I.agents : I.journeys}
                </div>
                <div className="notif-item__body">
                  <div className="notif-item__title">{n.title}</div>
                  <div className="notif-item__msg">{n.message}</div>
                  <div className="notif-item__time">{timeAgo(n.time)}</div>
                </div>
                <div className="notif-item__dot" />
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}

// ─── Sidebar ───
function Sidebar({ activeTab, onTabChange, user, onLogout }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: I.overview },
    { id: 'transactions', label: 'Transactions', icon: I.transactions },
    { id: 'journeys', label: 'Journeys', icon: I.journeys },
    { id: 'agents', label: 'AI Agents', icon: I.agents },
    { id: 'settings', label: 'Settings', icon: I.settings },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <img src="/logo-icon.svg" alt="SBI Sense" className="sidebar__logo-img" />
        <span className="sidebar__brand-text">SBI Sense</span>
      </div>

      <nav className="sidebar__nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`sidebar__item ${activeTab === item.id ? 'sidebar__item--active' : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            <span className="sidebar__item-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar__bottom">
        <button className="sidebar__item sidebar__item--logout" onClick={onLogout}>
          <span className="sidebar__item-icon">{I.logout}</span>
          Logout
        </button>
        <div className="sidebar__user">
          <div className="sidebar__avatar">{user.name.split(' ').map(n => n[0]).join('')}</div>
          <div className="sidebar__user-info">
            <div className="sidebar__user-name">{user.name}</div>
            <div className="sidebar__user-role">SBI Customer</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

// ─── Transaction Row ───
function TransactionRow({ event }) {
  const isCredit = event.type === 'CREDIT'
  return (
    <div className="txn-row">
      <div className={`txn-row__icon txn-row__icon--${isCredit ? 'credit' : 'debit'}`}>
        {isCredit ? I.arrowDown : I.arrowUp}
      </div>
      <div className="txn-row__info">
        <div className="txn-row__merchant">{event.merchant || event.type}</div>
        <div className="txn-row__meta">
          {event.city && <span>{event.city}</span>}
          <span>{timeAgo(event.timestamp)}</span>
        </div>
      </div>
      <div className={`txn-row__amount txn-row__amount--${isCredit ? 'credit' : 'debit'}`}>
        {isCredit ? '+' : '-'}{formatCurrency(event.amount)}
      </div>
    </div>
  )
}

// ─── Intervention Card ───
function InterventionCard({ action, onConsent, consentState }) {
  const agentName = action.life_event === 'FIRST_SALARY' ? 'Acquisition Agent'
    : action.life_event === 'RELOCATION' ? 'Lifestyle Agent'
    : action.life_event === 'PAYMENT_STRESS' ? 'Engagement Agent'
    : 'FlowSense Agent'

  const agentEmoji = action.life_event === 'FIRST_SALARY' ? '💰'
    : action.life_event === 'RELOCATION' ? '🏠'
    : action.life_event === 'PAYMENT_STRESS' ? '🛡️'
    : '🤖'

  const state = consentState[action.id]
  const isPending = state === 'pending'
  const isApproved = state === 'APPROVED'
  const isRejected = state === 'REJECTED'
  const isDone = isApproved || isRejected

  return (
    <div className={`agent-card ${isDone ? 'agent-card--resolved' : ''}`}>
      <div className="agent-card__top">
        <div className="agent-card__tag-row">
          <span className="agent-card__emoji">{agentEmoji}</span>
          <span className="agent-card__tag">{agentName}</span>
        </div>
        {isDone && <span className={`agent-card__badge agent-card__badge--${isApproved ? 'approved' : 'rejected'}`}>{isApproved ? 'Executed' : 'Dismissed'}</span>}
        {!isDone && <span className="agent-card__badge agent-card__badge--new">New</span>}
      </div>
      <div className="agent-card__title">{action.title}</div>
      <div className="agent-card__msg">{action.message}</div>
      {action.confidence && (
        <div className="agent-card__confidence">
          <span className="agent-card__conf-label">AI Confidence</span>
          <div className="agent-card__conf-bar"><div className="agent-card__conf-fill" style={{ width: `${Math.round(action.confidence * 100)}%` }} /></div>
          <span className="agent-card__conf-val">{Math.round(action.confidence * 100)}%</span>
        </div>
      )}
      {!isDone && (
        <div className="agent-card__actions">
          <button className="btn btn--primary" disabled={isPending} onClick={() => onConsent(action, 'APPROVED')}>
            {isPending ? <span className="login__spinner" /> : (action.action_label || 'Take Action')}
          </button>
          <button className="btn btn--outline" disabled={isPending} onClick={() => onConsent(action, 'REJECTED')}>Dismiss</button>
        </div>
      )}
    </div>
  )
}

// ─── Journey Card ───
function JourneyCard({ journey }) {
  const done = journey.steps.filter(s => s.status === 'COMPLETED').length
  const total = journey.steps.length
  const pct = Math.round((done / total) * 100)
  const isComplete = journey.status === 'COMPLETED'

  return (
    <div className={`journey-card ${isComplete ? 'journey-card--done' : ''}`}>
      <div className="journey-card__head">
        <div>
          <span className="agent-card__tag">{journey.agent}</span>
          <div className="journey-card__name">{journey.name}</div>
        </div>
        <span className={`journey-card__status journey-card__status--${isComplete ? 'done' : 'active'}`}>{isComplete ? 'Completed' : 'Active'}</span>
      </div>
      <div className="journey-card__bar"><div className="journey-card__fill" style={{ width: `${pct}%` }} /></div>
      <div className="journey-card__pct">{done}/{total} steps &middot; {pct}%</div>
      <div className="journey-card__steps">
        {journey.steps.map((step, i) => (
          <div key={step.step_id} className={`j-step j-step--${step.status.toLowerCase()}`}>
            <div className="j-step__dot">{step.status === 'COMPLETED' ? I.check : i + 1}</div>
            <div><div className="j-step__label">{step.label}</div><div className="j-step__desc">{step.description}</div></div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Quick Actions (Demo Panel) ───
function QuickActions({ onSendEvent, collapsed, onToggle }) {
  return (
    <div className={`demo-panel ${collapsed ? 'demo-panel--collapsed' : ''}`}>
      <button className="demo-panel__toggle" onClick={onToggle}>
        <span className="demo-panel__toggle-label">
          {I.zap} Demo Controls
        </span>
        <span className={`demo-panel__arrow ${collapsed ? '' : 'demo-panel__arrow--up'}`}>{I.chevron}</span>
      </button>
      {!collapsed && (
        <div className="demo-panel__body">
          <p className="demo-panel__hint">Simulate real banking events to see AI agents in action</p>
          <div className="demo-panel__grid">
            <button className="demo-btn demo-btn--salary" onClick={() => onSendEvent('CREDIT', 75000, 'Employer Corp', 'Mumbai')}>
              <span className="demo-btn__emoji">💰</span>
              <span className="demo-btn__text">
                <span className="demo-btn__label">Salary Credit</span>
                <span className="demo-btn__sub">+₹75,000 from Employer</span>
              </span>
            </button>
            <button className="demo-btn demo-btn--rent" onClick={() => onSendEvent('DEBIT', 18000, 'RENT - Housing', 'Bangalore')}>
              <span className="demo-btn__emoji">🏠</span>
              <span className="demo-btn__text">
                <span className="demo-btn__label">Rent Payment</span>
                <span className="demo-btn__sub">₹18,000 to new city</span>
              </span>
            </button>
            <button className="demo-btn demo-btn--stress" onClick={() => onSendEvent('DEBIT', 1500, 'Credit Card Minimum Due', 'Mumbai')}>
              <span className="demo-btn__emoji">💳</span>
              <span className="demo-btn__text">
                <span className="demo-btn__label">Card Payment</span>
                <span className="demo-btn__sub">₹1,500 minimum due</span>
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main App ───
function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [actions, setActions] = useState([])
  const [events, setEvents] = useState([])
  const [stats, setStats] = useState({ balance: 0, total_events: 0, total_credits: 0, total_debits: 0, active_agents: 3 })
  const [connected, setConnected] = useState(false)
  const [consentState, setConsentState] = useState({})
  const [journeys, setJourneys] = useState([])
  const [toast, setToast] = useState(null)
  const [showNotif, setShowNotif] = useState(false)
  const [demoCollapsed, setDemoCollapsed] = useState(true)
  const eventSourceRef = useRef(null)

  function handleLogin(userData) {
    setUser(userData)
    setLoggedIn(true)
  }

  function handleLogout() {
    if (eventSourceRef.current) eventSourceRef.current.close()
    setLoggedIn(false)
    setUser(null)
    setActiveTab('overview')
    setActions([])
    setEvents([])
    setStats({ balance: 0, total_events: 0, total_credits: 0, total_debits: 0, active_agents: 3 })
    setConnected(false)
    setConsentState({})
    setJourneys([])
  }

  useEffect(() => {
    if (!loggedIn) return
    async function fetchInitial() {
      try {
        const [eventsRes, statsRes, journeysRes, actionsRes] = await Promise.all([
          fetch(`${API_BASE}/api/events/recent`).then(r => r.json()),
          fetch(`${API_BASE}/api/stats`).then(r => r.json()),
          fetch(`${API_BASE}/api/journeys/cust_123`).then(r => r.json()).catch(() => ({ journeys: [] })),
          fetch(`${API_BASE}/api/agent-actions/cust_123`).then(r => r.json()).catch(() => ({ actions: [] })),
        ])
        if (eventsRes.events) setEvents(eventsRes.events)
        if (statsRes.balance !== undefined) setStats(statsRes)
        if (journeysRes.journeys) setJourneys(journeysRes.journeys)
        if (actionsRes.actions) {
          setActions(actionsRes.actions)
          const cs = {}
          actionsRes.actions.forEach(a => { if (a.consented) cs[a.id] = 'approved' })
          setConsentState(prev => ({ ...prev, ...cs }))
        }
      } catch (e) {
        console.warn('Could not fetch initial data:', e)
      }
    }
    fetchInitial()
  }, [loggedIn])

  useEffect(() => {
    if (!loggedIn) return
    const es = new EventSource(`${API_BASE}/stream`)
    eventSourceRef.current = es
    es.onopen = () => setConnected(true)
    es.onmessage = (event) => {
      try {
        const action = JSON.parse(event.data)
        if (action.type !== 'CONSENT_RESULT') setActions(prev => [action, ...prev])
        fetch(`${API_BASE}/api/stats`).then(r => r.json()).then(s => { if (s.balance !== undefined) setStats(s) }).catch(() => {})
        fetch(`${API_BASE}/api/journeys/cust_123`).then(r => r.json()).then(j => { if (j.journeys) setJourneys(j.journeys) }).catch(() => {})
      } catch (e) { console.error('SSE parse error', e) }
    }
    es.onerror = () => { setConnected(false); es.close() }
    return () => es.close()
  }, [loggedIn])

  async function sendEvent(type, amount, merchant, city) {
    try {
      const res = await fetch(`${API_BASE}/events`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: 'cust_123', event_type: type, amount, merchant, city }),
      })
      const data = await res.json()
      if (data.data) setEvents(prev => [data.data, ...prev])
      const statsRes = await fetch(`${API_BASE}/api/stats`).then(r => r.json())
      if (statsRes.balance !== undefined) setStats(statsRes)
      setToast({ message: `${type === 'CREDIT' ? 'Credit' : 'Debit'} of ${formatCurrency(amount)} processed`, type: 'success' })
      setTimeout(() => setToast(null), 3000)
    } catch (e) { console.error('Send event error:', e) }
  }

  async function handleConsent(action, decision) {
    setConsentState(prev => ({ ...prev, [action.id]: 'pending' }))
    try {
      const res = await fetch(`${API_BASE}/api/consents`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: action.customer_id || 'cust_123', action_id: action.id, proposed_action: action.suggested_action, decision }),
      })
      const data = await res.json()
      setConsentState(prev => ({ ...prev, [action.id]: decision }))
      if (decision === 'APPROVED' && data.execution_result) setToast({ message: data.execution_result.message, type: 'success' })
      else if (decision === 'REJECTED') setToast({ message: 'Action dismissed', type: 'info' })
      setTimeout(() => setToast(null), 4000)
      const [statsRes, journeysRes] = await Promise.all([
        fetch(`${API_BASE}/api/stats`).then(r => r.json()),
        fetch(`${API_BASE}/api/journeys/cust_123`).then(r => r.json()).catch(() => ({ journeys: [] })),
      ])
      if (statsRes.balance !== undefined) setStats(statsRes)
      if (journeysRes.journeys) setJourneys(journeysRes.journeys)
    } catch (e) {
      console.error('Consent error:', e)
      setConsentState(prev => ({ ...prev, [action.id]: undefined }))
      setToast({ message: 'Failed to process', type: 'error' })
      setTimeout(() => setToast(null), 4000)
    }
  }

  if (!loggedIn) return <LoginScreen onLogin={handleLogin} />

  const pendingActions = actions.filter(a => !consentState[a.id] || consentState[a.id] === 'pending')
  const notifCount = actions.length + journeys.length

  return (
    <div className="layout">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} user={user} onLogout={handleLogout} />

      <div className="main">
        <header className="header">
          <div className="header__left">
            <h1 className="header__greeting">Welcome back, {user.name.split(' ')[0]}</h1>
            <span className="header__date">{formatDate()}</span>
          </div>
          <div className="header__right">
            <div className={`header__status ${connected ? 'header__status--on' : ''}`}>
              <span className="header__status-dot" />
              {connected ? 'Live' : 'Offline'}
            </div>
            <button className="header__icon-btn" onClick={() => setShowNotif(!showNotif)}>
              {I.bell}
              {notifCount > 0 && <span className="header__notif-badge">{notifCount > 9 ? '9+' : notifCount}</span>}
            </button>
            <div className="header__search">
              {I.search}
              <input type="text" placeholder="Search transactions..." className="header__search-input" />
            </div>
          </div>
        </header>

        {showNotif && <NotificationPanel actions={actions} journeys={journeys} onClose={() => setShowNotif(false)} onNavigate={setActiveTab} />}

        {toast && (
          <div className={`toast toast--${toast.type}`}>
            {toast.type === 'success' && <span className="toast__icon">{I.check}</span>}
            {toast.message}
          </div>
        )}

        <div className="content">

          {/* ─── Overview Tab ─── */}
          {activeTab === 'overview' && (
            <>
              {/* Balance + Stats Row */}
              <div className="overview-top">
                <div className="card card--balance">
                  <div className="balance__header">
                    <div>
                      <div className="balance__label">Total Balance</div>
                      <div className="balance__value">{formatCurrency(stats.balance)}</div>
                    </div>
                    <div className="balance__trend balance__trend--up">{I.trendUp} +2.4%</div>
                  </div>
                  <div className="balance__card">
                    <div className="balance__card-inner">
                      <div className="balance__card-label">Savings Account</div>
                      <div className="balance__card-num">XXXX XXXX XXXX 4521</div>
                    </div>
                    <div className="balance__card-logo">SBI</div>
                  </div>
                </div>

                <div className="stats-row">
                  <div className="stat-card stat-card--events">
                    <div className="stat-card__icon">{I.transactions}</div>
                    <div className="stat-card__value">{stats.total_events || events.length}</div>
                    <div className="stat-card__label">Total Transactions</div>
                  </div>
                  <div className="stat-card stat-card--credits">
                    <div className="stat-card__icon">{I.arrowDown}</div>
                    <div className="stat-card__value">{formatCurrency(stats.total_credits || 0)}</div>
                    <div className="stat-card__label">Money In</div>
                  </div>
                  <div className="stat-card stat-card--debits">
                    <div className="stat-card__icon">{I.arrowUp}</div>
                    <div className="stat-card__value">{formatCurrency(stats.total_debits || 0)}</div>
                    <div className="stat-card__label">Money Out</div>
                  </div>
                  <div className="stat-card stat-card--agents">
                    <div className="stat-card__icon">{I.agents}</div>
                    <div className="stat-card__value">{pendingActions.length}</div>
                    <div className="stat-card__label">Pending Actions</div>
                  </div>
                </div>
              </div>

              {/* Agent Alerts Banner */}
              {pendingActions.length > 0 && (
                <div className="alert-banner">
                  <div className="alert-banner__icon">🤖</div>
                  <div className="alert-banner__body">
                    <div className="alert-banner__title">{pendingActions.length} AI Agent {pendingActions.length === 1 ? 'Recommendation' : 'Recommendations'}</div>
                    <div className="alert-banner__sub">Your AI agents have new actions for you to review</div>
                  </div>
                  <button className="alert-banner__btn" onClick={() => setActiveTab('agents')}>
                    Review Now {I.chevron}
                  </button>
                </div>
              )}

              {/* Content Grid */}
              <div className="grid-bottom">
                <div className="card card--transactions">
                  <div className="card__header">
                    <span className="card__title">Recent Transactions</span>
                    <button className="card__link" onClick={() => setActiveTab('transactions')}>View All {I.chevron}</button>
                  </div>
                  <div className="txn-list">
                    {events.length === 0 ? (
                      <div className="empty-sm">No transactions yet. Use Demo Controls to simulate.</div>
                    ) : (
                      events.slice(0, 5).map((e, i) => <TransactionRow key={e.event_id || i} event={e} />)
                    )}
                  </div>
                </div>

                <div className="card card--journeys-preview">
                  <div className="card__header">
                    <span className="card__title">Active Journeys</span>
                    <button className="card__link" onClick={() => setActiveTab('journeys')}>View All {I.chevron}</button>
                  </div>
                  {journeys.length === 0 ? (
                    <div className="empty-sm-fancy">
                      <div className="empty-sm-fancy__icon">{I.journeys}</div>
                      <div className="empty-sm-fancy__title">No journeys yet</div>
                      <div className="empty-sm-fancy__sub">AI agents will create personalized journeys when life events are detected</div>
                    </div>
                  ) : (
                    journeys.slice(0, 2).map(j => <JourneyCard key={j.journey_id} journey={j} />)
                  )}
                </div>
              </div>
            </>
          )}

          {/* ─── Transactions Tab ─── */}
          {activeTab === 'transactions' && (
            <div className="card card--full">
              <div className="card__header"><span className="card__title">Transaction History</span><span className="card__badge card__badge--live">{connected ? 'LIVE' : 'OFFLINE'}</span></div>
              <div className="txn-list">
                {events.length === 0 ? (
                  <div className="empty-sm">No transactions yet. Use Demo Controls to simulate banking events.</div>
                ) : (
                  events.map((e, i) => <TransactionRow key={e.event_id || i} event={e} />)
                )}
              </div>
            </div>
          )}

          {/* ─── Journeys Tab ─── */}
          {activeTab === 'journeys' && (
            <div className="card card--full">
              <div className="card__header">
                <span className="card__title">Your Journeys</span>
                {journeys.length > 0 && <span className="card__badge card__badge--green">{journeys.filter(j => j.status === 'ACTIVE').length} active</span>}
              </div>
              {journeys.length === 0 ? (
                <div className="empty-lg">
                  <div className="empty-lg__icon">{I.journeys}</div>
                  <div className="empty-lg__title">No journeys yet</div>
                  <div className="empty-lg__sub">Journeys start automatically when AI agents detect life events from your transaction patterns.</div>
                </div>
              ) : (
                <div className="journey-grid">
                  {journeys.map(j => <JourneyCard key={j.journey_id} journey={j} />)}
                </div>
              )}
            </div>
          )}

          {/* ─── Agents Tab ─── */}
          {activeTab === 'agents' && (
            <div className="card card--full">
              <div className="card__header">
                <span className="card__title">AI Agent Recommendations</span>
                {actions.length > 0 && <span className="card__badge card__badge--purple">{pendingActions.length} pending</span>}
              </div>
              {actions.length === 0 ? (
                <div className="empty-lg">
                  <div className="empty-lg__icon">{I.agents}</div>
                  <div className="empty-lg__title">No recommendations yet</div>
                  <div className="empty-lg__sub">AI agents are monitoring your transactions. They'll recommend actions when they detect important life events.</div>
                </div>
              ) : (
                <div className="agents-grid">
                  {actions.map((a, i) => <InterventionCard key={a.id || i} action={a} onConsent={handleConsent} consentState={consentState} />)}
                </div>
              )}
            </div>
          )}

          {/* ─── Settings Tab ─── */}
          {activeTab === 'settings' && (
            <div className="card card--full">
              <div className="card__header"><span className="card__title">Account Settings</span></div>
              <div className="settings-grid">
                <div className="settings-section">
                  <h3 className="settings-section__title">Profile</h3>
                  <div className="setting-item"><span className="setting-item__label">Name</span><span className="setting-item__value">{user.name}</span></div>
                  <div className="setting-item"><span className="setting-item__label">Customer ID</span><span className="setting-item__value">{user.customerId}</span></div>
                  <div className="setting-item"><span className="setting-item__label">Account</span><span className="setting-item__value">{user.accountNo || 'XXXX4521'}</span></div>
                </div>
                <div className="settings-section">
                  <h3 className="settings-section__title">System</h3>
                  <div className="setting-item"><span className="setting-item__label">API Gateway</span><span className="setting-item__value setting-item__value--mono">{API_BASE}</span></div>
                  <div className="setting-item"><span className="setting-item__label">SSE Status</span><span className={`setting-item__value setting-item__value--${connected ? 'green' : 'red'}`}>{connected ? 'Connected' : 'Disconnected'}</span></div>
                  <div className="setting-item"><span className="setting-item__label">AI Agents</span><span className="setting-item__value">Acquisition, Lifestyle, Engagement</span></div>
                  <div className="setting-item"><span className="setting-item__label">Mode</span><span className="setting-item__value">Standalone (No Kafka)</span></div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Floating Demo Panel */}
        <QuickActions onSendEvent={sendEvent} collapsed={demoCollapsed} onToggle={() => setDemoCollapsed(!demoCollapsed)} />
      </div>
    </div>
  )
}

export default App
