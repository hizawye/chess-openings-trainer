import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<div className="flex items-center justify-center" style={{ height: '100%' }}><h1>Chess Openings Trainer</h1></div>} />
      </Route>
    </Routes>
  )
}

export default App
