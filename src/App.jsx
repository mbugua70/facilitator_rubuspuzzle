import { Route, Routes } from 'react-router-dom'
import { CreateGamePage } from './pages/CreateGamePage'
import { ControlPage } from './pages/ControlPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<CreateGamePage />} />
      <Route path="/control/:gameCode" element={<ControlPage />} />
    </Routes>
  )
}

export default App
