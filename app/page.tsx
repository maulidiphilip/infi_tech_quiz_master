import { DashboardHeader } from '@/components/dashboard-header'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const isAdmin = true // temporary placeholder until auth is added

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isAdmin ? 'Quiz Management Dashboard' : 'Available Quizzes'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isAdmin 
                ? 'Create and manage quizzes for your students'
                : 'Take quizzes and track your progress'
              }
            </p>
          </div>
          {isAdmin && (
            <Link href="/admin/quiz/create">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Quiz
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quiz cards will be populated here */}
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              {isAdmin ? 'No quizzes created yet. Create your first quiz!' : 'No quizzes available at the moment.'}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
