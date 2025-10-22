 'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useProjectStore } from '@/store/projectStore'
import { useMemo as useMemoReact } from 'react'

export default function Preview() {
  const { currentProject } = useProjectStore()

  // Debug logging
  console.log('Preview component - currentProject:', currentProject)

  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [refreshKey, setRefreshKey] = useState(0)
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  const [previewStatus, setPreviewStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [previewMessage, setPreviewMessage] = useState<string>('Loading preview...')

  const sandpackFiles = useMemoReact(() => {
    if (!currentProject) return {}

    const files: Record<string, string> = {}
    
    // Add all project files
    currentProject.files.forEach(file => {
      // Normalize into /src/ so react template finds App and index
      const filename = file.path.split('/').pop() || file.name || 'App.js'
      const path = `/src/${filename}`
      files[path] = file.content
    })

        // Always ensure we have the required files for Sandpack
        // Ensure /src/App.js exists
        if (!files['/src/App.js']) {
          files['/src/App.js'] = currentProject.files.find(f => f.name === 'App.js')?.content || `import React from 'react';
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

export default App;`
        }

        if (!files['/src/App.css']) {
          files['/src/App.css'] = currentProject.files.find(f => f.name === 'App.css')?.content || `.App {
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
}`
        }

  // Add index.js entry point (ensure leading slash key)
  // Provide both /index.js and /src/index.js to be compatible with different templates
  files['/index.js'] = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App';
import './src/App.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`

  files['/src/index.js'] = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`

    console.log('Sandpack files:', files)
    return files
  }, [currentProject])

  // Create an iframe-friendly HTML document that mounts the React app using UMD builds
  const iframeHtml = useMemo(() => {
    if (!currentProject) return ''

    const appCss = sandpackFiles['/src/App.css'] || ''
    const rawAppJs = sandpackFiles['/src/App.js'] || sandpackFiles['/src/index.js'] || ''

    // Simple preprocessing to remove module imports/exports so code can run in a browser Babel env
    let appJs = rawAppJs || ''
    try {
      // Remove import ... from '...' lines
      appJs = appJs.replace(/(^|\n)\s*import[^;]*;?/g, '\n')
      // Turn `export default function App` into `function App`
      appJs = appJs.replace(/export\s+default\s+function/gi, 'function')
      // Remove `export default App;` style exports
      appJs = appJs.replace(/export\s+default\s+[A-Za-z0-9_\$]+;?/g, '')
      // Remove named exports like `export { Foo }`
      appJs = appJs.replace(/export\s+\{[^}]*\};?/g, '')
    } catch (e) {
      console.error('Error preprocessing app JS for iframe preview', e)
    }

  // Basic index html that loads React and Babel (UMD) and mounts App
    const safeAppJs = appJs && appJs.trim() ? appJs : `function App(){ return React.createElement('div',{style:{padding:20,color:'#fff'}}, 'No App source available to render') }`

    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>html,body,#root{height:100%;margin:0} body{background:#0b1220;color:#e6eef8;font-family:Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;} ${appCss}</style>
  </head>
  <body>
    <div id="root"></div>
    <div id="__preview_error" style="display:none;position:fixed;inset:10px;padding:12px;border-radius:8px;background:#2b0f0f;color:#ffd2d2;z-index:99999;overflow:auto;max-height:calc(100% - 20px)"></div>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script>
      // Global error handlers to show errors in the preview itself for easier debugging on mobile
      function showPreviewError(msg){
        try{
          const el = document.getElementById('__preview_error')
          el.style.display = 'block'
          el.textContent = msg
        }catch(e){ console.error(e) }
      }
      window.addEventListener('error', function(e){
        console.error('Preview runtime error', e.error || e.message)
        showPreviewError('Runtime error: ' + (e.error?.stack || e.message || e.error))
      })
      window.addEventListener('unhandledrejection', function(e){
        console.error('Unhandled rejection', e.reason)
        showPreviewError('Unhandled rejection: ' + (e.reason?.stack || e.reason))
      })
    </script>
    <script type="text/babel">
${safeAppJs}

try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  if (typeof App === 'function') {
    root.render(React.createElement(App));
  } else if (typeof exports !== 'undefined' && exports.default) {
    root.render(React.createElement(exports.default));
  } else {
    // If nothing to render, show a helpful message
    root.render(React.createElement('div', {style:{padding:20}}, 'No renderable App found'))
  }
  // Notify parent that preview is ready
  try { window.parent.postMessage({ type: 'preview-ready' }, '*') } catch(e){}
} catch (err) {
  console.error('Preview mount error:', err)
  try { document.getElementById('__preview_error').textContent = 'Preview mount error: ' + (err.stack || err.message) } catch(e){}
  try { window.parent.postMessage({ type: 'preview-error', error: (err && (err.stack || err.message)) || String(err) }, '*') } catch(e){}
}
    </script>
  </body>
</html>`
  }, [currentProject, sandpackFiles, refreshKey])

  // Device width mapping
  const deviceWidth = device === 'desktop' ? '100%' : device === 'tablet' ? '768px' : '412px'

  useEffect(() => {
    // refresh when project changes
    setRefreshKey(k => k + 1)
  }, [currentProject])

  // Monitor iframe load; show a non-blocking toast if loading takes too long
  useEffect(() => {
    setPreviewStatus('loading')
    setPreviewMessage('Loading preview...')

    const timeout = setTimeout(() => {
      // Show a small warning toast but don't block the UI — iframe onLoad will still set ready
      setPreviewStatus('error')
      setPreviewMessage('Preview is taking longer than expected. Tap Retry or open DevTools console for details.')
    }, 8000)

    return () => clearTimeout(timeout)
  }, [refreshKey])

  // Listen for ready/error messages from iframe
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      const data = e.data || {}
      if (data && data.type === 'preview-ready') {
        setPreviewStatus('ready')
        setPreviewMessage('')
      }
      if (data && data.type === 'preview-error') {
        setPreviewStatus('error')
        setPreviewMessage('Preview error: ' + (data.error || 'unknown'))
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  useEffect(() => {
    function onResize() {
      setIsSmallScreen(window.innerWidth < 640)
      // If small screen, default to mobile device preview
      if (window.innerWidth < 640) setDevice('mobile')
    }

    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const sandpackDependencies = useMemo(() => {
    return {
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
      'react-scripts': '5.0.1'
    }
  }, [])

  if (!currentProject) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">
          <h3 className="text-lg font-medium mb-2">No project loaded</h3>
          <p className="text-sm">Create a new project to see the preview</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Preview Header */}
      <div className="h-8 border-b border-border bg-card flex items-center px-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Preview</span>
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {!isSmallScreen && (
            <>
              <button onClick={() => setDevice('desktop')} className={`px-2 py-1 text-xs rounded ${device==='desktop'?'bg-primary text-primary-foreground':''}`}>Desktop</button>
              <button onClick={() => setDevice('tablet')} className={`px-2 py-1 text-xs rounded ${device==='tablet'?'bg-primary text-primary-foreground':''}`}>Tablet</button>
              <button onClick={() => setDevice('mobile')} className={`px-2 py-1 text-xs rounded ${device==='mobile'?'bg-primary text-primary-foreground':''}`}>Mobile</button>
            </>
          )}
          <button onClick={() => setRefreshKey(k => k + 1)} className="px-2 py-1 text-xs rounded bg-secondary text-secondary-foreground ml-2">Refresh</button>
        </div>
      </div>
      
      {/* Sandpack Preview */}
      <div className="flex-1 min-h-0 p-2 flex items-start justify-center">
        <div
          className="border border-border bg-card overflow-hidden"
          style={{
            width: isSmallScreen ? '100%' : deviceWidth,
            maxWidth: '100%',
            height: isSmallScreen ? 420 : '100%',
            borderRadius: 6,
          }}
        >
          <iframe
            ref={iframeRef}
            key={refreshKey}
            title="project-preview"
            srcDoc={iframeHtml}
            onLoad={() => {
              setPreviewStatus('ready')
              setPreviewMessage('')
            }}
            style={{ width: '100%', height: '100%', border: 'none', minHeight: 300 }}
            sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
          />
          {/* Parent overlay shown when preview not ready */}
          {previewStatus !== 'ready' && (
            <div className="absolute top-4 right-4">
              <div className="bg-card/90 border border-border text-sm p-2 rounded-md shadow-md max-w-xs">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="font-medium">Preview status</div>
                    <div className="text-xs text-muted-foreground mt-1">{previewMessage}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => setRefreshKey(k => k + 1)} className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded">Retry</button>
                    <button onClick={() => { alert('Open DevTools → Select the iframe (right-click inside preview -> Inspect) → Console to see runtime errors or network failures.') }} className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded">Help</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
