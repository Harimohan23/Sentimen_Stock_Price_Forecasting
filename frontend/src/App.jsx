import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import MarketPage from './pages/MarketPage'
import CompanyPage from './pages/CompanyPage'
import SectorPage from './pages/SectorPage'
import PredictPage from './pages/PredictPage'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/market" element={<MarketPage />} />
        <Route path="/company/:symbol" element={<CompanyPage />} />
        <Route path="/sector/:name" element={<SectorPage />} />
        <Route path="/predict" element={<PredictPage />} />
        <Route path="/predict/:symbol" element={<PredictPage />} />
      </Routes>
    </BrowserRouter>
  )
}
