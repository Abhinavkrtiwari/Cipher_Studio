const validateProject = (req, res, next) => {
  const { name, files, settings } = req.body

  // Validate project name
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Project name must be a non-empty string'
      })
    }
    
    if (name.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Project name must be less than 100 characters'
      })
    }
  }

  // Validate files array
  if (files !== undefined) {
    if (!Array.isArray(files)) {
      return res.status(400).json({
        success: false,
        message: 'Files must be an array'
      })
    }

    for (const file of files) {
      if (!file.id || typeof file.id !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Each file must have a valid id'
        })
      }

      if (!file.name || typeof file.name !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Each file must have a valid name'
        })
      }

      if (!file.path || typeof file.path !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Each file must have a valid path'
        })
      }

      if (file.type && !['component', 'style', 'config', 'other'].includes(file.type)) {
        return res.status(400).json({
          success: false,
          message: 'File type must be one of: component, style, config, other'
        })
      }

      if (file.content !== undefined && typeof file.content !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'File content must be a string'
        })
      }
    }
  }

  // Validate settings
  if (settings !== undefined) {
    if (typeof settings !== 'object' || settings === null) {
      return res.status(400).json({
        success: false,
        message: 'Settings must be an object'
      })
    }

    if (settings.theme && !['light', 'dark'].includes(settings.theme)) {
      return res.status(400).json({
        success: false,
        message: 'Theme must be either "light" or "dark"'
      })
    }

    if (settings.autosave !== undefined && typeof settings.autosave !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Autosave must be a boolean'
      })
    }

    if (settings.fontSize !== undefined) {
      if (typeof settings.fontSize !== 'number' || settings.fontSize < 10 || settings.fontSize > 24) {
        return res.status(400).json({
          success: false,
          message: 'Font size must be a number between 10 and 24'
        })
      }
    }
  }

  next()
}

module.exports = {
  validateProject
}
