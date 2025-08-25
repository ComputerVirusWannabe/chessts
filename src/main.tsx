import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeProvider.tsx'
import Board from './Board.tsx'
import { BoardProvider } from './context/BoardContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
     <ThemeProvider>
      <BoardProvider>
        <Board />
      </BoardProvider>
    </ThemeProvider>
  </StrictMode>,
)
