import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Loader2, Pencil, Trash2, FolderOpen, CheckCircle2 } from 'lucide-react'
import Navbar from '../../components/Navbar/Navbar.jsx'
import ProjectModal from '../../components/ProjectModal/ProjectModal.jsx'
import { api } from '../../api/client'
import { sampleImageFor } from '../../utils/sampleImages'

const statusTone = {
  inProgress: 'bg-amber-50 text-amber-600',
  active: 'bg-green-50 text-green-600',
  onHold: 'bg-blue-50 text-blue-600',
  planning: 'bg-violet-50 text-violet-600',
  completed: 'bg-emerald-50 text-emerald-600',
}

const statusLabel = {
  inProgress: 'In Progress',
  active: 'Active',
  onHold: 'On Hold',
  planning: 'Planning',
  completed: 'Completed',
}

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function Projects() {
  const navigate = useNavigate()

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [editingProject, setEditingProject] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const loadProjects = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.getProjects()
      setProjects(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const triggerToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const openCreate = () => {
    setModalMode('create')
    setEditingProject(null)
    setModalOpen(true)
  }

  const openEdit = (project) => {
    setModalMode('edit')
    setEditingProject(project)
    setModalOpen(true)
  }

  const handleDelete = async (project) => {
    if (!window.confirm(`Delete project "${project.title}"? This cannot be undone.`)) {
      return
    }
    setDeleting(true)
    try {
      await api.deleteProject(project._id)
      triggerToast('Project deleted')
      loadProjects()
    } catch (err) {
      triggerToast(err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {toast && (
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
          <CheckCircle2 size={18} color="#22a55e" /> {toast}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
            <p className="mt-1 text-slate-500">
              {loading ? 'Loading…' : `${projects.length} project${projects.length === 1 ? '' : 's'} across your workspace`}
            </p>
          </div>
          <button
            onClick={openCreate}
            className="px-4 py-2.5 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 inline-flex items-center gap-2"
          >
            <Plus size={16} /> New Project
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-400">
            <Loader2 size={28} className="animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <FolderOpen size={28} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No projects yet</h3>
            <p className="mt-1 text-slate-500 text-sm max-w-sm">
              Create your first project to start tracking work, issues and changes.
            </p>
            <button
              onClick={openCreate}
              className="mt-5 px-4 py-2.5 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 inline-flex items-center gap-2"
            >
              <Plus size={16} /> New Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                onClick={() => navigate(`/dashboard/${project._id}`, { state: { project } })}
                className="group text-left bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={sampleImageFor(project)}
                    alt={`${project.title} preview`}
                    className="w-full h-full object-cover"
                  />
                  <span
                    className={`absolute top-3 right-3 text-xs font-medium px-2.5 py-1 rounded-full ${
                      statusTone[project.status] || statusTone.inProgress
                    }`}
                  >
                    {statusLabel[project.status] || project.status}
                  </span>

                  <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEdit(project) }}
                      className="bg-white/95 backdrop-blur px-2.5 py-2 rounded-lg text-slate-700 hover:text-amber-600 shadow-sm"
                      aria-label="Edit project"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(project) }}
                      disabled={deleting}
                      className="bg-white/95 backdrop-blur px-2.5 py-2 rounded-lg text-slate-700 hover:text-red-600 shadow-sm disabled:opacity-50"
                      aria-label="Delete project"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-semibold text-slate-900 truncate">{project.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-500 line-clamp-2">
                    {project.description || 'No description provided'}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    Created {formatDate(project.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ProjectModal
        open={modalOpen}
        mode={modalMode}
        project={editingProject}
        onClose={() => setModalOpen(false)}
        onSaved={(msg) => { triggerToast(msg); loadProjects() }}
      />
    </div>
  )
}

export default Projects
