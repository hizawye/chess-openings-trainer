import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import PlaygroundPage from './pages/PlaygroundPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<PlaygroundPage />} />
        <Route path="train" element={<div className="flex items-center justify-center" style={{ height: '100%' }}><h2>Training Mode (Coming Soon)</h2></div>} />
        <Route path="settings" element={<div className="flex items-center justify-center" style={{ height: '100%' }}><h2>Settings (Coming Soon)</h2></div>} />
      </Route>
    </Routes>
  )
}

export default App
