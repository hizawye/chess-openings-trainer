import { Routes, Route } from 'react-router-dom'
import { ProgressProvider } from './context/ProgressContext'
import { RepertoireProvider } from './context/RepertoireContext'
import Layout from './components/layout/Layout'
import OpeningsPage from './pages/OpeningsPage'
import PlayPage from './pages/PlayPage'

function App() {
  return (
    <ProgressProvider>
      <RepertoireProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<OpeningsPage />} />
            <Route path="train/:openingId/:variationId" element={<PlayPage />} />
            <Route path="settings" element={<div className="flex items-center justify-center" style={{ height: '100%' }}><h2>Settings (Coming Soon)</h2></div>} />
          </Route>
        </Routes>
      </RepertoireProvider>
    </ProgressProvider>
  )
}

export default App
