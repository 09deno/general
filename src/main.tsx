import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import '@fontsource/sora/300.css'
import '@fontsource/sora/400.css'
import '@fontsource/sora/600.css'
import './styles/global.css'
import App from './App'

// Nová verzia appky sa stiahne na pozadí a appka sa hneď sama znovu načíta – nikto nemusí nič obnovovať.
registerSW({
  immediate: true,
  onRegisteredSW(_url, registration) {
    // appka na ploche telefónu sa často len prebudí z pozadia – vtedy skontroluj, či nie je nová verzia
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') registration?.update()
    })
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
