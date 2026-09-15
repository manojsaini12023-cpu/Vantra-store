import { useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import './AuthModal.css'

export function AuthModal({ onAdminSuccess }) {
  const {
    authModalOpen,
    authModalMode,
    setAuthModalMode,
    closeAuthModal,
    login,
    signup,
    adminLogin
  } = useAuth()

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Reset form when modal opens or mode changes
  useEffect(() => {
    setError('')
    setShowPassword(false)
    if (authModalMode === 'admin') {
      setFormData({
        name: '',
        email: 'admin@vanta.com',
        password: '',
        phone: ''
      })
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: ''
      })
    }
  }, [authModalMode, authModalOpen])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && authModalOpen) {
        closeAuthModal()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [authModalOpen, closeAuthModal])

  if (!authModalOpen) return null

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (authModalMode === 'signup') {
        if (!formData.name.trim()) {
          throw new Error('Please enter your full name.')
        }
        if (!formData.email.trim()) {
          throw new Error('Please enter your email address.')
        }
        if (!formData.password || formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters.')
        }
        await signup(formData.name, formData.email, formData.password, formData.phone)
      } else if (authModalMode === 'signin') {
        if (!formData.email.trim() || !formData.password) {
          throw new Error('Please enter both email and password.')
        }
        await login(formData.email, formData.password)
      } else if (authModalMode === 'admin') {
        if (!formData.email.trim() || !formData.password) {
          throw new Error('Please enter admin credentials.')
        }
        await adminLogin(formData.email, formData.password)
        if (onAdminSuccess) {
          onAdminSuccess()
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Quick fill helper for testing
  const handleQuickFillAdmin = () => {
    setFormData((prev) => ({
      ...prev,
      email: 'admin@vanta.com',
      password: 'admin123'
    }))
    setError('')
  }

  const handleQuickFillDemoCustomer = () => {
    setFormData((prev) => ({
      ...prev,
      email: 'customer@vanta.com',
      password: 'password123'
    }))
    setError('')
  }

  return (
    <div className="auth-overlay" onClick={closeAuthModal}>
      <div
        className={`auth-card ${authModalMode === 'admin' ? 'auth-card-admin' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="auth-close-btn"
          onClick={closeAuthModal}
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="auth-header">
          {authModalMode === 'admin' ? (
            <div className="auth-admin-badge-wrap">
              <span className="auth-shield-icon">⚡</span>
              <span className="auth-admin-tag">VANTA HQ SECURITY CLEARANCE</span>
              <h2>Staff Admin Gateway</h2>
              <p className="auth-sub">
                Enter your executive credentials to access catalog and order operations.
              </p>
            </div>
          ) : (
            <div className="auth-brand-wrap">
              <span className="auth-brand-eyebrow">VANTA ARCHIVE // VIP ACCESS</span>
              <h2>{authModalMode === 'signin' ? 'Sign In to Your Account' : 'Create an Account'}</h2>
              <p className="auth-sub">
                {authModalMode === 'signin'
                  ? 'Access your orders, saved collection fits, and priority checkout.'
                  : 'Join the VIP drops list, save favorites, and track live deliveries.'}
              </p>
            </div>
          )}
        </div>

        {/* Tab switchers (only between signin & signup) */}
        {authModalMode !== 'admin' && (
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab-btn ${authModalMode === 'signin' ? 'active' : ''}`}
              onClick={() => {
                setAuthModalMode('signin')
                setError('')
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${authModalMode === 'signup' ? 'active' : ''}`}
              onClick={() => {
                setAuthModalMode('signup')
                setError('')
              }}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="auth-error-banner">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* Form Body */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {authModalMode === 'signup' && (
            <div className="auth-field-group">
              <label htmlFor="auth-name">FULL NAME</label>
              <input
                id="auth-name"
                type="text"
                required
                placeholder="e.g. Alex Vance"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                autoComplete="name"
              />
            </div>
          )}

          <div className="auth-field-group">
            <label htmlFor="auth-email">
              {authModalMode === 'admin' ? 'ADMIN EMAIL' : 'EMAIL ADDRESS'}
            </label>
            <input
              id="auth-email"
              type="email"
              required
              placeholder={authModalMode === 'admin' ? 'admin@vanta.com' : 'name@example.com'}
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              autoComplete="email"
            />
          </div>

          {authModalMode === 'signup' && (
            <div className="auth-field-group">
              <label htmlFor="auth-phone">MOBILE NUMBER (OPTIONAL)</label>
              <input
                id="auth-phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                autoComplete="tel"
              />
            </div>
          )}

          <div className="auth-field-group">
            <div className="auth-label-row">
              <label htmlFor="auth-password">
                {authModalMode === 'admin' ? 'SECURITY PASSWORD' : 'PASSWORD'}
              </label>
              <button
                type="button"
                className="auth-show-pass-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              id="auth-password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder={
                authModalMode === 'admin'
                  ? 'Enter admin password'
                  : authModalMode === 'signup'
                  ? 'Min 6 characters'
                  : 'Enter password'
              }
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              autoComplete={authModalMode === 'signup' ? 'new-password' : 'current-password'}
            />
          </div>

          {/* Admin Helper Button */}
          {authModalMode === 'admin' && (
            <div className="auth-demo-hint">
              <div className="auth-demo-text">
                <small>DEFAULT ADMIN CREDENTIALS:</small>
                <code>admin@vanta.com // admin123</code>
              </div>
              <button
                type="button"
                className="auth-quick-fill-btn"
                onClick={handleQuickFillAdmin}
              >
                ⚡ Auto-Fill Credentials
              </button>
            </div>
          )}

          {/* Customer Demo Helper (In Signin mode) */}
          {authModalMode === 'signin' && (
            <div className="auth-signin-subrow">
              <button
                type="button"
                className="auth-hint-link"
                onClick={handleQuickFillDemoCustomer}
              >
                Fill Demo Customer
              </button>
              <button
                type="button"
                className="auth-hint-link"
                onClick={handleQuickFillAdmin}
              >
                Fill Admin
              </button>
            </div>
          )}

          <button
            type="submit"
            className={`auth-submit-btn ${authModalMode === 'admin' ? 'admin-theme' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <span className="auth-spinner-text">
                <span className="auth-spinner"></span> VERIFYING...
              </span>
            ) : authModalMode === 'admin' ? (
              'UNLOCK ADMIN CONTROL ⚡'
            ) : authModalMode === 'signin' ? (
              'SIGN IN TO ACCOUNT →'
            ) : (
              'CREATE ACCOUNT & JOIN VIP →'
            )}
          </button>
        </form>

        {/* Modal Footer Switchers */}
        <div className="auth-footer">
          {authModalMode === 'admin' ? (
            <div className="auth-switch-prompt">
              <span>Looking for customer portal? </span>
              <button
                type="button"
                className="auth-text-link"
                onClick={() => {
                  setAuthModalMode('signin')
                  setError('')
                }}
              >
                Return to Customer Sign In
              </button>
            </div>
          ) : authModalMode === 'signin' ? (
            <div className="auth-switch-prompt">
              <span>Don't have an account? </span>
              <button
                type="button"
                className="auth-text-link"
                onClick={() => {
                  setAuthModalMode('signup')
                  setError('')
                }}
              >
                Sign up now
              </button>
              <div className="auth-admin-link-row">
                <span>Store manager? </span>
                <button
                  type="button"
                  className="auth-admin-switch-btn"
                  onClick={() => {
                    setAuthModalMode('admin')
                    setError('')
                  }}
                >
                  ⚡ Staff Admin Login
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-switch-prompt">
              <span>Already registered? </span>
              <button
                type="button"
                className="auth-text-link"
                onClick={() => {
                  setAuthModalMode('signin')
                  setError('')
                }}
              >
                Sign in here
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
