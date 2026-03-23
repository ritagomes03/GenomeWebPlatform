import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import SpeciesList from './pages/SpeciesList'
import SpeciesDetail from './pages/SpeciesDetail'
import SequenceAnalysis from './pages/SequenceAnalysis'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/species" element={<SpeciesList />} />
        <Route path="/species/:id" element={<SpeciesDetail />} />
        <Route path="/analysis" element={<SequenceAnalysis />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}