import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import SpeciesList from './pages/SpeciesList'
import SpeciesDetail from './pages/SpeciesDetail'
import SequenceAnalysis from './pages/SequenceAnalysis'
import Documentation from './pages/Documentation'
import { usePageAnalytics } from './hooks/useTelemetry'
import ContactPage from "./pages/ContactPage";


function AppRoutes() {
  usePageAnalytics()

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/species" element={<SpeciesList />} />
      <Route path="/species/:id" element={<SpeciesDetail />} />
      <Route path="/analysis" element={<SequenceAnalysis />} />
      <Route path="/documentation" element={<Documentation />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/contact" element={<ContactPage />} />
    </Routes>
  )
}


export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}