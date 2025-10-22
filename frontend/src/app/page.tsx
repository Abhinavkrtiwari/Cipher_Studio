'use client'

import { useEffect, useState } from 'react'
import { useProjectStore } from '@/store/projectStore'
import IDE from '@/components/IDE'
import dynamic from 'next/dynamic'

const Login = dynamic(() => import('@/components/Login'), { ssr: false })

export default function Home() {
  const { loadProjectFromStorage, isAuthenticated, checkTokenExpiry } = useProjectStore()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Load saved project and auth from localStorage
    loadProjectFromStorage()
    
    // Restore auth state from localStorage if valid
    try {
      const authData = localStorage.getItem('cipherstudio-auth')
      if (authData) {
        const { user, tokenExpiry } = JSON.parse(authData)
        // Check if token is still valid
        if (tokenExpiry && Date.now() < tokenExpiry) {
          useProjectStore.setState({ isAuthenticated: true, user, tokenExpiry })
        } else {
          // Token expired, clear it
          localStorage.removeItem('cipherstudio-auth')
        }
      }
    } catch (error) {
      console.error('Failed to restore auth:', error)
    }
    
    setIsMounted(true)
  }, [loadProjectFromStorage])

  // Check token expiry every minute
  useEffect(() => {
    const interval = setInterval(() => {
      checkTokenExpiry()
    }, 60000) // Check every 60 seconds

    return () => clearInterval(interval)
  }, [checkTokenExpiry])

  // Prevent hydration mismatch by not rendering auth-dependent content until mounted
  if (!isMounted) {
    return (
      <main className="h-screen w-screen overflow-hidden flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </main>
    )
  }

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <main className="h-screen w-screen overflow-hidden">
      <IDE />
    </main>
  )
}

