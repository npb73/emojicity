import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { StrictMode } from 'react'
import './Styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
