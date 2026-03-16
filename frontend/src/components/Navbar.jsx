import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { marketAPI } from '../services/api'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/market', label: 'Markets' },
  { to: '/predict', label: 'AI Predict' },
]

export default function Navbar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [open, setOpen] = useState(false)
  const nav = useNavigate()
  const loc = useLocation()
  const ref = useRef()

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (!query.trim()) { setResults([]); setOpen(false); return }
    const t = setTimeout(async () => {
      setSearching(true)
      try {
        const data = await marketAPI.search(query)
        setResults(data)
        setOpen(true)
      } finally { setSearching(false) }
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  const go = (sym) => { nav(`/company/${sym}`); setQuery(''); setOpen(false) }

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <span style={styles.logoIcon}>◈</span>
          <span style={styles.logoText}>Finance<span style={styles.logoAccent}>AI</span></span>
        </Link>

        {/* Links */}
        <div style={styles.links}>
          {NAV_LINKS.map(l => (
            <Link key={l.to} to={l.to} style={{
              ...styles.link,
              color: loc.pathname === l.to ? 'var(--gold)' : 'var(--text2)',
              borderBottom: loc.pathname === l.to ? '2px solid var(--gold)' : '2px solid transparent',
            }}>{l.label}</Link>
          ))}
        </div>

        {/* Search */}
        <div ref={ref} style={styles.searchWrap}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search stocks…"
            style={styles.search}
          />
          {searching && <span style={styles.searchSpin}>⟳</span>}
          {open && results.length > 0 && (
            <div style={styles.dropdown}>
              {results.map(r => (
                <button key={r.symbol} onClick={() => go(r.symbol)} style={styles.dropItem}>
                  <div style={styles.dropLeft}>
                    <span style={styles.dropSym}>{r.symbol.replace('.NS','')}</span>
                    <span style={styles.dropName}>{r.name}</span>
                  </div>
                  <div style={styles.dropRight}>
                    <span style={styles.dropPrice}>₹{r.current_price?.toLocaleString('en-IN')}</span>
                    <span style={{ ...styles.dropChg, color: r.change_pct >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {r.change_pct >= 0 ? '+' : ''}{r.change_pct?.toFixed(2)}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    position: 'sticky', top: 0, zIndex: 100,
    background: 'rgba(7,11,20,0.9)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--border)',
  },
  inner: {
    maxWidth: 1400, margin: '0 auto', padding: '0 24px',
    height: 64, display: 'flex', alignItems: 'center', gap: 32,
  },
  logo: { display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' },
  logoIcon: { fontSize: 22, color: 'var(--gold)' },
  logoText: { fontFamily: 'var(--head)', fontSize: 18, fontWeight: 800, color: 'var(--text)' },
  logoAccent: { color: 'var(--gold)' },
  links: { display: 'flex', gap: 4, flex: 1 },
  link: {
    fontFamily: 'var(--head)', fontSize: 13, fontWeight: 600,
    padding: '4px 16px', borderRadius: '4px 4px 0 0',
    textDecoration: 'none', transition: 'color 0.2s',
    letterSpacing: '0.5px',
  },
  searchWrap: { position: 'relative', marginLeft: 'auto' },
  search: {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '8px 16px', color: 'var(--text)',
    fontSize: 13, width: 220, fontFamily: 'var(--body)',
    outline: 'none', transition: 'border-color 0.2s',
  },
  searchSpin: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    animation: 'spin 1s linear infinite', color: 'var(--gold)',
  },
  dropdown: {
    position: 'absolute', top: '110%', right: 0, width: 360,
    background: 'var(--card2)', border: '1px solid var(--border)',
    borderRadius: 10, overflow: 'hidden', zIndex: 200,
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  },
  dropItem: {
    width: '100%', background: 'none', border: 'none', cursor: 'pointer',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 16px', borderBottom: '1px solid var(--border)',
    transition: 'background 0.15s',
  },
  dropLeft: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 },
  dropSym: { fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600, color: 'var(--gold)' },
  dropName: { fontSize: 11, color: 'var(--text2)' },
  dropRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 },
  dropPrice: { fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text)' },
  dropChg: { fontFamily: 'var(--mono)', fontSize: 11 },
}
