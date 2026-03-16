import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { marketAPI } from '../services/api'

const TABS = ['Top Gainers', 'Top Losers', 'Most Active', 'Market News']

export default function MarketPage() {
  const [tab, setTab] = useState(0)
  const [data, setData] = useState({ gainers: [], losers: [], active: [], news: [] })
  const [loading, setLoading] = useState(true)
  const nav = useNavigate()

  useEffect(() => {
    Promise.all([
      marketAPI.getTopGainers(20),
      marketAPI.getTopLosers(20),
      marketAPI.getMostActive(20),
      marketAPI.getNews(30),
    ]).then(([g, l, a, n]) => {
      setData({ gainers: g, losers: l, active: a, news: n })
      setLoading(false)
    })
  }, [])

  const goCompany = (sym) => nav(`/company/${sym}`)

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
      <div style={S.header} className="fade-up">
        <div>
          <h1 style={S.title}>Market Overview</h1>
          <p style={S.sub}>NSE-listed stocks — 118 companies across 10 sectors</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={S.tabs}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} style={{ ...S.tab, ...(tab === i ? S.tabActive : {}) }}>
            {t}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <div style={S.content} className="fade-up">
          {tab === 0 && <StockTable data={data.gainers} onRowClick={goCompany} type="gain" />}
          {tab === 1 && <StockTable data={data.losers} onRowClick={goCompany} type="loss" />}
          {tab === 2 && <StockTable data={data.active} onRowClick={goCompany} type="active" />}
          {tab === 3 && <NewsTable data={data.news} />}
        </div>
      )}
    </div>
  )
}

function StockTable({ data, onRowClick, type }) {
  return (
    <div style={S.tableCard}>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Symbol</th>
              <th>Company</th>
              <th>Sector</th>
              <th style={{ textAlign: 'right' }}>Price (₹)</th>
              <th style={{ textAlign: 'right' }}>Change %</th>
              <th style={{ textAlign: 'right' }}>Volume</th>
            </tr>
          </thead>
          <tbody>
            {data.map((s, i) => (
              <tr key={s.symbol} style={{ cursor: 'pointer' }} onClick={() => onRowClick(s.symbol)}>
                <td style={{ color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 11 }}>{i + 1}</td>
                <td>
                  <span style={S.sym}>{s.symbol.replace('.NS', '')}</span>
                </td>
                <td style={{ color: 'var(--text2)', fontSize: 12 }}>{s.name}</td>
                <td><SectorBadge sector={s.sector} /></td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 13 }}>
                  {s.price?.toLocaleString('en-IN')}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: s.change_pct >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {s.change_pct >= 0 ? '+' : ''}{s.change_pct?.toFixed(2)}%
                  </span>
                </td>
                <td style={{ textAlign: 'right', color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 11 }}>
                  {s.volume?.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function NewsTable({ data }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map((n, i) => (
        <div key={i} style={S.newsCard}>
          <div style={S.newsTop}>
            <SectorBadge sector={n.sector} />
            <span style={S.newsType}>{n.event_type}</span>
            <span style={{ flex: 1 }} />
            <span style={S.newsDate}>{n.date}</span>
            <SentBadge score={n.score} />
          </div>
          <p style={S.newsHl}>{n.headline}</p>
        </div>
      ))}
    </div>
  )
}

const SECTOR_COLORS = {
  IT: '#4C9BE8', Banking: '#FFB700', Pharma: '#2ED573', Auto: '#FF6B6B',
  FMCG: '#A29BFE', Energy: '#FF9F43', Metals: '#74B9FF', Infrastructure: '#FD79A8',
  Telecom: '#00CEC9', RealEstate: '#6C5CE7', General: '#888'
}

function SectorBadge({ sector }) {
  const c = SECTOR_COLORS[sector] || '#888'
  return (
    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: `${c}18`, color: c, fontFamily: 'var(--mono)', fontWeight: 600 }}>
      {sector}
    </span>
  )
}

function SentBadge({ score }) {
  const s = parseFloat(score)
  const cls = s >= 0.6 ? 'badge-pos' : s <= 0.4 ? 'badge-neg' : 'badge-neutral'
  const label = s >= 0.6 ? '▲ Positive' : s <= 0.4 ? '▼ Negative' : '● Neutral'
  return <span className={`badge ${cls}`}>{label}</span>
}

function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  )
}

const S = {
  header: { marginBottom: 32 },
  title: { fontFamily: 'var(--head)', fontSize: 32, fontWeight: 800, color: 'var(--text)' },
  sub: { color: 'var(--text2)', fontSize: 14, marginTop: 4 },
  tabs: { display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 0 },
  tab: {
    background: 'none', border: 'none', cursor: 'pointer',
    padding: '10px 20px', fontFamily: 'var(--head)', fontSize: 13,
    color: 'var(--text2)', borderBottom: '2px solid transparent',
    transition: 'all 0.2s', fontWeight: 600,
  },
  tabActive: { color: 'var(--gold)', borderBottom: '2px solid var(--gold)' },
  content: {},
  tableCard: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' },
  sym: { fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600, color: 'var(--gold)' },
  newsCard: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px' },
  newsTop: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' },
  newsType: { fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)' },
  newsDate: { fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' },
  newsHl: { color: 'var(--text)', fontSize: 13, lineHeight: 1.6 },
}
