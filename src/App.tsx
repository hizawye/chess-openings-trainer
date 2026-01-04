import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import OpeningsPage from './pages/OpeningsPage'
import TrainingPage from './pages/TrainingPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<OpeningsPage />} />
        <Route path="train/:openingId/:variationId" element={<TrainingPage />} />
        <Route path="settings" element={<div className="flex items-center justify-center" style={{ height: '100%' }}><h2>Settings (Coming Soon)</h2></div>} />
      </Route>
    </Routes>
  )
}

export default App
