import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeProvider.tsx'
import { BoardProvider } from './context/BoardContext.tsx'
import { BrowserRouter as Router } from 'react-router-dom'
import StartGame from './components/StartGame.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <BoardProvider>
        <Router>
          <App/>
        </Router>
      </BoardProvider>
    </ThemeProvider>
  </StrictMode>,
)