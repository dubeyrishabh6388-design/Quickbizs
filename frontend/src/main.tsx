import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { setupFetchInterceptor } from './utils/setupFetchInterceptor'

// Ensure default theme is Light unless user explicitly toggled it to 'dark'
try {
  const savedTheme = localStorage.getItem('qb_theme');
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
    if (!savedTheme) {
      localStorage.setItem('qb_theme', 'light');
    }
  }
} catch (e) {
  document.documentElement.classList.remove('dark');
  document.body.classList.remove('dark');
}

// Initialize transparent end-to-end payload encryption & response decryption for fetch()
setupFetchInterceptor();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
