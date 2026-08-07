import React, { createContext, useContext, useState, useCallback } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { api, getToken, setToken } from '../api/client'

const USER_KEY = 'chisel_user'

const AuthContext = createContext(null)

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(getToken())
  const [user, setUser] = useState(readStoredUser)

  const persist = useCallback((authData) => {
    setToken(authData.token)
    setTokenState(authData.token)
    localStorage.setItem(USER_KEY, JSON.stringify(authData.user))
    setUser(authData.user)
  }, [])

  const login = useCallback(
    async (username, password) => {
      const data = await api.login(username, password)
      persist(data)
      return data.user
    },
    [persist]
  )

  const signup = useCallback(
    async (username, password) => {
      const data = await api.signup(username, password)
      persist(data)
      return data.user
    },
    [persist]
  )

  const logout = useCallback(() => {
    setToken(null)
    setTokenState(null)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token),
    login,
    signup,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}

export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}
