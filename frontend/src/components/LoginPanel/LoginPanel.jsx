import { useState } from 'react'
import loginBackground from '../../assets/login-blueprint.png'
import './styles/LoginPanel.css'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function LoginPanel({ mode = 'login', standalone = false }) {
  const navigate = useNavigate()
  const { login, signup } = useAuth()

  const [formMode, setFormMode] = useState(mode)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!username || !password) {
      setError('Please enter a username and password')
      return
    }
    setLoading(true)
    try {
      if (formMode === 'login') {
        await login(username, password)
      } else {
        await signup(username, password)
      }
      navigate('/projects')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDemo = async () => {
    setError('')
    setLoading(true)
    try {
      await login('demo', 'demo1234')
      navigate('/projects')
    } catch (err) {
      setFormMode('signup')
      setUsername('demo')
      setPassword('demo1234')
      setError('Demo account not found — create it below with the prefilled details')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (nextMode) => {
    setFormMode(nextMode)
    setError('')
  }

  const title = formMode === 'login' ? 'Welcome back 👋' : 'Create your account'
  const subtitle =
    formMode === 'login'
      ? 'Log in to continue managing your projects.'
      : 'Sign up to start versioning your infrastructure.'

  return (
    <div className={standalone ? 'login-panel login-panel--standalone' : 'login-panel'}>
      <img className="login-panel__bg" src={loginBackground} alt="Blueprint crane sketch" />
      <div className="login-panel__scrim" />

      <form className="login-card" onSubmit={handleSubmit}>
        <h2 className="login-card__title">{title}</h2>
        <p className="login-card__subtitle">{subtitle}</p>

        <label className="login-field">
          <span className="login-field__icon">👤</span>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </label>

        <label className="login-field">
          <span className="login-field__icon">🔒</span>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={formMode === 'login' ? 'current-password' : 'new-password'}
          />
        </label>

        {error && <div className="login-card__error">{error}</div>}

        <button className="btn btn--primary btn--block btn--lg" type="submit" disabled={loading}>
          {loading ? (formMode === 'login' ? 'Logging in…' : 'Creating account…') : formMode === 'login' ? 'Log in' : 'Sign up'}
        </button>
        <button
          type="button"
          className="btn login-card__demo btn--block"
          onClick={handleDemo}
          disabled={loading}
        >
          Continue with Demo Account
        </button>

        <p className="login-card__signup">
          {formMode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <a
                href="#signup"
                onClick={(e) => {
                  e.preventDefault()
                  switchMode('signup')
                }}
              >
                Sign up
              </a>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <a
                href="#login"
                onClick={(e) => {
                  e.preventDefault()
                  switchMode('login')
                }}
              >
                Log in
              </a>
            </>
          )}
        </p>
      </form>
    </div>
  )
}

export default LoginPanel
