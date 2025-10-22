'use client'

import { useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { useProjectStore } from '@/store/projectStore'

export default function CodeEditor() {
  const { 
    currentProject, 
    editorState, 
    updateFile 
  } = useProjectStore()
  
  const editorRef = useRef<any>(null)

  const activeFile = currentProject?.files.find(
    file => file.id === editorState.activeFileId
  )

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    
    // Configure Monaco Editor
    monaco.editor.defineTheme('cipherstudio-light', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#000000',
        'editorLineNumber.foreground': '#999999',
        'editorLineNumber.activeForeground': '#000000',
        'editor.selectionBackground': '#add6ff',
        'editor.inactiveSelectionBackground': '#e5ebf1',
        'editorCursor.foreground': '#000000',
        'editorWhitespace.foreground': '#d3d3d3',
        'editorIndentGuide.background': '#d3d3d3',
        'editorIndentGuide.activeBackground': '#939393',
      }
    })

    monaco.editor.defineTheme('cipherstudio-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editorLineNumber.foreground': '#858585',
        'editorLineNumber.activeForeground': '#c6c6c6',
        'editor.selectionBackground': '#264f78',
        'editor.inactiveSelectionBackground': '#3a3d41',
        'editorCursor.foreground': '#aeafad',
        'editorWhitespace.foreground': '#404040',
        'editorIndentGuide.background': '#404040',
        'editorIndentGuide.activeBackground': '#707070',
      }
    })

    // Set font size
    editor.updateOptions({
      fontSize: currentProject?.settings.fontSize || 14,
      fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
      lineHeight: 1.5,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      wordWrap: 'on',
      tabSize: 2,
      insertSpaces: true,
      renderWhitespace: 'selection',
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true
      }
    })
  }

  const handleEditorChange = (value: string | undefined) => {
    if (activeFile && value !== undefined) {
      updateFile(activeFile.id, { content: value })
    }
  }

  const getLanguage = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'js':
      case 'jsx':
        return 'javascript'
      case 'ts':
      case 'tsx':
        return 'typescript'
      case 'css':
        return 'css'
      case 'html':
        return 'html'
      case 'json':
        return 'json'
      case 'md':
        return 'markdown'
      default:
        return 'javascript'
    }
  }

  // Update editor options when settings change
  useEffect(() => {
    if (editorRef.current && currentProject) {
      editorRef.current.updateOptions({
        fontSize: currentProject.settings.fontSize,
        theme: currentProject.settings.theme === 'dark' ? 'cipherstudio-dark' : 'cipherstudio-light'
      })
    }
  }, [currentProject?.settings.fontSize, currentProject?.settings.theme])

  if (!activeFile) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">
          <h3 className="text-lg font-medium mb-2">No file selected</h3>
          <p className="text-sm">Select a file from the sidebar to start editing</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Editor Header */}
      <div className="h-8 border-b border-border bg-card flex items-center px-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{activeFile.name}</span>
          <span className="text-xs text-muted-foreground">
            {getLanguage(activeFile.name)}
          </span>
        </div>
      </div>
      
      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={getLanguage(activeFile.name)}
          value={activeFile.content}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme={currentProject?.settings.theme === 'dark' ? 'cipherstudio-dark' : 'cipherstudio-light'}
          options={{
            fontSize: currentProject?.settings.fontSize || 14,
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            lineHeight: 1.5,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            tabSize: 2,
            insertSpaces: true,
            renderWhitespace: 'selection',
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              indentation: true
            },
            suggest: {
              showKeywords: true,
              showSnippets: true,
              showFunctions: true,
              showConstructors: true,
              showFields: true,
              showVariables: true,
              showClasses: true,
              showStructs: true,
              showInterfaces: true,
              showModules: true,
              showProperties: true,
              showEvents: true,
              showOperators: true,
              showUnits: true,
              showValues: true,
              showConstants: true,
              showEnums: true,
              showEnumMembers: true,
              showColors: true,
              showFiles: true,
              showReferences: true,
              showFolders: true,
              showTypeParameters: true,
              showIssues: true,
              showUsers: true,
              showWords: true
            }
          }}
        />
      </div>
    </div>
  )
}
