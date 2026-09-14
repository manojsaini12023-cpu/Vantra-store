import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CurrencyProvider } from './CurrencyContext'
import { AuthProvider } from './AuthContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CurrencyProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </CurrencyProvider>
  </StrictMode>,
)
