import React, { useState, useEffect, useRef } from 'react'
import logo from '../../assets/logo.png'
import defaultAvatar from '/assets/default-avatar.svg'
import './styles/Navbar.css'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, X, LogOut, FolderKanban, LayoutDashboard, ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

function Navbar() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()

  const [solutionsOpen, setSolutionsOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [changelogModalOpen, setChangelogModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const solutionsRef = useRef(null)
  const resourcesRef = useRef(null)
  const userMenuRef = useRef(null)

  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  const smoothScrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/')
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (solutionsRef.current && !solutionsRef.current.contains(event.target)) {
        setSolutionsOpen(false)
      }
      if (resourcesRef.current && !resourcesRef.current.contains(event.target)) {
        setResourcesOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    setUserMenuOpen(false)
    logout()
    navigate('/')
  }

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: 'var(--color-navy-950)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 500,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={18} color="#22a55e" /> {toastMessage}
        </div>
      )}

      {/* Changelog Modal */}
      {changelogModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '28px', width: '420px', boxShadow: '0 20px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>What&apos;s New in Chisel</h3>
              <X size={18} style={{ cursor: 'pointer' }} onClick={() => setChangelogModalOpen(false)} />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontWeight: 700, color: 'var(--color-gold-600)', fontSize: '14px', marginBottom: '6px' }}>
                v0.1 (July 2026) — Hackathon Launch
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13.5px', color: 'var(--color-gray-700)', lineHeight: '1.7' }}>
                <li>Chisel &amp; verify workflow</li>
                <li>Issue tracking &amp; assignment</li>
                <li>3D BIM viewer</li>
                <li>Demo account login</li>
              </ul>
            </div>

            <div style={{ borderTop: '1px solid var(--color-gray-200)', paddingTop: '16px', fontSize: '12px', color: 'var(--color-gray-500)', marginBottom: '16px' }}>
              Built at Kaya AI × IIT India Hackathon 2026
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn--primary" onClick={() => setChangelogModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <header className="navbar">
        <div className="navbar__container">
          <div className="navbar__logo">
            <Link to="/">
              <img className="navbar__logo-img" src={logo} alt="Chisel" />
            </Link>
          </div>

          <nav className="navbar__links">
            <a href="#features" onClick={(e) => { e.preventDefault(); smoothScrollTo('features'); }}>
              Features
            </a>
            
            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); smoothScrollTo('how-it-works'); }}>
              How it Works
            </a>

            {/* Solutions Dropdown */}
            <div ref={solutionsRef} style={{ position: 'relative' }}>
              <div 
                className="navbar__dropdown" 
                onClick={() => { setSolutionsOpen(!solutionsOpen); setResourcesOpen(false); }}
              >
                <a>Solutions</a>
                <span className="navbar__chevron">▾</span>
              </div>

              {solutionsOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '12px',
                  width: '520px',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--color-gray-200)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                  zIndex: 50,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  padding: '20px',
                  gap: '20px'
                }}>
                  {/* Left Column: By Role */}
                  <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-gray-500)', fontWeight: 700, marginBottom: '12px' }}>
                      By Role
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div 
                        style={{ cursor: 'pointer' }} 
                        onClick={() => { setSolutionsOpen(false); smoothScrollTo('features'); }}
                      >
                        <div style={{ fontWeight: 600, fontSize: '13.5px' }}>👷 Field Workers</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--color-gray-500)', marginTop: '2px' }}>Build a verifiable portfolio of your completed work</div>
                      </div>

                      <div 
                        style={{ cursor: 'pointer' }} 
                        onClick={() => { setSolutionsOpen(false); smoothScrollTo('features'); }}
                      >
                        <div style={{ fontWeight: 600, fontSize: '13.5px' }}>🏗️ Site Supervisors</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--color-gray-500)', marginTop: '2px' }}>Review and approve work remotely from photo evidence</div>
                      </div>

                      <div 
                        style={{ cursor: 'pointer' }} 
                        onClick={() => { setSolutionsOpen(false); smoothScrollTo('features'); }}
                      >
                        <div style={{ fontWeight: 600, fontSize: '13.5px' }}>📋 Project Managers</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--color-gray-500)', marginTop: '2px' }}>Track progress, accountability, and rework at scale</div>
                      </div>

                      <div 
                        style={{ cursor: 'pointer' }} 
                        onClick={() => { setSolutionsOpen(false); smoothScrollTo('features'); }}
                      >
                        <div style={{ fontWeight: 600, fontSize: '13.5px' }}>🏢 Contractors &amp; Firms</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--color-gray-500)', marginTop: '2px' }}>Prove quality of work for bids, audits, and disputes</div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: By Project Type */}
                  <div style={{ borderLeft: '1px solid var(--color-gray-100)', paddingLeft: '20px' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-gray-500)', fontWeight: 700, marginBottom: '12px' }}>
                      By Project Type
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ cursor: 'pointer', fontWeight: 600, fontSize: '13.5px' }} onClick={() => { setSolutionsOpen(false); smoothScrollTo('features'); }}>
                        🏠 Residential Construction
                      </div>
                      <div style={{ cursor: 'pointer', fontWeight: 600, fontSize: '13.5px' }} onClick={() => { setSolutionsOpen(false); smoothScrollTo('features'); }}>
                        🏢 Commercial Buildings
                      </div>
                      <div style={{ cursor: 'pointer', fontWeight: 600, fontSize: '13.5px' }} onClick={() => { setSolutionsOpen(false); smoothScrollTo('features'); }}>
                        🌉 Infrastructure Projects
                      </div>
                      <div style={{ cursor: 'pointer', fontWeight: 600, fontSize: '13.5px' }} onClick={() => { setSolutionsOpen(false); smoothScrollTo('features'); }}>
                        🏭 Industrial Facilities
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <a href="#pricing" onClick={(e) => { e.preventDefault(); smoothScrollTo('pricing'); }}>
              Pricing
            </a>

            {/* Resources Dropdown */}
            <div ref={resourcesRef} style={{ position: 'relative' }}>
              <div 
                className="navbar__dropdown" 
                onClick={() => { setResourcesOpen(!resourcesOpen); setSolutionsOpen(false); }}
              >
                <a>Resources</a>
                <span className="navbar__chevron">▾</span>
              </div>

              {resourcesOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '12px',
                  width: '300px',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--color-gray-200)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                  zIndex: 50,
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <div 
                    style={{ padding: '10px 12px', borderRadius: '6px', cursor: 'pointer' }}
                    onClick={() => { setResourcesOpen(false); triggerToast('Documentation coming soon'); }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-gray-50)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                  >
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>📖 Documentation</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>How to set up Chisel for your project</div>
                  </div>

                  <div 
                    style={{ padding: '10px 12px', borderRadius: '6px', cursor: 'pointer' }}
                    onClick={() => { setResourcesOpen(false); triggerToast('Guide coming soon'); }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-gray-50)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                  >
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>🎓 Getting Started Guide</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>Your first chisel in under 5 minutes</div>
                  </div>

                  <div 
                    style={{ padding: '10px 12px', borderRadius: '6px', cursor: 'pointer' }}
                    onClick={() => { setResourcesOpen(false); triggerToast('Case studies coming soon'); }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-gray-50)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                  >
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>📊 Case Studies</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>How Indian contractors are using Chisel</div>
                  </div>

                  <div 
                    style={{ padding: '10px 12px', borderRadius: '6px', cursor: 'pointer' }}
                    onClick={() => { setResourcesOpen(false); smoothScrollTo('security'); }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-gray-50)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                  >
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>🔒 Security &amp; Trust</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>How we keep your records tamper-evident</div>
                  </div>

                  <div 
                    style={{ padding: '10px 12px', borderRadius: '6px', cursor: 'pointer' }}
                    onClick={() => { setResourcesOpen(false); setChangelogModalOpen(true); }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-gray-50)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                  >
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>📝 Changelog</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>What&apos;s new in Chisel</div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--color-gray-200)', marginTop: '6px', paddingTop: '10px', paddingLeft: '12px', fontSize: '11px', color: 'var(--color-gray-500)' }}>
                    Built at Kaya AI × IIT India Hackathon 2026
                  </div>
                </div>
              )}
            </div>

          </nav>

          <div className="navbar__actions">
            {isAuthenticated ? (
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <button
                  className="navbar__user-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-label="Account menu"
                >
                  <img className="navbar__avatar" src={defaultAvatar} alt="User profile" />
                  <span className="navbar__user-name">
                    {user?.username || 'Account'}
                  </span>
                  <ChevronDown size={14} className="navbar__chevron" />
                </button>

                {userMenuOpen && (
                  <div className="navbar__user-menu">
                    <div className="navbar__user-menu-header">
                      <img className="navbar__avatar" src={defaultAvatar} alt="User profile" />
                      <div>
                        <div className="navbar__user-menu-name">
                          {user?.username || 'User'}
                        </div>
                        <div className="navbar__user-menu-email">Signed in</div>
                      </div>
                    </div>

                    <div
                      className="navbar__user-menu-item"
                      onClick={() => { setUserMenuOpen(false); navigate('/projects'); }}
                    >
                      <FolderKanban size={16} /> My Projects
                    </div>
                    <div
                      className="navbar__user-menu-item"
                      onClick={() => { setUserMenuOpen(false); navigate('/dashboard'); }}
                    >
                      <LayoutDashboard size={16} /> Dashboard
                    </div>
                    <div className="navbar__user-menu-divider" />
                    <div
                      className="navbar__user-menu-item navbar__user-menu-item--danger"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} /> Log out
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn--ghost">Log in</Link>
                <Link to="/signup" className="btn btn--primary">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  )
}

export default Navbar
