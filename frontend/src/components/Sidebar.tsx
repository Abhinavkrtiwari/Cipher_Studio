'use client'

import { useState } from 'react'
import { 
  File, 
  Folder, 
  Plus, 
  Trash2, 
  Edit3, 
  ChevronRight, 
  ChevronDown,
  FileText,
  FileCode,
  FileImage,
  Settings
} from 'lucide-react'
import { useProjectStore } from '@/store/projectStore'
import { ProjectFile } from '@/types'
import { cn } from '@/utils/cn'

export default function Sidebar() {
  const { 
    currentProject, 
    editorState, 
    addFile, 
    deleteFile, 
    setActiveFile,
    openFile 
  } = useProjectStore()
  
  const [showNewFileDialog, setShowNewFileDialog] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [newFileType, setNewFileType] = useState<'component' | 'style' | 'config' | 'other'>('component')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']))

  const getFileIcon = (file: ProjectFile) => {
    switch (file.type) {
      case 'component':
        return <FileCode className="h-4 w-4 text-blue-500" />
      case 'style':
        return <FileText className="h-4 w-4 text-green-500" />
      case 'config':
        return <Settings className="h-4 w-4 text-yellow-500" />
      default:
        return <File className="h-4 w-4 text-gray-500" />
    }
  }

  const handleCreateFile = () => {
    if (!newFileName.trim()) return

    const fileExtension = getFileExtension(newFileType)
    const fileName = newFileName.includes('.') ? newFileName : `${newFileName}${fileExtension}`
    
    const newFile: ProjectFile = {
      id: `file-${Date.now()}`,
      name: fileName,
      content: getDefaultContent(newFileType, fileName),
      type: newFileType,
      path: `/${fileName}`,
      isOpen: true,
      isActive: true
    }

    addFile(newFile)
    setNewFileName('')
    setShowNewFileDialog(false)
  }

  const getFileExtension = (type: ProjectFile['type']) => {
    switch (type) {
      case 'component':
        return '.jsx'
      case 'style':
        return '.css'
      case 'config':
        return '.json'
      default:
        return '.txt'
    }
  }

  const getDefaultContent = (type: ProjectFile['type'], fileName: string) => {
    const componentName = fileName.replace(/\.(jsx|js|tsx|ts)$/, '')
    
    switch (type) {
      case 'component':
        return `import React from 'react';

function ${componentName}() {
  return (
    <div>
      <h2>${componentName}</h2>
      <p>This is a new React component.</p>
    </div>
  );
}

export default ${componentName};`
      case 'style':
        return `/* ${fileName} styles */

.${componentName.toLowerCase()} {
  /* Add your styles here */
}`
      case 'config':
        return `{
  "name": "${componentName}",
  "version": "1.0.0"
}`
      default:
        return `// ${fileName}\n\n// Add your content here`
    }
  }

  const handleFileClick = (file: ProjectFile) => {
    setActiveFile(file.id)
    openFile(file.id)
  }

  const handleDeleteFile = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this file?')) {
      deleteFile(fileId)
    }
  }

  const toggleFolder = (folderName: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderName)) {
      newExpanded.delete(folderName)
    } else {
      newExpanded.add(folderName)
    }
    setExpandedFolders(newExpanded)
  }

  // Group files by folder
  const filesByFolder = currentProject?.files.reduce((acc, file) => {
    const folder = file.path.split('/').slice(0, -1).join('/') || 'root'
    if (!acc[folder]) {
      acc[folder] = []
    }
    acc[folder].push(file)
    return acc
  }, {} as Record<string, ProjectFile[]>) || {}

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">Explorer</h2>
          <button
            onClick={() => setShowNewFileDialog(true)}
            className="p-1 hover:bg-accent rounded transition-colors"
            title="New File"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        
        {/* New File Dialog */}
        {showNewFileDialog && (
          <div className="space-y-3 p-3 bg-muted rounded-md">
            <input
              type="text"
              placeholder="File name"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              className="w-full px-2 py-1 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
            
            <select
              value={newFileType}
              onChange={(e) => setNewFileType(e.target.value as ProjectFile['type'])}
              className="w-full px-2 py-1 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="component">React Component</option>
              <option value="style">CSS File</option>
              <option value="config">Config File</option>
              <option value="other">Other</option>
            </select>
            
            <div className="flex gap-2">
              <button
                onClick={handleCreateFile}
                className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => setShowNewFileDialog(false)}
                className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {Object.entries(filesByFolder).map(([folder, files]) => (
          <div key={folder} className="mb-2">
            <button
              onClick={() => toggleFolder(folder)}
              className="flex items-center gap-1 w-full text-left p-1 hover:bg-accent rounded transition-colors"
            >
              {expandedFolders.has(folder) ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
              <Folder className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">{folder === 'root' ? 'Project' : folder}</span>
            </button>
            
            {expandedFolders.has(folder) && (
              <div className="ml-4 space-y-1">
                {files.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => handleFileClick(file)}
                    className={cn(
                      "flex items-center gap-2 p-1 rounded cursor-pointer transition-colors group",
                      editorState.activeFileId === file.id
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50"
                    )}
                  >
                    {getFileIcon(file)}
                    <span className="text-sm flex-1 truncate">{file.name}</span>
                    <button
                      onClick={(e) => handleDeleteFile(file.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-all"
                      title="Delete file"
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
