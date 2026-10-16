import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

const TOKEN_STORAGE_KEY = 'vanta_auth_token'
const USER_STORAGE_KEY = 'vanta_auth_user'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY) || null
    } catch {
      return null
    }
  })

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState('signin') // 'signin' | 'signup' | 'admin'
  const [authNotification, setAuthNotification] = useState(null)

  const showNotification = useCallback((message, type = 'success') => {
    setAuthNotification({ message, type })
    setTimeout(() => {
      setAuthNotification(null)
    }, 4000)
  }, [])

  // Persist session to localStorage
  const saveSession = useCallback((newToken, newUser) => {
    setToken(newToken)
    setUser(newUser)
    try {
      if (newToken) {
        localStorage.setItem(TOKEN_STORAGE_KEY, newToken)
      } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
      }

      if (newUser) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser))
      } else {
        localStorage.removeItem(USER_STORAGE_KEY)
      }
    } catch (e) {
      console.error('Failed to access localStorage:', e)
    }
  }, [])

  // Verify stored session with backend on load
  useEffect(() => {
    if (!token) {
      setIsAuthChecking(false)
      return
    }

    fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setUser(data.user)
          try {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user))
          } catch {}
        } else {
          // Token invalid or expired, clear
          saveSession(null, null)
        }
      })
      .catch(() => {
        // Offline or connection error, preserve local session
      })
      .finally(() => {
        setIsAuthChecking(false)
      })
  }, [token, saveSession])

  // Customer Login
  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Login failed')
    }

    saveSession(data.token, data.user)
    showNotification(data.message || `Welcome back, ${data.user.name}!`)
    setAuthModalOpen(false)
    return data.user
  }

  // Customer Signup
  const signup = async (name, email, password, phone) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone })
    })
    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Signup failed')
    }

    saveSession(data.token, data.user)
    showNotification(data.message || 'Account created! Welcome to VANTA.')
    setAuthModalOpen(false)
    return data.user
  }

  // Staff Admin Login
  const adminLogin = async (email, password) => {
    const res = await fetch('/api/auth/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Admin authentication failed')
    }

    saveSession(data.token, data.user)
    showNotification('Staff clearance verified. Welcome to VANTA HQ Control.')
    setAuthModalOpen(false)
    return data.user
  }

  // Logout
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}

    const wasAdmin = user?.role === 'admin'
    saveSession(null, null)
    showNotification(wasAdmin ? 'Staff admin signed out.' : 'You have been signed out.')
  }

  const openAuthModal = useCallback((mode = 'signin') => {
    setAuthModalMode(mode)
    setAuthModalOpen(true)
  }, [])

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false)
  }, [])

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAdmin,
        isAuthChecking,
        authModalOpen,
        authModalMode,
        authNotification,
        setAuthModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        signup,
        adminLogin,
        logout,
        showNotification
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
