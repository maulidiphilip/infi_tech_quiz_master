"use client"

import { Button } from '@/components/ui/button'
import { LogOut, User, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function DashboardHeader() {
  const { theme, setTheme } = useTheme()

  // Temporary dummy user data
  const user = {
    name: "Philip Maulidi",
    email: "maulidiphilip@gmail.com",
    role: "ADMIN",
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold">Quiz Management System</h2>
          {user.role === 'ADMIN' && (
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
              Admin
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium">{user.name || user.email}</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert("Sign Out (mock)")}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  )
}
