import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { modelAPI, marketAPI } from '../services/api'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, BarChart, Bar, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts'

const MODELS = [
  { id: 'xgboost', name: 'XGBoost', icon: '🌲', desc: 'Gradient boosted decision trees', type: 'Tree-based', color: '#FF9F43' },
  { id: 'lstm', name: 'LSTM', icon: '🧠', desc: 'Long Short-Term Memory neural network', type: 'Deep Learning', color: '#4C9BE8' },
  { id: 'bilstm', name: 'BiLSTM', icon: '⚡', desc: 'Bidirectional LSTM — forward & backward', type: 'Deep Learning', color: '#A29BFE' },
  { id: 'deep_learning', name: 'Deep Learning', icon: '🔮', desc: 'Multi-layer perceptron neural network', type: 'Neural Network', color: '#00D4AA' },
  { id: 'hybrid', name: 'Hybrid (XGB + LSTM)', icon: '🚀', desc: 'Ensemble combining tree & sequence models', type: 'Ensemble', color: '#FFB700' },
]

const ALL_SYMBOLS = [
  'TCS.NS','INFY.NS','WIPRO.NS','HCLTECH.NS','TECHM.NS','RELIANCE.NS','HDFCBANK.NS',
  'ICICIBANK.NS','SBIN.NS','AXISBANK.NS','SUNPHARMA.NS','DRREDDY.NS','CIPLA.NS',
  'MARUTI.NS','BAJAJ-AUTO.NS','ITC.NS','HINDUNILVR.NS','NESTLEIND.NS','NTPC.NS',
  'TATAPOWER.NS','JSWSTEEL.NS','TATASTEEL.NS','BHARTIARTL.NS','KOTAKBANK.NS',
  'BAJFINANCE.NS','LT.NS','POWERGRID.NS','ONGC.NS','DLF.NS','ADANIPORTS.NS'
]

