const express = require('express')
const { v4: uuidv4 } = require('uuid')
const Project = require('../models/Project')
const { validateProject } = require('../middleware/validation')

const router = express.Router()

// GET /api/projects/:id - Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      })
    }

    const project = await Project.findOne({ id })

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      })
    }

    res.json({
      success: true,
      project
    })
  } catch (error) {
    console.error('Error fetching project:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// POST /api/projects - Create new project
router.post('/', validateProject, async (req, res) => {
  try {
    const { name, files, settings } = req.body

    // Generate unique project ID
    const projectId = uuidv4()

    // Create default files if none provided
    const defaultFiles = files && files.length > 0 ? files : [
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
        <button 
          onClick={() => alert('Hello from CipherStudio!')}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Click me!
        </button>
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
}

.App-header {
  background-color: #282c34;
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
  color: #61dafb;
}

.App-header p {
  margin-bottom: 30px;
  font-size: 18px;
}

button:hover {
  background-color: #0056b3 !important;
  transform: translateY(-2px);
  transition: all 0.2s ease;
}`,
        type: 'style',
        path: '/App.css',
        isOpen: false,
        isActive: false
      }
    ]

    const project = new Project({
      id: projectId,
      name: name || 'Untitled Project',
      files: defaultFiles,
      activeFileId: defaultFiles.find(f => f.isActive)?.id || defaultFiles[0]?.id,
      settings: {
        theme: 'light',
        autosave: true,
        fontSize: 14,
        ...settings
      }
    })

    await project.save()

    res.status(201).json({
      success: true,
      projectId: project.id,
      project
    })
  } catch (error) {
    console.error('Error creating project:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// PUT /api/projects/:id - Update project
router.put('/:id', validateProject, async (req, res) => {
  try {
    const { id } = req.params
    const { name, files, settings, activeFileId } = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      })
    }

    const updateData = {
      updatedAt: new Date()
    }

    if (name !== undefined) updateData.name = name
    if (files !== undefined) updateData.files = files
    if (settings !== undefined) updateData.settings = settings
    if (activeFileId !== undefined) updateData.activeFileId = activeFileId

    const project = await Project.findOneAndUpdate(
      { id },
      updateData,
      { new: true, runValidators: true }
    )

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      })
    }

    res.json({
      success: true,
      project
    })
  } catch (error) {
    console.error('Error updating project:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// DELETE /api/projects/:id - Delete project
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      })
    }

    const project = await Project.findOneAndDelete({ id })

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      })
    }

    res.json({
      success: true,
      message: 'Project deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting project:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

// GET /api/projects - Get all projects (for admin purposes)
router.get('/', async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query

    const projects = await Project.find()
      .select('id name createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))

    const total = await Project.countDocuments()

    res.json({
      success: true,
      projects,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      }
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

module.exports = router
