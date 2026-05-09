import { Routes, Route } from 'react-router-dom'
import StartGame from './components/StartGame'
import RulesPage from './components/RulesPage'
import Board from './components/Board'

function App() {
  return (
    <Routes>
      <Route path="/" element={<StartGame />} />
      <Route path="/rules" element={<RulesPage />} />
    </Routes>
  )
}

export default App