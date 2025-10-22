'use client'

import { useEffect } from 'react'
import { useProjectStore } from '@/store/projectStore'
import IDE from '@/components/IDE'
import dynamic from 'next/dynamic'

const Login = dynamic(() => import('@/components/Login'), { ssr: false })

export default function Home() {
  const { loadProjectFromStorage, isAuthenticated } = useProjectStore()

  useEffect(() => {
    // Load any saved project from localStorage on app start
    loadProjectFromStorage()
  }, [loadProjectFromStorage])

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <main className="h-screen w-screen overflow-hidden">
      <IDE />
    </main>
  )
}

