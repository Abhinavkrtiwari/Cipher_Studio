const mongoose = require('mongoose')

const projectFileSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['component', 'style', 'config', 'other'],
    default: 'component'
  },
  path: {
    type: String,
    required: true
  },
  isOpen: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: false
  }
})

const projectSettingsSchema = new mongoose.Schema({
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light'
  },
  autosave: {
    type: Boolean,
    default: true
  },
  fontSize: {
    type: Number,
    default: 14,
    min: 10,
    max: 24
  }
})

const projectSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  files: [projectFileSchema],
  activeFileId: {
    type: String,
    default: null
  },
  settings: {
    type: projectSettingsSchema,
    default: () => ({})
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Update the updatedAt field before saving
projectSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Index for better query performance
projectSchema.index({ createdAt: -1 })
projectSchema.index({ updatedAt: -1 })

module.exports = mongoose.model('Project', projectSchema)
