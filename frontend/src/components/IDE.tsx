'use client'

import { useEffect, useState, useRef } from 'react'
import { useProjectStore } from '@/store/projectStore'
import Header from './Header'
import Sidebar from './Sidebar'
import Editor from './Editor'
import Preview from './Preview'
import { cn } from '@/utils/cn'

export default function IDE() {
  const { 
    currentProject, 
    editorState, 
    updateSettings,
    saveProjectToStorage 
  } = useProjectStore()

  const [sidebarWidth, setSidebarWidth] = useState(320)
  const [editorWidth, setEditorWidth] = useState(50) // percentage
  const [isResizing, setIsResizing] = useState(false)
  const [isResizingEditor, setIsResizingEditor] = useState(false)
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  // Auto-save functionality
  useEffect(() => {
    if (!currentProject?.settings.autosave) return

    const interval = setInterval(() => {
      saveProjectToStorage()
    }, 30000) // Auto-save every 30 seconds

    return () => clearInterval(interval)
  }, [currentProject?.settings.autosave, saveProjectToStorage])

  // Apply theme to document
  useEffect(() => {
    if (currentProject?.settings.theme) {
      document.documentElement.classList.toggle('dark', currentProject.settings.theme === 'dark')
    }
  }, [currentProject?.settings.theme])

  // Sidebar resize functionality
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect()
        const newWidth = e.clientX - containerRect.left
        const minWidth = 200
        const maxWidth = containerRect.width * 0.6
        
        if (newWidth >= minWidth && newWidth <= maxWidth) {
          setSidebarWidth(newWidth)
        }
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.classList.add('resizing')
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.classList.remove('resizing')
    }
  }, [isResizing])

  // Track small screen to switch to stacked layout
  useEffect(() => {
    function onResize() {
      setIsSmallScreen(window.innerWidth < 768)
    }

    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Editor resize functionality
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingEditor && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect()
        const sidebarWidthPx = editorState.sidebarCollapsed ? 0 : sidebarWidth
        const availableWidth = containerRect.width - sidebarWidthPx
        const relativeX = e.clientX - containerRect.left - sidebarWidthPx
        const newWidth = (relativeX / availableWidth) * 100
        
        const minWidth = 20
        const maxWidth = 80
        
        if (newWidth >= minWidth && newWidth <= maxWidth) {
          setEditorWidth(newWidth)
        }
      }
    }

    const handleMouseUp = () => {
      setIsResizingEditor(false)
    }

    if (isResizingEditor) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.classList.add('resizing')
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.classList.remove('resizing')
    }
  }, [isResizingEditor, sidebarWidth, editorState.sidebarCollapsed])

  if (!currentProject) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading CipherStudio...</h1>
          <p className="text-muted-foreground">Initializing your development environment</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-background">
      <Header />
      
      <div ref={containerRef} className={`flex-1 flex ${isSmallScreen ? 'flex-col' : ''} overflow-hidden`}>
        {/* Sidebar */}
        <div 
          ref={sidebarRef}
          className={cn(
            "transition-all duration-300 ease-in-out border-r border-border bg-card flex-shrink-0",
            editorState.sidebarCollapsed ? "w-0 overflow-hidden" : "",
            "hidden md:block" // Hide on mobile, show on medium screens and up
          )}
          style={{ 
            width: editorState.sidebarCollapsed ? 0 : `${sidebarWidth}px` 
          }}
        >
          <Sidebar />
        </div>
        
        {/* Sidebar Resize Handle */}
        {!editorState.sidebarCollapsed && (
          <div
            className="w-1 resize-handle flex-shrink-0 hidden md:block"
            onMouseDown={() => setIsResizing(true)}
          />
        )}
        
        {/* Main Content Area */}
        <div className="flex-1 flex min-w-0" style={{ flexDirection: isSmallScreen ? 'column' : 'row' }}>
          {/* Editor */}
          <div 
            ref={editorRef}
            className="flex-shrink-0"
            style={{ 
              width: isSmallScreen ? '100%' : (editorState.previewVisible ? `${editorWidth}%` : '100%') 
            }}
          >
            <Editor />
          </div>
          
          {/* Editor Resize Handle */}
          {editorState.previewVisible && (
            <div
              className="w-1 resize-handle flex-shrink-0 hidden md:block"
              onMouseDown={() => setIsResizingEditor(true)}
            />
          )}
          
          {/* Preview Panel */}
          {editorState.previewVisible && (
            <div 
              className={`flex-1 ${isSmallScreen ? 'border-t' : 'border-l'} border-border`}
              style={{ 
                width: isSmallScreen ? '100%' : `${100 - editorWidth}%`,
                height: isSmallScreen ? 420 : 'auto'
              }}
            >
              <Preview />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

