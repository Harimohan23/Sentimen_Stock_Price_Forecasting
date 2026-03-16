import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { marketAPI } from '../services/api'

const SECTOR_COLORS = {
  IT: '#4C9BE8', Banking: '#FFB700', Pharma: '#2ED573', Auto: '#FF6B6B',
  FMCG: '#A29BFE', Energy: '#FF9F43', Metals: '#74B9FF', Infrastructure: '#FD79A8',
  Telecom: '#00CEC9', RealEstate: '#6C5CE7'
}

export default function SectorPage() {
  const { name } = useParams()
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const nav = useNavigate()
  const color = SECTOR_COLORS[name] || '#FFB700'

  useEffect(() => {
    marketAPI.getSectorStocks(name).then(d => { setStocks(d); setLoading(false) })
  }, [name])

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <button onClick={() => nav(-1)} style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text2)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 12 }}>← Back</button>
        <div>
          <h1 style={{ fontFamily: 'var(--head)', fontSize: 28, fontWeight: 800, color }}>{name} Sector</h1>
          <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>{stocks.length} stocks listed</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: color, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {stocks.map(s => (
            <button key={s.symbol} style={S.card} onClick={() => nav(`/company/${s.symbol}`)}>
              <div style={S.cardTop}>
                <div>
                  <div style={{ ...S.sym, color }}>{s.symbol.replace('.NS', '')}</div>
                  <div style={S.name}>{s.name}</div>
                </div>
                <div style={S.pctBadge(s.change_pct)}>
                  {s.change_pct >= 0 ? '+' : ''}{s.change_pct?.toFixed(2)}%
                </div>
              </div>
              <div style={S.cardBottom}>
                <div>
                  <div style={S.priceLabel}>Price</div>
                  <div style={S.price}>₹{s.current_price?.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div style={S.priceLabel}>Volume</div>
                  <div style={S.price}>{(s.volume / 1000).toFixed(0)}K</div>
                </div>
                <div>
                  <div style={S.priceLabel}>Change</div>
                  <div style={{ ...S.price, color: s.change >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {s.change >= 0 ? '+' : ''}₹{s.change?.toFixed(2)}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const S = {
  card: {
    background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12,
    padding: 20, cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.2s, transform 0.15s',
    display: 'flex', flexDirection: 'column', gap: 16,
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  sym: { fontFamily: 'var(--mono)', fontSize: 15, fontWeight: 700 },
  name: { fontSize: 11, color: 'var(--text3)', marginTop: 3 },
  pctBadge: (pct) => ({
    fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700,
    padding: '4px 10px', borderRadius: 6,
    background: pct >= 0 ? 'rgba(46,213,115,0.12)' : 'rgba(255,71,87,0.12)',
    color: pct >= 0 ? 'var(--green)' : 'var(--red)',
  }),
  cardBottom: { display: 'flex', justifyContent: 'space-between' },
  priceLabel: { fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  price: { fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text)' },
}
