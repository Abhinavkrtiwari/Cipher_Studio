const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const router = express.Router()

// JWT secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRY = '2h' // 2 hours

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, name, password } = req.body
    if (!email || !name || !password) {
      return res.status(400).json({ success: false, message: 'Missing fields' })
    }

    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ success: false, message: 'Email already registered' })

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const user = new User({ email, name, passwordHash: hash })
    await user.save()

    // Generate JWT token with 2-hour expiration
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    )

    return res.status(201).json({ 
      success: true, 
      user: { id: user._id, email: user.email, name: user.name },
      token
    })
  } catch (err) {
    console.error('Register error', err)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ success: false, message: 'Missing fields' })

    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' })

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' })

    // Generate JWT token with 2-hour expiration
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    )

    return res.json({ 
      success: true, 
      user: { id: user._id, email: user.email, name: user.name },
      token
    })
  } catch (err) {
    console.error('Login error', err)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

module.exports = router
