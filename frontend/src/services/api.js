import axios from 'axios'

const BASE = 'http://localhost:8000/api'
const api = axios.create({ baseURL: BASE, timeout: 120000 })

export const marketAPI = {
  getOverview: () => api.get('/market/overview').then(r => r.data),
  getTopGainers: (n=10) => api.get(`/market/top-gainers?n=${n}`).then(r => r.data),
  getTopLosers: (n=10) => api.get(`/market/top-losers?n=${n}`).then(r => r.data),
  getMostActive: (n=10) => api.get(`/market/most-active?n=${n}`).then(r => r.data),
  getNews: (limit=20) => api.get(`/market/news?limit=${limit}`).then(r => r.data),
  getSectors: () => api.get('/market/sectors').then(r => r.data),
  getSectorStocks: (sector) => api.get(`/market/sector/${sector}`).then(r => r.data),
  search: (q) => api.get(`/market/search?query=${encodeURIComponent(q)}`).then(r => r.data),
}

export const companyAPI = {
  getCompany: (symbol) => api.get(`/company/${symbol}`).then(r => r.data),
  getPeers: (symbol) => api.get(`/company/sector/${symbol}`).then(r => r.data),
}

export const chartAPI = {
  getChart: (symbol, period='1y') => api.get(`/chart-data/${symbol}?period=${period}`).then(r => r.data),
}

export const sentimentAPI = {
  getSentiment: (symbol) => api.get(`/sentiment/${symbol}`).then(r => r.data),
}

export const modelAPI = {
  getModels: () => api.get('/predict/models').then(r => r.data),
  predict: (symbol, model) => api.get(`/predict/${symbol}?model=${model}`).then(r => r.data),
}

export const healthAPI = {
  check: () => api.get('/health').then(r => r.data),
}
