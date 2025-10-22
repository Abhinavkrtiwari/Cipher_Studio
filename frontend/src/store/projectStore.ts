'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Project, ProjectFile, EditorState } from '@/types'
import { apiClient } from '@/utils/api'

interface ProjectStore {
  // Project state
  currentProject: Project | null
  editorState: EditorState
  
  // Actions
  createNewProject: (name?: string) => void
  setCurrentProject: (project: Project) => void
  updateProjectName: (name: string) => void
  
  // File management
  addFile: (file: ProjectFile) => void
  updateFile: (fileId: string, updates: Partial<ProjectFile>) => void
  deleteFile: (fileId: string) => void
  setActiveFile: (fileId: string) => void
  openFile: (fileId: string) => void
  closeFile: (fileId: string) => void
  
  // Editor state
  toggleSidebar: () => void
  togglePreview: () => void
  
  // Settings
  updateSettings: (settings: Partial<Project['settings']>) => void
  
  // Persistence
  saveProjectToStorage: () => void
  loadProjectFromStorage: () => void
  clearProject: () => void
  // Auth
  isAuthenticated: boolean
  user: { id: string; name: string; email?: string } | null
  tokenExpiry: number | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, name: string, password: string) => Promise<boolean>
  logout: () => void
  checkTokenExpiry: () => void
}

