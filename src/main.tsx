import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource/barlow/400.css'
import '@fontsource/barlow/600.css'
import '@fontsource/barlow-condensed/700.css'
import '@fontsource/barlow-condensed/800.css'
import './styles/global.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
