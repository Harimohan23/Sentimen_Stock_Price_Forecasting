import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { marketAPI } from '../services/api'

const SECTOR_ICONS = {
  IT: '💻', Banking: '🏦', Pharma: '💊', Auto: '🚗', FMCG: '🛒',
  Energy: '⚡', Metals: '⚙️', Infrastructure: '🏗️', Telecom: '📡', RealEstate: '🏢'
}

const SECTOR_COLORS = {
  IT: '#4C9BE8', Banking: '#FFB700', Pharma: '#2ED573', Auto: '#FF6B6B',
  FMCG: '#A29BFE', Energy: '#FF9F43', Metals: '#74B9FF', Infrastructure: '#FD79A8',
  Telecom: '#00CEC9', RealEstate: '#6C5CE7'
}

export default function HomePage() {
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const nav = useNavigate()

  useEffect(() => {
    marketAPI.getOverview().then(d => { setOverview(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const goCompany = (sym) => nav(`/company/${sym}`)
  const goSector = (s) => nav(`/sector/${s}`)

  if (loading) return <LoadingScreen />

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px' }}>
      {/* Hero */}
      <div style={S.hero} className="fade-up">
        <div style={S.heroTag}>NSE · BSE · Real-time Analytics</div>
        <h1 style={S.heroTitle}>Indian Market<br /><span style={S.heroGold}>Intelligence</span></h1>
        <p style={S.heroSub}>
          AI-powered stock analysis with 5+ years of historical data, sentiment signals from financial news, and multi-model price predictions.
        </p>
        <div style={S.heroActions}>
          <button style={S.btnPrimary} onClick={() => nav('/market')}>Explore Markets</button>
          <button style={S.btnSecondary} onClick={() => nav('/predict')}>Run Predictions</button>
        </div>
        <div style={S.heroStats}>
          {[
            { label: 'Stocks Tracked', value: '118' },
            { label: 'Data Points', value: '166K+' },
            { label: 'News Articles', value: '57K+' },
            { label: 'Years of Data', value: '5+' },
          ].map(s => (
            <div key={s.label} style={S.heroStat}>
              <div style={S.heroStatVal}>{s.value}</div>
              <div style={S.heroStatLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sectors Grid */}
      <Section title="Browse by Sector" action={{ label: 'All Markets', onClick: () => nav('/market') }}>
        <div style={S.sectorGrid}>
          {(overview?.sectors || []).map(s => (
            <button key={s.sector} style={S.sectorCard} onClick={() => goSector(s.sector)}>
              <div style={{ ...S.sectorIcon, background: `${SECTOR_COLORS[s.sector]}20`, color: SECTOR_COLORS[s.sector] }}>
                {SECTOR_ICONS[s.sector] || '📊'}
              </div>
              <div style={S.sectorName}>{s.sector}</div>
              <div style={S.sectorCount}>{s.symbol_count} stocks</div>
              <div style={S.sectorSymbols}>
                {s.symbols?.slice(0, 3).map(sym => (
                  <span key={sym} style={S.pill}>{sym.replace('.NS', '')}</span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* Top Movers */}
      <div style={S.twoCol}>
        <MoversCard title="🚀 Top Gainers" data={overview?.top_gainers || []} onClick={goCompany} dir="gain" />
        <MoversCard title="📉 Top Losers" data={overview?.top_losers || []} onClick={goCompany} dir="loss" />
      </div>

      {/* Market News */}
      <Section title="📰 Latest Market News" action={{ label: 'More News', onClick: () => nav('/market') }}>
        <div style={S.newsGrid}>
          {(overview?.latest_news || []).map((n, i) => (
            <div key={i} style={S.newsCard}>
              <div style={S.newsHeader}>
                <span style={{ ...S.newsSec, background: `${SECTOR_COLORS[n.sector] || '#888'}18`, color: SECTOR_COLORS[n.sector] || '#888' }}>
                  {n.sector}
                </span>
                <span style={S.newsDate}>{n.date}</span>
              </div>
              <p style={S.newsHeadline}>{n.headline}</p>
              <div style={S.newsFooter}>
                <SentBadge score={n.score} />
                <span style={S.newsSource}>{n.source}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

function MoversCard({ title, data, onClick, dir }) {
  return (
    <div style={S.moversCard}>
      <h3 style={S.moversTitle}>{title}</h3>
      <div style={S.moversList}>
        {data.map(s => (
          <button key={s.symbol} style={S.moverRow} onClick={() => onClick(s.symbol)}>
            <div style={S.moverLeft}>
              <span style={S.moverSym}>{s.symbol.replace('.NS', '')}</span>
              <span style={S.moverName}>{s.name}</span>
            </div>
            <div style={S.moverRight}>
              <span style={S.moverPrice}>₹{s.price?.toLocaleString('en-IN')}</span>
              <span style={{ color: s.change_pct >= 0 ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--mono)', fontSize: 12 }}>
                {s.change_pct >= 0 ? '+' : ''}{s.change_pct?.toFixed(2)}%
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function SentBadge({ score }) {
  const s = parseFloat(score)
  const cls = s >= 0.6 ? 'badge-pos' : s <= 0.4 ? 'badge-neg' : 'badge-neutral'
  const label = s >= 0.6 ? '▲ Positive' : s <= 0.4 ? '▼ Negative' : '● Neutral'
  return <span className={`badge ${cls}`}>{label}</span>
}

function Section({ title, action, children }) {
  return (
    <div style={{ marginTop: 56 }}>
      <div style={S.secHeader}>
        <h2 style={S.secTitle}>{title}</h2>
        {action && <button style={S.secAction} onClick={action.onClick}>{action.label} →</button>}
      </div>
      {children}
    </div>
  )
}

function LoadingScreen() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
      <div style={{ width: 48, height: 48, border: '3px solid var(--border)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: 'var(--text2)', fontFamily: 'var(--mono)' }}>Loading market data…</p>
    </div>
  )
}

const S = {
  hero: {
    textAlign: 'center', padding: '60px 40px 80px',
    background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(255,183,0,0.12) 0%, transparent 70%)',
    borderRadius: 20, border: '1px solid var(--border)', marginBottom: 0,
  },
  heroTag: { display: 'inline-block', background: 'rgba(255,183,0,0.12)', color: 'var(--gold)', border: '1px solid rgba(255,183,0,0.3)', borderRadius: 20, padding: '4px 16px', fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: 1, marginBottom: 20 },
  heroTitle: { fontFamily: 'var(--head)', fontSize: 'clamp(40px,6vw,80px)', fontWeight: 800, lineHeight: 1.1, color: 'var(--text)', marginBottom: 20 },
  heroGold: { color: 'var(--gold)' },
  heroSub: { color: 'var(--text2)', fontSize: 16, maxWidth: 540, margin: '0 auto 32px', lineHeight: 1.7 },
  heroActions: { display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 48 },
  btnPrimary: { background: 'var(--gold)', color: '#000', border: 'none', padding: '12px 28px', borderRadius: 8, fontSize: 14, fontFamily: 'var(--head)', fontWeight: 700, cursor: 'pointer', letterSpacing: 0.5 },
  btnSecondary: { background: 'transparent', color: 'var(--text)', border: '1px solid var(--border2)', padding: '12px 28px', borderRadius: 8, fontSize: 14, fontFamily: 'var(--head)', fontWeight: 700, cursor: 'pointer' },
  heroStats: { display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' },
  heroStat: { textAlign: 'center' },
  heroStatVal: { fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 700, color: 'var(--teal)' },
  heroStatLabel: { fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1 },
  secHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  secTitle: { fontFamily: 'var(--head)', fontSize: 20, fontWeight: 700, color: 'var(--text)' },
  secAction: { background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--head)' },
  sectorGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 },
  sectorCard: {
    background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12,
    padding: '20px 16px', cursor: 'pointer', textAlign: 'left',
    transition: 'border-color 0.2s, transform 0.2s', display: 'flex', flexDirection: 'column', gap: 8,
  },
  sectorIcon: { width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 },
  sectorName: { fontFamily: 'var(--head)', fontSize: 14, fontWeight: 700, color: 'var(--text)' },
  sectorCount: { fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' },
  sectorSymbols: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  pill: { background: 'var(--card2)', padding: '1px 6px', borderRadius: 4, fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 56 },
  moversCard: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 },
  moversTitle: { fontFamily: 'var(--head)', fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text)' },
  moversList: { display: 'flex', flexDirection: 'column', gap: 2 },
  moverRow: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 8px', borderRadius: 8, transition: 'background 0.15s' },
  moverLeft: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 },
  moverSym: { fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600, color: 'var(--gold)' },
  moverName: { fontSize: 11, color: 'var(--text3)' },
  moverRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 },
  moverPrice: { fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text)' },
  newsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 },
  newsCard: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 },
  newsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  newsSec: { fontSize: 10, padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--mono)', fontWeight: 600 },
  newsDate: { fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' },
  newsHeadline: { fontSize: 13, color: 'var(--text)', lineHeight: 1.6, flex: 1 },
  newsFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  newsSource: { fontSize: 10, color: 'var(--text3)' },
}
