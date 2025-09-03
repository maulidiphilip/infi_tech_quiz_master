"use client"

import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { MoonIcon, SunIcon, LogOut, History, Users } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'

export function DashboardHeader() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-semibold hover:text-primary">
            Quiz Management System
          </Link>
          {session?.user && (
            <span className="text-sm text-muted-foreground">
              Welcome, {session.user.name || session.user.email}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {session?.user && (
            <>
              {session.user.role === 'ADMIN' && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/users">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" asChild>
                <Link href="/student/history">
                  <History className="h-4 w-4 mr-2" />
                  History
                </Link>
              </Button>
            </>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
          </Button>
          
          {session?.user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
