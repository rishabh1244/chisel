export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const TOKEN_KEY = 'chisel_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const config = {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
  }

  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  const res = await fetch(`${API_URL}${path}`, config)

  let data = {}
  try {
    data = await res.json()
  } catch {
    data = {}
  }

  if (!res.ok) {
    const error = new Error(
      data.error || data.message || `Request failed with status ${res.status}`
    )
    error.status = res.status
    throw error
  }

  return data
}

export const api = {
  // Auth
  login: (username, password) =>
    request('/api/auth/login', { method: 'POST', body: { username, password } }),
  signup: (username, password) =>
    request('/api/auth/signup', { method: 'POST', body: { username, password } }),

  // Projects
  getProjects: () => request('/api/projects/all'),
  getCreatedProjects: () => request('/api/projects/created'),
  getInvolvedProjects: () => request('/api/projects/involved'),
  createProject: (data) =>
    request('/api/workspace/createProject', { method: 'POST', body: data }),
  editProject: (data) =>
    request('/api/workspace/editProject', { method: 'POST', body: data }),
  deleteProject: (projectId) =>
    request('/api/workspace/deleteProject', { method: 'POST', body: { projectId } }),

  // Issues
  getProjectIssues: (projectId) => request(`/api/issues/project/${projectId}`),
  getProjectTeam: (projectId) => request(`/api/projects/${projectId}/team`),
  createIssue: (data) =>
    request('/api/issues/createIssue', { method: 'POST', body: data }),
  async createIssueWithImage({ projectId, title, description, image, assignedTo, status }) {
    const token = getToken()
    const formData = new FormData()
    formData.append('projectId', projectId)
    formData.append('title', title)
    formData.append('description', description || '')
    if (assignedTo) formData.append('assignedTo', assignedTo)
    if (status) formData.append('status', status)
    if (image) formData.append('image', image)

    const res = await fetch(`${API_URL}/api/issues/createIssue`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })

    let data = {}
    try {
      data = await res.json()
    } catch {
      data = {}
    }

    if (!res.ok) {
      const error = new Error(
        data.error || data.message || `Request failed with status ${res.status}`
      )
      error.status = res.status
      throw error
    }

    return data
  },
  editIssue: (data) =>
    request('/api/issues/editIssue', { method: 'POST', body: data }),

  // Comments
  getIssueComments: (issueId) => request(`/api/comments/issue/${issueId}`),
  createComment: (data) =>
    request('/api/comments/createComment', { method: 'POST', body: data }),
  editComment: (data) =>
    request('/api/comments/editComment', { method: 'POST', body: data }),
  deleteComment: (commentId) =>
    request('/api/comments/deleteComment', { method: 'DELETE', body: { commentId } }),

  // Chisels
  getProjectChisels: (projectId) => request(`/api/chisel/project/${projectId}`),
  createChisel: (data) =>
    request('/api/chisel/commit', { method: 'POST', body: data }),

  // Blueprint (LLM)
  convertBlueprint: (data) =>
    request('/api/blueprint/convert', { method: 'POST', body: data }),
  getProjectBlueprint: (projectId) =>
    request(`/api/blueprint/project/${projectId}`),
  async uploadBlueprint(projectId, file) {
    const token = getToken()
    const formData = new FormData()
    formData.append('projectId', projectId)
    formData.append('image', file)

    const res = await fetch(`${API_URL}/api/blueprint/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })

    let data = {}
    try {
      data = await res.json()
    } catch {
      data = {}
    }

    if (!res.ok) {
      const error = new Error(
        data.error || data.message || `Request failed with status ${res.status}`
      )
      error.status = res.status
      throw error
    }

    return data
  },
}

export default api
