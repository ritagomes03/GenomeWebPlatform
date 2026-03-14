import { useState } from 'react'
import './App.css'
import Home from './pages/Home'
import SpeciesList from './pages/SpeciesList'
import SpeciesDetail from './pages/SpeciesDetail'

export default function App() {
  const [page, setPage] = useState('home')
  const [selectedId, setSelectedId] = useState(null)
  const [initialQuery, setInitialQuery] = useState('')

  function navigate(target, id = null, query = '') {
    setPage(target)
    setSelectedId(id)
    setInitialQuery(query)
  }

  return (
    <>
      {page === 'home' && <Home onNavigate={navigate} />}
      {page === 'list' && (
        <SpeciesList
          onNavigate={navigate}
          initialQuery={initialQuery}
        />
      )}
      {page === 'detail' && (
        <SpeciesDetail
          id={selectedId}
          onNavigate={navigate}
        />
      )}
    </>
  )
}
