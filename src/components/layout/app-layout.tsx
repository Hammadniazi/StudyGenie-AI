'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { StudyDataProvider } from '@/contexts/study-data-context'

interface AppLayoutProps {
  children: React.ReactNode
  userEmail?: string
  userName?: string
}

export function AppLayout({ children, userEmail, userName }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <StudyDataProvider>
      <div className="min-h-dvh bg-background">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          userEmail={userEmail}
          userName={userName}
        />
        <div className="flex min-h-dvh flex-col lg:ml-[240px]">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
            {children}
          </main>
        </div>
      </div>
    </StudyDataProvider>
  )
}
