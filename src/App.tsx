import {  useContext, useState } from 'react'
import './App.css'
import { ThemeContext } from './context/ThemeContext';

function App() {
  const [count, setCount] = useState<number>(0);
  const themeContext = useContext(ThemeContext);
  if (!themeContext) {
    throw new Error('ThemeContext is not provided');
  }
  const { theme, toggleTheme } = themeContext;
  

  return (
    <>
      <div className="card">
        <div>THEMEEEE {theme}</div>
        <button onClick={() => setCount((count) => count + 1)}>
          count rrr is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
