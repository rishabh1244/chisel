import Navbar from '../../components/Navbar/Navbar.jsx'
import LoginPanel from '../../components/LoginPanel/LoginPanel.jsx'

function AuthPage({ mode = 'login' }) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <LoginPanel mode={mode} standalone />
    </div>
  )
}

export default AuthPage
