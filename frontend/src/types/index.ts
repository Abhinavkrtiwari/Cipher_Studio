export interface ProjectFile {
  id: string
  name: string
  content: string
  type: 'component' | 'style' | 'config' | 'other'
  path: string
  isOpen?: boolean
  isActive?: boolean
}

export interface Project {
  id: string
  name: string
  files: ProjectFile[]
  activeFileId?: string
  createdAt: Date
  updatedAt: Date
  settings: {
    theme: 'light' | 'dark'
    autosave: boolean
    fontSize: number
  }
}

export interface EditorState {
  activeFileId: string | null
  openFiles: string[]
  sidebarCollapsed: boolean
  previewVisible: boolean
}

export interface SandpackTemplate {
  template: 'react' | 'react-ts' | 'vanilla' | 'vanilla-ts'
  files: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

export interface SaveProjectRequest {
  name: string
  files: ProjectFile[]
  settings: Project['settings']
}

export interface SaveProjectResponse {
  success: boolean
  projectId: string
  message?: string
}

export interface LoadProjectResponse {
  success: boolean
  project?: Project
  message?: string
}

