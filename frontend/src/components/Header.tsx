'use client'

import React, { useState } from 'react'
import { 
  Menu, 
  Save, 
  Download, 
  Upload, 
  Settings, 
  Sun, 
  Moon,
  Play,
  Square,
  Maximize2,
  Minimize2,
  Copy
} from 'lucide-react'
import { useProjectStore } from '@/store/projectStore'
import { cn } from '@/utils/cn'
import ProjectManager from './ProjectManager'

export default function Header() {
  const { 
    currentProject, 
    editorState, 
    toggleSidebar, 
    togglePreview,
    updateSettings,
    saveProjectToStorage,
    createNewProject
  } = useProjectStore()
  
  const [showSettings, setShowSettings] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)

  const handleSaveProject = () => {
    console.log('Saving project...')
    saveProjectToStorage()
    console.log('Project saved to localStorage!')
    // TODO: Implement backend save
  }

  const handleNewProject = () => {
    if (confirm('Are you sure you want to create a new project? This will replace your current project.')) {
      console.log('Creating new project...')
      createNewProject()
      console.log('New project created!')
    }
  }

  const handleNameChange = (e: React.FormEvent) => {
    e.preventDefault()
    if (projectName.trim()) {
      useProjectStore.getState().updateProjectName(projectName.trim())
    }
    setIsEditingName(false)
  }

  // Update project name when current project changes
  React.useEffect(() => {
    if (currentProject?.name) {
      setProjectName(currentProject.name)
    }
  }, [currentProject?.name])

  // Close settings dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSettings) {
        const target = event.target as Element
        if (!target.closest('.settings-dropdown')) {
          setShowSettings(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSettings])

  const toggleTheme = () => {
    const newTheme = currentProject?.settings.theme === 'light' ? 'dark' : 'light'
    updateSettings({ theme: newTheme })
  }

  const handleExportProject = () => {
    if (!currentProject) {
      console.log('No project to export')
      return
    }

    console.log('Exporting project:', currentProject.name)
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
    console.log('Project exported successfully!')
  }

  const handleCopyProject = async () => {
    if (!currentProject) {
      console.log('No project to copy')
      return
    }

    try {
      const dataStr = JSON.stringify(currentProject, null, 2)
      await navigator.clipboard.writeText(dataStr)
      console.log('Project copied to clipboard!')
      alert('Project copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy project:', error)
      alert('Failed to copy project to clipboard')
    }
  }

  return (
    <header className="h-12 border-b border-border bg-card flex items-center justify-between px-4">
      {/* Left Section */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-accent rounded-md transition-colors"
          title="Toggle Sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>
        
        <div className="flex items-center gap-2">
          {isEditingName ? (
            <form onSubmit={handleNameChange} className="flex items-center gap-2">
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="px-2 py-1 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
                onBlur={() => setIsEditingName(false)}
              />
            </form>
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {currentProject?.name || 'Untitled Project'}
            </button>
          )}
        </div>
      </div>

      {/* Center Section - Project Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleNewProject}
          className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          New Project
        </button>
        
        <button
          onClick={handleSaveProject}
          className="p-2 hover:bg-accent rounded-md transition-colors"
          title="Save Project"
        >
          <Save className="h-4 w-4" />
        </button>
        
        <button
          onClick={handleExportProject}
          className="p-2 hover:bg-accent rounded-md transition-colors"
          title="Export Project"
        >
          <Download className="h-4 w-4" />
        </button>
        
        <button
          onClick={handleCopyProject}
          className="p-2 hover:bg-accent rounded-md transition-colors"
          title="Copy Project"
        >
          <Copy className="h-4 w-4" />
        </button>
        
        <ProjectManager />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1">
        <button
          onClick={togglePreview}
          className="p-2 hover:bg-accent rounded-md transition-colors"
          title={editorState.previewVisible ? "Hide Preview" : "Show Preview"}
        >
          {editorState.previewVisible ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </button>
        
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-accent rounded-md transition-colors"
          title="Toggle Theme"
        >
          {currentProject?.settings.theme === 'light' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </button>
        
        <div className="relative settings-dropdown">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-accent rounded-md transition-colors"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
          
          {showSettings && (
            <div className="absolute right-0 top-full mt-1 w-64 bg-popover border border-border rounded-md shadow-lg z-50">
              <div className="p-4">
                <h3 className="font-medium mb-3">Settings</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Auto-save</label>
                    <input
                      type="checkbox"
                      checked={currentProject?.settings.autosave || false}
                      onChange={(e) => updateSettings({ autosave: e.target.checked })}
                      className="rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Font Size</label>
                    <select
                      value={currentProject?.settings.fontSize || 14}
                      onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                      className="px-2 py-1 text-sm bg-background border border-border rounded"
                    >
                      <option value={12}>12px</option>
                      <option value={14}>14px</option>
                      <option value={16}>16px</option>
                      <option value={18}>18px</option>
                      <option value={20}>20px</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

