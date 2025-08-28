import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { DashboardHeader } from '@/components/dashboard-header'
import { QuizCard } from '@/components/quiz-card'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { eq, count } from 'drizzle-orm'
import { db } from '@/src/db'
import { questions, quizzes } from '@/src/schema'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  const isAdmin = session.user?.role === 'ADMIN'

  // Fetch quizzes from database
  let allQuizzes: any[] = []
  try {
    const quizData = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        description: quizzes.description,
        timeLimit: quizzes.timeLimit,
        passingScore: quizzes.passingScore,
        isActive: quizzes.isActive,
        createdAt: quizzes.createdAt,
      })
      .from(quizzes)
      .where(isAdmin ? undefined : eq(quizzes.isActive, true))

    // Get question counts for each quiz
    allQuizzes = await Promise.all(
      quizData.map(async (quiz) => {
        const [questionCount] = await db
          .select({ count: count() })
          .from(questions)
          .where(eq(questions.quizId, quiz.id))

        return {
          ...quiz,
          questionsCount: questionCount?.count || 0,
          attemptsCount: 0, // TODO: Implement attempts count
        }
      })
    )
  } catch (error) {
    console.error('Error fetching quizzes:', error)
    allQuizzes = []
  }

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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allQuizzes.length > 0 ? (
            allQuizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg">
                {isAdmin 
                  ? 'No quizzes created yet. Create your first quiz to get started!'
                  : 'No quizzes available at the moment.'
                }
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
