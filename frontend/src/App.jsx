import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar.jsx'
import Hero from './components/Hero/Hero.jsx'
import TrustBar from './components/TrustBar/TrustBar.jsx'
import LoginPanel from './components/LoginPanel/LoginPanel.jsx'
import DashboardPreview from './components/DashboardPreview/DashboardPreview.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import Projects from './pages/Projects/Projects.jsx'
import Team from './pages/Team/Team.jsx'
import AuthPage from './pages/Auth/AuthPage.jsx'
import { ProtectedRoute, useAuth } from './context/AuthContext.jsx'
import './App.css'

function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <TrustBar />
      <section id="login" className="showcase">
        <LoginPanel />
        <DashboardPreview />
      </section>
    </>
  )
}

function HomeRoute() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) {
    return <Navigate to="/projects" replace />
  }
  return <LandingPage />
}

function GuestRoute({ children }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) {
    return <Navigate to="/projects" replace />
  }
  return children
}

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <AuthPage mode="login" />
            </GuestRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <GuestRoute>
              <AuthPage mode="signup" />
            </GuestRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/:projectId?"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/team/:projectId?"
          element={
            <ProtectedRoute>
              <Team />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}

export default App
