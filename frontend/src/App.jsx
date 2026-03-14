import { useState } from 'react'
import Home from './pages/Home'
import SpeciesList from './pages/SpeciesList'
import SpeciesDetail from './pages/SpeciesDetail'

export default function App() {
  const [page, setPage]           = useState('home')
  const [selectedId, setSelectedId] = useState(null)
  const [initialQuery, setInitialQuery] = useState('')

  function navigate(target, id = null, query = '') {
    setPage(target)
    setSelectedId(id)
    setInitialQuery(query)
    window.scrollTo(0, 0)
  }

  return (
    <>
      {page === 'home'   && <Home navigate={navigate} />}
      {page === 'list'   && <SpeciesList navigate={navigate} initialQuery={initialQuery} />}
      {page === 'detail' && <SpeciesDetail id={selectedId} navigate={navigate} />}
    </>
  )
}
