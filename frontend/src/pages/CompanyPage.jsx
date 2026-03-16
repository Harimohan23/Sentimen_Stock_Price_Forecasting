import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { companyAPI, chartAPI, sentimentAPI } from '../services/api'
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine, BarChart, Bar, Legend
} from 'recharts'

const PERIODS = ['1m', '3m', '6m', '1y', '3y', '5y']

export default function CompanyPage() {
  const { symbol } = useParams()
  const nav = useNavigate()
  const [company, setCompany] = useState(null)
  const [chart, setChart] = useState([])
  const [period, setPeriod] = useState('1y')
  const [loading, setLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(false)
  const [showRsi, setShowRsi] = useState(false)
  const [showSma, setShowSma] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      companyAPI.getCompany(symbol),
      chartAPI.getChart(symbol, '1y'),
    ]).then(([co, ch]) => {
      setCompany(co)
      setChart(ch)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [symbol])

  const loadChart = (p) => {
    setPeriod(p)
    setChartLoading(true)
    chartAPI.getChart(symbol, p).then(d => { setChart(d); setChartLoading(false) })
  }

  if (loading) return <Spinner />
  if (!company) return <NotFound sym={symbol} />

  const c = company
  const isPos = c.change_pct >= 0
  const sent = c.sentiment || {}
  const sentScore = sent.sentiment_score || 0.5
  const rsiVal = c.rsi_14

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '32px 24px' }}>
      {/* Back */}
      <button onClick={() => nav(-1)} style={S.back}>← Back</button>

      {/* Header */}
      <div style={S.head} className="fade-up">
        <div style={S.headLeft}>
          <div style={S.sectorBadge}>{c.sector}</div>
          <h1 style={S.compName}>{c.name}</h1>
          <div style={S.symRow}>
            <span style={S.sym}>{symbol.replace('.NS', '')}.NS</span>
            <span style={S.dot}>·</span>
            <span style={S.date}>{c.date}</span>
          </div>
        </div>
        <div style={S.headRight}>
          <div style={S.price}>₹{c.current_price?.toLocaleString('en-IN')}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: isPos ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 600 }}>
              {isPos ? '+' : ''}₹{c.change?.toFixed(2)} ({isPos ? '+' : ''}{c.change_pct?.toFixed(2)}%)
            </span>
          </div>
          <button style={S.predictBtn} onClick={() => nav(`/predict/${symbol}`)}>
            🤖 Run AI Prediction
          </button>
        </div>
      </div>

      {/* Key Stats */}
      <div style={S.statsGrid}>
        {[
          { label: 'Open', value: `₹${c.open?.toLocaleString('en-IN')}` },
          { label: 'High', value: `₹${c.high?.toLocaleString('en-IN')}` },
          { label: 'Low', value: `₹${c.low?.toLocaleString('en-IN')}` },
          { label: '52W High', value: `₹${c.week52_high?.toLocaleString('en-IN')}` },
          { label: '52W Low', value: `₹${c.week52_low?.toLocaleString('en-IN')}` },
          { label: 'Volume', value: c.volume?.toLocaleString() },
          { label: 'RSI (14)', value: rsiVal?.toFixed(1), color: rsiVal > 70 ? 'var(--red)' : rsiVal < 30 ? 'var(--green)' : 'var(--text)' },
          { label: 'Volatility', value: c.volatility_20d ? `${c.volatility_20d?.toFixed(2)}%` : '–' },
          { label: 'ATR (14)', value: c.atr_14?.toFixed(2) },
          { label: 'VWAP (14)', value: c.vwap_14 ? `₹${c.vwap_14?.toFixed(2)}` : '–' },
          { label: 'SMA 7', value: c.sma_7 ? `₹${c.sma_7?.toFixed(2)}` : '–' },
          { label: 'SMA 50', value: c.sma_50 ? `₹${c.sma_50?.toFixed(2)}` : '–' },
        ].map(s => (
          <div key={s.label} style={S.statCard}>
            <div style={S.statLabel}>{s.label}</div>
            <div style={{ ...S.statVal, color: s.color || 'var(--text)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={S.twoCol}>
        {/* Chart */}
        <div style={S.chartCard}>
          <div style={S.chartHeader}>
            <h3 style={S.cardTitle}>Price Chart</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={S.toggle}>
                <input type="checkbox" checked={showSma} onChange={e => setShowSma(e.target.checked)} style={{ accentColor: 'var(--gold)' }} />
                <span style={{ fontSize: 11, color: 'var(--text2)' }}>SMA</span>
              </label>
              <label style={S.toggle}>
                <input type="checkbox" checked={showRsi} onChange={e => setShowRsi(e.target.checked)} style={{ accentColor: 'var(--teal)' }} />
                <span style={{ fontSize: 11, color: 'var(--text2)' }}>RSI</span>
              </label>
              <div style={S.periodBtns}>
                {PERIODS.map(p => (
                  <button key={p} onClick={() => loadChart(p)} style={{ ...S.periodBtn, ...(period === p ? S.periodBtnActive : {}) }}>
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {chartLoading ? (
            <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <>
              <PriceChart data={chart} isPos={isPos} showSma={showSma} />
              {showRsi && <RsiChart data={chart} />}
              <VolumeChart data={chart} />
            </>
          )}
        </div>

        {/* Sentiment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={S.sentCard}>
            <h3 style={S.cardTitle}>Sentiment Analysis</h3>
            <div style={S.sentMeter}>
              <div style={S.sentArc}>
                <svg viewBox="0 0 120 70" width="160">
                  <defs>
                    <linearGradient id="sentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FF4757" />
                      <stop offset="50%" stopColor="#FFB700" />
                      <stop offset="100%" stopColor="#2ED573" />
                    </linearGradient>
                  </defs>
                  <path d="M10 65 A50 50 0 0 1 110 65" fill="none" stroke="var(--border)" strokeWidth="8" strokeLinecap="round" />
                  <path d="M10 65 A50 50 0 0 1 110 65" fill="none" stroke="url(#sentGrad)" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${sentScore * 157} 157`} />
                  <text x="60" y="62" textAnchor="middle" fontSize="14" fill="white" fontFamily="var(--mono)" fontWeight="700">
                    {(sentScore * 100).toFixed(0)}
                  </text>
                </svg>
              </div>
              <div style={S.sentMeta}>
                <div style={S.sentLabel}>
                  {sentScore >= 0.6 ? '📈 Bullish' : sentScore <= 0.4 ? '📉 Bearish' : '➡️ Neutral'}
                </div>
                <div style={S.sentSub}>Overall Market Sentiment</div>
              </div>
            </div>
            <div style={S.sentBars}>
              {[
                { label: 'Positive', count: sent.positive_count || 0, color: 'var(--green)' },
                { label: 'Neutral', count: sent.neutral_count || 0, color: 'var(--gold)' },
                { label: 'Negative', count: sent.negative_count || 0, color: 'var(--red)' },
              ].map(b => {
                const total = (sent.positive_count || 0) + (sent.neutral_count || 0) + (sent.negative_count || 0) || 1
                return (
                  <div key={b.label} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: 'var(--text2)' }}>{b.label}</span>
                      <span style={{ fontSize: 11, color: b.color, fontFamily: 'var(--mono)' }}>{b.count}</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--bg)', borderRadius: 2 }}>
                      <div style={{ height: '100%', width: `${(b.count / total) * 100}%`, background: b.color, borderRadius: 2, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
              {sent.total_news || 0} articles analyzed
            </div>
          </div>

          {/* RSI gauge */}
          <div style={S.metricCard}>
            <div style={S.cardTitle}>Technical Signals</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 12 }}>
              <TechRow label="RSI (14)" value={rsiVal?.toFixed(1)} status={rsiVal > 70 ? 'Overbought' : rsiVal < 30 ? 'Oversold' : 'Normal'} color={rsiVal > 70 ? 'var(--red)' : rsiVal < 30 ? 'var(--green)' : 'var(--gold)'} pct={rsiVal} />
              <TechRow label="52W High Distance" value={`${c.dist_from_52w_high?.toFixed(2)}%`} status={Math.abs(c.dist_from_52w_high) < 5 ? 'Near High' : 'Far from High'} color={Math.abs(c.dist_from_52w_high) < 5 ? 'var(--green)' : 'var(--text2)'} pct={100 - Math.min(Math.abs(c.dist_from_52w_high), 100)} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent News */}
      {sent.recent_news?.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ ...S.cardTitle, marginBottom: 16 }}>Recent News & Headlines</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sent.recent_news.map((n, i) => (
              <div key={i} style={S.newsRow}>
                <div style={S.newsLeft}>
                  <div style={S.newsHl}>{n.headline}</div>
                  <div style={S.newsMeta}>{n.date} · {n.event_type}</div>
                </div>
                <span className={`badge ${n.score >= 0.6 ? 'badge-pos' : n.score <= 0.4 ? 'badge-neg' : 'badge-neutral'}`}>
                  {(n.score * 100).toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PriceChart({ data, isPos, showSma }) {
  const color = isPos ? '#2ED573' : '#FF4757'
  const fmt = (v) => `₹${v?.toLocaleString('en-IN')}`
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 60 }}>
        <defs>
          <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.2} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: '#5A6375', fontSize: 10, fontFamily: 'var(--mono)' }}
          tickFormatter={d => d?.slice(5)} interval="preserveStartEnd" />
        <YAxis tick={{ fill: '#5A6375', fontSize: 10, fontFamily: 'var(--mono)' }}
          tickFormatter={v => `₹${v.toLocaleString('en-IN')}`} domain={['auto', 'auto']} />
        <Tooltip contentStyle={{ background: '#0f1729', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
          formatter={(v, name) => [fmt(v), name]} labelStyle={{ color: '#8B95A8', marginBottom: 4 }} />
        <Area type="monotone" dataKey="close" stroke={color} strokeWidth={2} fill="url(#priceGrad)" dot={false} name="Close" />
        {showSma && <Line type="monotone" dataKey="sma_7" stroke="#FFB700" strokeWidth={1} dot={false} name="SMA 7" opacity={0.7} />}
        {showSma && <Line type="monotone" dataKey="sma_50" stroke="#A29BFE" strokeWidth={1} dot={false} name="SMA 50" opacity={0.7} />}
      </AreaChart>
    </ResponsiveContainer>
  )
}

function RsiChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={100}>
      <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 60 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="date" hide />
        <YAxis domain={[0, 100]} tick={{ fill: '#5A6375', fontSize: 10, fontFamily: 'var(--mono)' }} />
        <Tooltip contentStyle={{ background: '#0f1729', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
        <ReferenceLine y={70} stroke="#FF4757" strokeDasharray="3 3" opacity={0.5} />
        <ReferenceLine y={30} stroke="#2ED573" strokeDasharray="3 3" opacity={0.5} />
        <Line type="monotone" dataKey="rsi" stroke="#00D4AA" strokeWidth={1.5} dot={false} name="RSI" />
      </LineChart>
    </ResponsiveContainer>
  )
}

function VolumeChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={60}>
      <BarChart data={data} margin={{ top: 4, right: 10, bottom: 0, left: 60 }}>
        <XAxis dataKey="date" hide />
        <YAxis hide />
        <Tooltip contentStyle={{ background: '#0f1729', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
          formatter={v => [v?.toLocaleString(), 'Volume']} />
        <Bar dataKey="volume" fill="rgba(255,183,0,0.2)" name="Volume" radius={[1, 1, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function TechRow({ label, value, status, color, pct }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--text2)' }}>{label}</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color }}>{value}</span>
          <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 3, background: `${color}20`, color }}>{status}</span>
        </div>
      </div>
      <div style={{ height: 4, background: 'var(--bg)', borderRadius: 2 }}>
        <div style={{ height: '100%', width: `${Math.min(Math.max(pct, 0), 100)}%`, background: color, borderRadius: 2 }} />
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: 'var(--text2)', fontFamily: 'var(--mono)' }}>Loading stock data…</p>
    </div>
  )
}

function NotFound({ sym }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12 }}>
      <div style={{ fontSize: 40 }}>🔍</div>
      <h2 style={{ fontFamily: 'var(--head)', color: 'var(--text)' }}>Symbol not found</h2>
      <p style={{ color: 'var(--text2)' }}>{sym} was not found in the database.</p>
    </div>
  )
}

