'use client'

import { useState } from 'react'
import { 
  Save, 
  Download, 
  Upload, 
  FolderOpen, 
  X,
  Loader2
} from 'lucide-react'
import { useProjectStore } from '@/store/projectStore'
import { projectApi } from '@/utils/api'
import { cn } from '@/utils/cn'

export default function ProjectManager() {
  const { 
    currentProject, 
    setCurrentProject,
    saveProjectToStorage 
  } = useProjectStore()
  
  const [showManager, setShowManager] = useState(false)
  const [loading, setLoading] = useState(false)
  const [projectId, setProjectId] = useState('')
  const [message, setMessage] = useState('')

  const handleSaveToBackend = async () => {
    if (!currentProject) return

    setLoading(true)
    setMessage('')

    try {
      // Safer flow: check whether project exists on server first
      try {
        await projectApi.getProject(currentProject.id)
        // If getProject succeeds, update
        const updateResp = await projectApi.updateProject(currentProject.id, {
          name: currentProject.name,
          files: currentProject.files,
          settings: currentProject.settings,
          activeFileId: currentProject.activeFileId
        })

        if (updateResp && updateResp.success) {
          setMessage('Project updated successfully!')
          saveProjectToStorage()
        } else {
          setMessage('Failed to update project on backend')
        }
      } catch (err: any) {
        // If error is ApiError with 404, create. Otherwise show error.
        if (err && err.status === 404) {
          try {
            const createResp = await projectApi.createProject({
              name: currentProject.name,
              files: currentProject.files,
              settings: currentProject.settings
            })

            if (createResp && createResp.success && createResp.project) {
              setCurrentProject(createResp.project as any)
              setMessage('Project created on backend and saved successfully!')
              saveProjectToStorage()
            } else if (createResp && createResp.success && createResp.projectId) {
              const fetched = await projectApi.getProject(createResp.projectId)
              if (fetched && fetched.success && fetched.project) {
                setCurrentProject(fetched.project as any)
                setMessage('Project created on backend and saved successfully!')
                saveProjectToStorage()
              } else {
                setMessage('Project created but failed to fetch project data')
              }
            } else {
              setMessage('Failed to save project to backend')
            }
          } catch (createErr) {
            console.error('Create error:', createErr)
            setMessage('Error saving project to backend')
          }
        } else {
          console.error('Save flow error:', err)
          setMessage('Error saving project')
        }
      }
    } catch (error) {
      console.error('Save error:', error)
      setMessage('Error saving project')
    } finally {
      setLoading(false)
    }
  }

  const handleLoadFromBackend = async () => {
    if (!projectId.trim()) return

    setLoading(true)
    setMessage('')

    try {
      const response = await projectApi.getProject(projectId)
      
      if (response && response.success && response.project) {
        setCurrentProject(response.project as any)
        setMessage('Project loaded successfully!')
        setProjectId('')
      } else {
        setMessage('Project not found')
      }
    } catch (error) {
      console.error('Load error:', error)
      setMessage('Error loading project')
    } finally {
      setLoading(false)
    }
  }

  const handleExportProject = () => {
    if (!currentProject) return

    const dataStr = JSON.stringify(currentProject, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `${currentProject.name.replace(/\s+/g, '_')}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    setMessage('Project exported successfully!')
  }

  const handleImportProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const projectData = JSON.parse(e.target?.result as string)

        // Basic validation
        if (!projectData || !projectData.id || !projectData.name || !Array.isArray(projectData.files)) {
          setMessage('Invalid project file')
          return
        }

        // Ensure files have required fields
        const validFiles = projectData.files.every((f: any) => f && f.id && f.name && f.path && typeof f.content === 'string')
        if (!validFiles) {
          setMessage('Invalid project file - files malformed')
          return
        }

        setCurrentProject(projectData as any)
        setMessage('Project imported successfully!')
      } catch (error) {
        console.error('Import error:', error)
        setMessage('Invalid project file')
      }
    }
    reader.readAsText(file)
    
    // Reset input
    event.target.value = ''
  }

  const handleSaveToLocal = () => {
    saveProjectToStorage()
    setMessage('Project saved to local storage!')
  }

  if (!showManager) {
    return (
      <button
        onClick={() => setShowManager(true)}
        className="p-2 hover:bg-accent rounded-md transition-colors"
        title="Project Manager"
      >
        <FolderOpen className="h-4 w-4" />
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Project Manager</h2>
          <button
            onClick={() => setShowManager(false)}
            className="p-1 hover:bg-accent rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Save to Backend */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Save to Cloud</h3>
            <button
              onClick={handleSaveToBackend}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save to Backend
            </button>
          </div>

          {/* Load from Backend */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Load from Cloud</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Project ID"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                onClick={handleLoadFromBackend}
                disabled={loading || !projectId.trim()}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Load'
                )}
              </button>
            </div>
          </div>

          {/* Local Storage */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Local Storage</h3>
            <button
              onClick={handleSaveToLocal}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
            >
              <Save className="h-4 w-4" />
              Save Locally
            </button>
          </div>

          {/* Export/Import */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Export/Import</h3>
            <div className="flex gap-2">
              <button
                onClick={handleExportProject}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors cursor-pointer">
                <Upload className="h-4 w-4" />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportProject}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={cn(
              "p-3 rounded-md text-sm",
              message.includes('successfully') 
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            )}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