export default function PredictPage() {
  const { symbol: urlSym } = useParams()
  const nav = useNavigate()

  const [symbol, setSymbol] = useState(urlSym || 'TCS.NS')
  const [model, setModel] = useState('xgboost')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [allSymbols, setAllSymbols] = useState(ALL_SYMBOLS)

  useEffect(() => {
    marketAPI.getSectors().then(secs => {
      const syms = secs.flatMap(s => s.symbols || [])
      if (syms.length > 0) setAllSymbols([...new Set(syms)])
    }).catch(() => {})
  }, [])

  const run = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await modelAPI.predict(symbol, model)
      setResult(data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Prediction failed. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const selectedModel = MODELS.find(m => m.id === model)

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={S.header} className="fade-up">
        <div style={S.tag}>AI Prediction Engine</div>
        <h1 style={S.title}>Multi-Model Stock<br /><span style={S.gold}>Price Prediction</span></h1>
        <p style={S.sub}>Select a stock and prediction algorithm. The model trains on 5 years of historical OHLCV and technical data.</p>
      </div>

      {/* Controls */}
      <div style={S.controls} className="fade-up">
        {/* Stock selector */}
        <div style={S.formGroup}>
          <label style={S.label}>Stock Symbol</label>
          <select value={symbol} onChange={e => setSymbol(e.target.value)} style={S.select}>
            {allSymbols.map(s => <option key={s} value={s}>{s.replace('.NS', '')} — {s}</option>)}
          </select>
        </div>

        {/* Model selector */}
        <div style={S.formGroup}>
          <label style={S.label}>Prediction Model</label>
          <select value={model} onChange={e => setModel(e.target.value)} style={S.select}>
            {MODELS.map(m => <option key={m.id} value={m.id}>{m.icon} {m.name} [{m.type}]</option>)}
          </select>
        </div>

        <button onClick={run} disabled={loading} style={{ ...S.runBtn, opacity: loading ? 0.7 : 1 }}>
          {loading ? '⏳ Training…' : '▶ Run Prediction'}
        </button>
      </div>

      {/* Model cards */}
      <div style={S.modelCards}>
        {MODELS.map(m => (
          <button key={m.id} onClick={() => setModel(m.id)} style={{
            ...S.modelCard,
            border: model === m.id ? `1px solid ${m.color}` : '1px solid var(--border)',
            boxShadow: model === m.id ? `0 0 20px ${m.color}20` : 'none',
          }}>
            <div style={S.mIcon}>{m.icon}</div>
            <div style={S.mName}>{m.name}</div>
            <div style={{ ...S.mType, color: m.color }}>{m.type}</div>
            <div style={S.mDesc}>{m.desc}</div>
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={S.loadingBox}>
          <div style={S.loadingInner}>
            <div style={{ width: 48, height: 48, border: `3px solid var(--border)`, borderTopColor: selectedModel?.color || 'var(--gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <div style={S.loadTitle}>Training {selectedModel?.name} on {symbol.replace('.NS', '')}…</div>
            <div style={S.loadSub}>Processing 5 years of OHLCV data + technical indicators</div>
            <div style={S.loadSteps}>
              {['Loading features', 'Normalizing data', 'Training model', 'Evaluating metrics'].map((s, i) => (
                <div key={s} style={{ ...S.loadStep, animationDelay: `${i * 0.4}s` }}>
                  <div style={S.loadDot} /> {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={S.errorBox}>
          <div style={S.errorIcon}>⚠️</div>
          <div>
            <div style={S.errorTitle}>Prediction Error</div>
            <div style={S.errorMsg}>{error}</div>
            <div style={S.errorHint}>Make sure the backend is running: cd backend && python main.py</div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && <PredictResults result={result} modelDef={selectedModel} onGoCompany={() => nav(`/company/${result.symbol}`)} />}
    </div>
  )
}

function PredictResults({ result, modelDef, onGoCompany }) {
  const m = result.metrics || {}
  const compMetrics = result.component_metrics

  const metricsData = [
    { name: 'RMSE', value: m.rmse, lower: true },
    { name: 'MAE', value: m.mae, lower: true },
    { name: 'R²', value: m.r2, higher: true },
    { name: 'Dir. Acc', value: m.directional_accuracy, higher: true, suffix: '%' },
  ]

  const radarData = [
    { metric: 'Accuracy', value: Math.max(0, m.r2 * 100) },
    { metric: 'Direction', value: m.directional_accuracy },
    { metric: 'Precision', value: Math.max(0, 100 - m.rmse * 10) },
    { metric: 'Stability', value: Math.max(0, 100 - m.mae * 10) },
    { metric: 'Fit', value: Math.max(0, m.r2 * 100) },
  ]

  const forecastData = (result.forecast_returns || []).map((v, i) => ({
    day: `Day ${i + 1}`, return: (v * 100).toFixed(3)
  }))

  const lossCurve = (result.loss_curve || []).map((v, i) => ({
    epoch: i + 1, loss: v, val_loss: (result.val_loss_curve || [])[i]
  }))

  return (
    <div style={S.results} className="fade-up">
      {/* Result header */}
      <div style={S.resultHead}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={S.resultIcon}>{modelDef?.icon}</span>
            <h2 style={S.resultTitle}>{result.model} — {result.company_name}</h2>
          </div>
          <div style={{ color: 'var(--text2)', fontSize: 13, fontFamily: 'var(--mono)' }}>
            {result.symbol} · Trained on {result.data_rows_used?.toLocaleString()} rows · {result.training_time_seconds}s
          </div>
          <div style={{ color: 'var(--text2)', fontSize: 12, fontFamily: 'var(--mono)', marginTop: 4 }}>
            Train: {result.train_size} samples · Test: {result.test_size} samples
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={onGoCompany} style={S.viewBtn}>View Company →</button>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>Current Price</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 22, color: 'var(--text)', fontWeight: 700 }}>
              ₹{result.current_price?.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Metric cards */}
      <div style={S.metricCards}>
        {metricsData.map(mm => (
          <div key={mm.name} style={S.metCard}>
            <div style={S.metLabel}>{mm.name}</div>
            <div style={S.metVal}>
              {typeof mm.value === 'number' ? mm.value.toFixed(4) : '—'}
              {mm.suffix || ''}
            </div>
            <div style={S.metHint}>
              {mm.higher ? (mm.value > 70 ? '✅ Good' : mm.value > 50 ? '⚠️ Fair' : '❌ Low') :
                           (mm.value < 0.5 ? '✅ Good' : mm.value < 1 ? '⚠️ Fair' : '❌ High')}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={S.chartGrid}>
        {/* Forecast */}
        {forecastData.length > 0 && (
          <div style={S.chartBox}>
            <h4 style={S.chartBoxTitle}>📈 7-Day Return Forecast (%)</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={forecastData}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#5A6375', fontSize: 10, fontFamily: 'var(--mono)' }} />
                <YAxis tick={{ fill: '#5A6375', fontSize: 10, fontFamily: 'var(--mono)' }} tickFormatter={v => `${v}%`} />
                <Tooltip contentStyle={{ background: '#0f1729', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [`${v}%`, 'Predicted Return']} />
                <Bar dataKey="return" radius={[4, 4, 0, 0]} name="Predicted Return">
                  {forecastData.map((d, i) => (
                    <Cell key={i} fill={parseFloat(d.return) >= 0 ? '#2ED573' : '#FF4757'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Loss curve for deep learning */}
        {lossCurve.length > 0 && (
          <div style={S.chartBox}>
            <h4 style={S.chartBoxTitle}>📉 Training Loss Curve ({result.epochs_trained} epochs)</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={lossCurve}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="epoch" tick={{ fill: '#5A6375', fontSize: 10 }} />
                <YAxis tick={{ fill: '#5A6375', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#0f1729', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="loss" stroke={modelDef?.color || '#FFB700'} strokeWidth={2} dot={false} name="Train Loss" />
                <Line type="monotone" dataKey="val_loss" stroke="#8B95A8" strokeWidth={1.5} dot={false} name="Val Loss" strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Radar */}
        <div style={S.chartBox}>
          <h4 style={S.chartBoxTitle}>📊 Model Performance Radar</h4>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#8B95A8', fontSize: 10 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Score" dataKey="value" stroke={modelDef?.color || '#FFB700'}
                fill={modelDef?.color || '#FFB700'} fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feature importance (XGBoost) */}
      {result.feature_importance && (
        <div style={S.featCard}>
          <h4 style={S.chartBoxTitle}>🌲 Feature Importance</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
            {Object.entries(result.feature_importance).map(([feat, imp]) => (
              <div key={feat}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--mono)' }}>{feat}</span>
                  <span style={{ fontSize: 12, color: 'var(--gold)', fontFamily: 'var(--mono)' }}>{(imp * 100).toFixed(1)}%</span>
                </div>
                <div style={{ height: 4, background: 'var(--bg)', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${imp * 100}%`, background: 'var(--gold)', borderRadius: 2, transition: 'width 0.5s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Component metrics for Hybrid */}
      {compMetrics && (
        <div style={S.hybridBox}>
          <h4 style={S.chartBoxTitle}>⚡ Ensemble Component Breakdown</h4>
          <div style={S.hybridGrid}>
            {['xgboost', 'lstm'].map(comp => {
              const cm = compMetrics[comp] || {}
              const w = comp === 'xgboost' ? compMetrics.ensemble_weight_xgb : 1 - compMetrics.ensemble_weight_xgb
              return (
                <div key={comp} style={S.hybridCard}>
                  <div style={{ fontFamily: 'var(--head)', fontSize: 14, marginBottom: 12, color: comp === 'xgboost' ? '#FF9F43' : '#4C9BE8' }}>
                    {comp === 'xgboost' ? '🌲 XGBoost' : '🧠 LSTM'} <span style={{ color: 'var(--text3)', fontSize: 11 }}>(weight: {(w * 100).toFixed(0)}%)</span>
                  </div>
                  {Object.entries(cm).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--text2)' }}>{k.toUpperCase()}</span>
                      <span style={{ fontFamily: 'var(--mono)', color: 'var(--text)' }}>{typeof v === 'number' ? v.toFixed(4) : v}</span>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

const S = {
  header: { textAlign: 'center', marginBottom: 40, padding: '40px 0 20px', background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,212,170,0.1) 0%, transparent 70%)', borderRadius: 20 },
  tag: { display: 'inline-block', background: 'rgba(0,212,170,0.12)', color: 'var(--teal)', border: '1px solid rgba(0,212,170,0.3)', borderRadius: 20, padding: '4px 16px', fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: 1, marginBottom: 16 },
  title: { fontFamily: 'var(--head)', fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, color: 'var(--text)', marginBottom: 12, lineHeight: 1.2 },
  gold: { color: 'var(--teal)' },
  sub: { color: 'var(--text2)', fontSize: 15, maxWidth: 520, margin: '0 auto' },
  controls: { display: 'flex', gap: 16, alignItems: 'flex-end', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, marginBottom: 24, flexWrap: 'wrap' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 200 },
  label: { fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'var(--mono)' },
  select: { background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontFamily: 'var(--mono)', outline: 'none', cursor: 'pointer' },
  runBtn: { background: 'linear-gradient(135deg, var(--teal) 0%, #00A080 100%)', color: '#000', border: 'none', padding: '12px 32px', borderRadius: 8, fontSize: 14, fontFamily: 'var(--head)', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' },
  modelCards: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 32 },
  modelCard: { background: 'var(--card)', borderRadius: 12, padding: '16px 12px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: 6 },
  mIcon: { fontSize: 24 },
  mName: { fontFamily: 'var(--head)', fontSize: 12, fontWeight: 700, color: 'var(--text)' },
  mType: { fontSize: 10, fontFamily: 'var(--mono)', fontWeight: 600 },
  mDesc: { fontSize: 10, color: 'var(--text3)', lineHeight: 1.4 },
  loadingBox: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 60, display: 'flex', justifyContent: 'center', marginTop: 24 },
  loadingInner: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, maxWidth: 400, textAlign: 'center' },
  loadTitle: { fontFamily: 'var(--head)', fontSize: 18, fontWeight: 700, color: 'var(--text)' },
  loadSub: { fontSize: 13, color: 'var(--text2)' },
  loadSteps: { display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 8 },
  loadStep: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--mono)', animation: 'pulse 1.5s ease-in-out infinite' },
  loadDot: { width: 6, height: 6, borderRadius: '50%', background: 'var(--teal)' },
  errorBox: { background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)', borderRadius: 12, padding: 24, display: 'flex', gap: 16, alignItems: 'flex-start', marginTop: 24 },
  errorIcon: { fontSize: 24 },
  errorTitle: { fontFamily: 'var(--head)', fontSize: 16, fontWeight: 700, color: 'var(--red)', marginBottom: 6 },
  errorMsg: { color: 'var(--text2)', fontSize: 13 },
  errorHint: { color: 'var(--text3)', fontSize: 12, fontFamily: 'var(--mono)', marginTop: 8 },
  results: { marginTop: 24 },
  resultHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 28, marginBottom: 16, flexWrap: 'wrap', gap: 16 },
  resultIcon: { fontSize: 28 },
  resultTitle: { fontFamily: 'var(--head)', fontSize: 22, fontWeight: 800, color: 'var(--text)' },
  viewBtn: { background: 'var(--card2)', border: '1px solid var(--border)', color: 'var(--text2)', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--head)', fontSize: 12 },
  metricCards: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 },
  metCard: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, textAlign: 'center' },
  metLabel: { fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'var(--mono)', marginBottom: 10 },
  metVal: { fontFamily: 'var(--mono)', fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 6 },
  metHint: { fontSize: 11, color: 'var(--text2)' },
  chartGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16, marginBottom: 16 },
  chartBox: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 },
  chartBoxTitle: { fontFamily: 'var(--head)', fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 },
  featCard: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16 },
  hybridBox: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 },
  hybridGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 },
  hybridCard: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 },
}
