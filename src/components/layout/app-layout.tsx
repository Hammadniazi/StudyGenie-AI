'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'

interface AppLayoutProps {
  children: React.ReactNode
  userEmail?: string
  userName?: string
  xp?: number
}

export function AppLayout({ children, userEmail, userName, xp }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userEmail={userEmail}
        userName={userName}
      />

      {/* Main area — offset for sidebar on large screens */}
      <div className="lg:ml-[240px] flex flex-col min-h-screen">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          userEmail={userEmail}
          userName={userName}
          xp={xp}
        />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
