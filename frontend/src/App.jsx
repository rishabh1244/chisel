import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar.jsx'
import Hero from './components/Hero/Hero.jsx'
import TrustBar from './components/TrustBar/TrustBar.jsx'
import LoginPanel from './components/LoginPanel/LoginPanel.jsx'
import DashboardPreview from './components/DashboardPreview/DashboardPreview.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import Projects from './pages/Projects/Projects.jsx'
import AuthPage from './pages/Auth/AuthPage.jsx'
import { ProtectedRoute } from './context/AuthContext.jsx'
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

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
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
      </Routes>
    </div>
  )
}

export default App