const S = {
  back: { background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text2)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 12, marginBottom: 24 },
  head: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 },
  headLeft: { display: 'flex', flexDirection: 'column', gap: 8 },
  headRight: { display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' },
  sectorBadge: { display: 'inline-block', background: 'rgba(255,183,0,0.12)', color: 'var(--gold)', padding: '3px 10px', borderRadius: 4, fontSize: 11, fontFamily: 'var(--mono)', fontWeight: 600 },
  compName: { fontFamily: 'var(--head)', fontSize: 28, fontWeight: 800, color: 'var(--text)' },
  symRow: { display: 'flex', alignItems: 'center', gap: 8 },
  sym: { fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text3)' },
  dot: { color: 'var(--text3)' },
  date: { fontSize: 12, color: 'var(--text3)' },
  price: { fontFamily: 'var(--mono)', fontSize: 32, fontWeight: 700, color: 'var(--text)' },
  predictBtn: { background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%)', color: '#000', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontFamily: 'var(--head)', fontWeight: 700, cursor: 'pointer' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10, marginBottom: 24 },
  statCard: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' },
  statLabel: { fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, fontFamily: 'var(--mono)' },
  statVal: { fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600 },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 },
  chartCard: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 },
  chartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 },
  cardTitle: { fontFamily: 'var(--head)', fontSize: 16, fontWeight: 700, color: 'var(--text)' },
  periodBtns: { display: 'flex', gap: 4 },
  periodBtn: { background: 'none', border: '1px solid var(--border)', color: 'var(--text3)', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 10 },
  periodBtnActive: { background: 'var(--gold)', color: '#000', border: '1px solid var(--gold)' },
  toggle: { display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' },
  sentCard: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 },
  metricCard: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, flex: 1 },
  sentMeter: { display: 'flex', alignItems: 'center', gap: 16, margin: '16px 0' },
  sentArc: {},
  sentMeta: {},
  sentLabel: { fontFamily: 'var(--head)', fontSize: 18, fontWeight: 700, color: 'var(--text)' },
  sentSub: { fontSize: 11, color: 'var(--text3)', marginTop: 4 },
  sentBars: { marginTop: 16, marginBottom: 12 },
  newsRow: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  newsLeft: { flex: 1 },
  newsHl: { fontSize: 13, color: 'var(--text)', lineHeight: 1.5 },
  newsMeta: { fontSize: 11, color: 'var(--text3)', marginTop: 4, fontFamily: 'var(--mono)' },
}