const defaultProject: Project = {
  id: 'default',
  name: 'Untitled Project',
  files: [
    {
      id: 'app-js',
      name: 'App.js',
      content: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to CipherStudio!</h1>
        <p>Start editing your React components here.</p>
        <div className="button-container">
          <button 
            onClick={() => alert('Hello from CipherStudio!')}
            className="primary-button"
          >
            Click me!
          </button>
          <button 
            onClick={() => alert('Mobile responsive!')}
            className="secondary-button"
          >
            Test Mobile
          </button>
        </div>
        <div className="features">
          <div className="feature-card">
            <h3>📱 Mobile Responsive</h3>
            <p>Works on all devices</p>
          </div>
          <div className="feature-card">
            <h3>⚡ Live Preview</h3>
            <p>See changes instantly</p>
          </div>
          <div className="feature-card">
            <h3>🎨 Modern UI</h3>
            <p>Beautiful interface</p>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;`,
      type: 'component',
      path: '/App.js',
      isOpen: true,
      isActive: true
    },
    {
      id: 'app-css',
      name: 'App.css',
      content: `.App {
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.App-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
}

.App-header h1 {
  margin-bottom: 20px;
  color: #ffffff;
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.App-header p {
  margin-bottom: 30px;
  font-size: clamp(1rem, 3vw, 1.5rem);
  opacity: 0.9;
  max-width: 600px;
  line-height: 1.6;
}

.button-container {
  display: flex;
  gap: 15px;
  margin-bottom: 40px;
  flex-wrap: wrap;
  justify-content: center;
}

.primary-button, .secondary-button {
  padding: 12px 24px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  min-width: 120px;
}

.primary-button {
  background-color: #007bff;
  color: white;
}

.primary-button:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.secondary-button {
  background-color: transparent;
  color: white;
  border: 2px solid white;
}

.secondary-button:hover {
  background-color: white;
  color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  max-width: 800px;
  width: 100%;
  margin-top: 20px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.feature-card h3 {
  margin: 0 0 10px 0;
  font-size: 1.2rem;
  color: #ffffff;
}

.feature-card p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

/* Mobile Responsive Design */
@media (max-width: 768px) {
  .App-header {
    padding: 15px;
  }
  
  .App-header h1 {
    font-size: 2.5rem;
    margin-bottom: 15px;
  }
  
  .App-header p {
    font-size: 1.1rem;
    margin-bottom: 25px;
    padding: 0 10px;
  }
  
  .button-container {
    flex-direction: column;
    align-items: center;
    gap: 10px;
    margin-bottom: 30px;
  }
  
  .primary-button, .secondary-button {
    width: 200px;
    padding: 14px 20px;
  }
  
  .features {
    grid-template-columns: 1fr;
    gap: 15px;
    padding: 0 10px;
  }
  
  .feature-card {
    padding: 15px;
  }
  
  .feature-card h3 {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .App-header {
    padding: 10px;
  }
  
  .App-header h1 {
    font-size: 2rem;
  }
  
  .App-header p {
    font-size: 1rem;
  }
  
  .primary-button, .secondary-button {
    width: 180px;
    padding: 12px 16px;
    font-size: 14px;
  }
  
  .features {
    padding: 0 5px;
  }
  
  .feature-card {
    padding: 12px;
  }
}`,
      type: 'style',
      path: '/App.css',
      isOpen: false,
      isActive: false
    }
  ],
  activeFileId: 'app-js',
  createdAt: new Date(),
  updatedAt: new Date(),
  settings: {
    theme: 'light',
    autosave: true,
    fontSize: 14
  }
}

const defaultEditorState: EditorState = {
  activeFileId: 'app-js',
  openFiles: ['app-js'],
  sidebarCollapsed: false,
  previewVisible: true
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      currentProject: defaultProject,
      editorState: defaultEditorState,
      // Auth - initialize to false to prevent hydration mismatch
      // Will be loaded from localStorage in loadProjectFromStorage
      isAuthenticated: false,
      user: null,
      tokenExpiry: null,
      
      createNewProject: (name = 'Untitled Project') => {
        const newProject: Project = {
          ...defaultProject,
          id: `project-${Date.now()}`,
          name,
          files: [...defaultProject.files],
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        set({
          currentProject: newProject,
          editorState: defaultEditorState
        })
      },
      
      setCurrentProject: (project) => {
        set({
          currentProject: project,
          editorState: {
            ...defaultEditorState,
            activeFileId: project.activeFileId || project.files[0]?.id || null,
            openFiles: project.files.filter(f => f.isOpen).map(f => f.id)
          }
        })
      },
      
      updateProjectName: (name) => {
        const { currentProject } = get()
        if (currentProject) {
          set({
            currentProject: {
              ...currentProject,
              name,
              updatedAt: new Date()
            }
          })
        }
      },
      
      addFile: (file) => {
        const { currentProject } = get()
        if (currentProject) {
          const updatedProject = {
            ...currentProject,
            files: [...currentProject.files, file],
            updatedAt: new Date()
          }
          
          set({
            currentProject: updatedProject,
            editorState: {
              ...get().editorState,
              openFiles: [...get().editorState.openFiles, file.id],
              activeFileId: file.id
            }
          })
        }
      },
      
      updateFile: (fileId, updates) => {
        const { currentProject } = get()
        if (currentProject) {
          const updatedFiles = currentProject.files.map(file =>
            file.id === fileId ? { ...file, ...updates } : file
          )
          
          set({
            currentProject: {
              ...currentProject,
              files: updatedFiles,
              updatedAt: new Date()
            }
          })
        }
      },
      
      deleteFile: (fileId) => {
        const { currentProject, editorState } = get()
        if (currentProject) {
          const updatedFiles = currentProject.files.filter(file => file.id !== fileId)
          const newOpenFiles = editorState.openFiles.filter(id => id !== fileId)
          const newActiveFileId = editorState.activeFileId === fileId 
            ? (newOpenFiles[0] || null)
            : editorState.activeFileId
            
          set({
            currentProject: {
              ...currentProject,
              files: updatedFiles,
              updatedAt: new Date()
            },
            editorState: {
              ...editorState,
              openFiles: newOpenFiles,
              activeFileId: newActiveFileId
            }
          })
        }
      },
      
      setActiveFile: (fileId) => {
        const { currentProject } = get()
        if (currentProject) {
          const updatedFiles = currentProject.files.map(file => ({
            ...file,
            isActive: file.id === fileId
          }))
          
          set({
            currentProject: {
              ...currentProject,
              files: updatedFiles,
              activeFileId: fileId,
              updatedAt: new Date()
            },
            editorState: {
              ...get().editorState,
              activeFileId: fileId
            }
          })
        }
      },
      
      openFile: (fileId) => {
        const { editorState } = get()
        if (!editorState.openFiles.includes(fileId)) {
          set({
            editorState: {
              ...editorState,
              openFiles: [...editorState.openFiles, fileId],
              activeFileId: fileId
            }
          })
        } else {
          set({
            editorState: {
              ...editorState,
              activeFileId: fileId
            }
          })
        }
      },
      
      closeFile: (fileId) => {
        const { editorState } = get()
        const newOpenFiles = editorState.openFiles.filter(id => id !== fileId)
        const newActiveFileId = editorState.activeFileId === fileId 
          ? (newOpenFiles[newOpenFiles.length - 1] || null)
          : editorState.activeFileId
          
        set({
          editorState: {
            ...editorState,
            openFiles: newOpenFiles,
            activeFileId: newActiveFileId
          }
        })
      },
      
      toggleSidebar: () => {
        set({
          editorState: {
            ...get().editorState,
            sidebarCollapsed: !get().editorState.sidebarCollapsed
          }
        })
      },
      
      togglePreview: () => {
        set({
          editorState: {
            ...get().editorState,
            previewVisible: !get().editorState.previewVisible
          }
        })
      },
      
      updateSettings: (settings) => {
        const { currentProject } = get()
        if (currentProject) {
          set({
            currentProject: {
              ...currentProject,
              settings: {
                ...currentProject.settings,
                ...settings
              },
              updatedAt: new Date()
            }
          })
        }
      },
      
      saveProjectToStorage: () => {
        const { currentProject } = get()
        if (currentProject) {
          localStorage.setItem('cipherstudio-project', JSON.stringify(currentProject))
        }
      },
      
      loadProjectFromStorage: () => {
        try {
          const saved = localStorage.getItem('cipherstudio-project')
          if (saved) {
            const project = JSON.parse(saved)
            // Revive date fields
            if (project.createdAt) project.createdAt = new Date(project.createdAt)
            if (project.updatedAt) project.updatedAt = new Date(project.updatedAt)
            // Also revive nested file dates if any (defensive)
            get().setCurrentProject(project)
          }
        } catch (error) {
          console.error('Failed to load project from storage:', error)
        }
      },
      
      clearProject: () => {
        localStorage.removeItem('cipherstudio-project')
        get().createNewProject()
      }
      ,
      login: async (email: string, password: string) => {
        try {
          const response = await apiClient.post('/auth/login', { email, password })
          if (response?.success && response.user) {
            const user = { id: response.user.id, name: response.user.name, email: response.user.email }
            // Set token expiry to 2 hours from now
            const tokenExpiry = Date.now() + (2 * 60 * 60 * 1000) // 2 hours in milliseconds
            const token = response.token || null
            set({ isAuthenticated: true, user, tokenExpiry })
            localStorage.setItem('cipherstudio-auth', JSON.stringify({ user, tokenExpiry, token }))
            return true
          }
        } catch (e) {
          console.error('Login error', e)
        }
        return false
      },
      register: async (email: string, name: string, password: string) => {
        try {
          const response = await apiClient.post('/auth/register', { email, name, password })
          if (response?.success && response.user) {
            const user = { id: response.user.id, name: response.user.name, email: response.user.email }
            // Set token expiry to 2 hours from now
            const tokenExpiry = Date.now() + (2 * 60 * 60 * 1000) // 2 hours in milliseconds
            const token = response.token || null
            set({ isAuthenticated: true, user, tokenExpiry })
            localStorage.setItem('cipherstudio-auth', JSON.stringify({ user, tokenExpiry, token }))
            return true
          }
        } catch (e) {
          console.error('Register error', e)
        }
        return false
      },
      logout: () => {
        set({ isAuthenticated: false, user: null, tokenExpiry: null })
        localStorage.removeItem('cipherstudio-auth')
      },
      checkTokenExpiry: () => {
        const { tokenExpiry, isAuthenticated } = get()
        if (isAuthenticated && tokenExpiry) {
          // Check if token has expired
          if (Date.now() > tokenExpiry) {
            console.log('Token expired, logging out...')
            get().logout()
          }
        }
      },
    }),
    {
      name: 'cipherstudio-store',
      partialize: (state) => ({
        currentProject: state.currentProject,
        editorState: state.editorState
      })
    }
  )
)

