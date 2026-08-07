import { useEffect, useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { api } from '../../api/client'
import { SAMPLE_IMAGES } from '../../utils/sampleImages'

function ProjectModal({ open, mode = 'create', project, onClose, onSaved }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState(SAMPLE_IMAGES[0].src)
  const [customImage, setCustomImage] = useState('')
  const [status, setStatus] = useState('inProgress')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && project) {
        setTitle(project.title || '')
        setDescription(project.description || '')
        setStatus(project.status || 'inProgress')
        setCustomImage('')
      } else {
        setTitle('')
        setDescription('')
        setStatus('inProgress')
        setCustomImage('')
        setImage(SAMPLE_IMAGES[0].src)
      }
      setError('')
    }
  }, [open, mode, project])

  if (!open) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!title.trim()) {
      setError('Project title is required')
      return
    }
    setLoading(true)
    try {
      if (mode === 'create') {
        const imageLink = customImage.trim() || image
        await api.createProject({
          title: title.trim(),
          description: description.trim(),
          imageLink,
        })
      } else {
        await api.editProject({
          projectId: project._id,
          title: title.trim(),
          description: description.trim(),
          status,
        })
      }
      onSaved(mode === 'create' ? 'Project created successfully' : 'Project updated successfully')
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">
            {mode === 'create' ? 'New Project' : 'Edit Project'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Skyline Towers"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the project…"
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            />
          </div>

          {mode === 'create' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Cover image
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {SAMPLE_IMAGES.map((img) => (
                    <button
                      type="button"
                      key={img.id}
                      onClick={() => { setImage(img.src); setCustomImage('') }}
                      className={`relative rounded-lg overflow-hidden h-16 border-2 transition ${
                        image === img.src && !customImage
                          ? 'border-amber-500'
                          : 'border-transparent hover:border-slate-300'
                      }`}
                      title={img.label}
                    >
                      <img src={img.src} alt={img.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <input
                  type="url"
                  value={customImage}
                  onChange={(e) => setCustomImage(e.target.value)}
                  placeholder="…or paste an image URL"
                  className="mt-2 w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </>
          )}

          {mode === 'edit' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="inProgress">In Progress</option>
                <option value="active">Active</option>
                <option value="onHold">On Hold</option>
                <option value="planning">Planning</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}

          {error && (
            <div className="px-3 py-2.5 rounded-lg bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-60 inline-flex items-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {mode === 'create' ? 'Create Project' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProjectModal
