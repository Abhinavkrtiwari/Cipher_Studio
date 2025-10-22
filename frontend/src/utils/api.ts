const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export interface ApiResponse<T = any> {
  success?: boolean
  data?: T
  message?: string
  project?: T
  projectId?: string
  user?: {
    id: string
    name: string
    email?: string
  }
  token?: string
}

export class ApiError extends Error {
  status: number | null
  body: any

  constructor(message: string, status: number | null = null, body: any = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T> | null> {
    const url = `${this.baseURL}${endpoint}`

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    }

    const response = await fetch(url, config)

    // Read text and try to parse JSON; tolerate empty bodies
    const text = await response.text()
    let data: any = null
    if (text) {
      try {
        data = JSON.parse(text)
      } catch (err) {
        data = null
      }
    }

    if (!response.ok) {
      const message = data?.message || `HTTP error! status: ${response.status}`
      throw new ApiError(message, response.status, data)
    }

    return data as ApiResponse<T> | null
  }

  async get<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T = any>(endpoint: string, data?: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T = any>(endpoint: string, data?: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

export const projectApi = {
  async createProject(projectData: { name: string; files: any[]; settings: any }) {
    return apiClient.post('/projects', projectData)
  },

  async getProject(projectId: string) {
    return apiClient.get(`/projects/${projectId}`)
  },

  async updateProject(projectId: string, projectData: any) {
    return apiClient.put(`/projects/${projectId}`, projectData)
  },

  async deleteProject(projectId: string) {
    return apiClient.delete(`/projects/${projectId}`)
  },

  async getAllProjects(limit = 10, offset = 0) {
    return apiClient.get(`/projects?limit=${limit}&offset=${offset}`)
  },
}
