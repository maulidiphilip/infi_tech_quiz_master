import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { DashboardHeader } from '@/components/dashboard-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { eq, desc } from 'drizzle-orm'
import { CheckCircle, XCircle, ArrowLeft, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { db } from '@/src/db'
import { quizAttempts, quizzes, users } from '@/src/schema'

interface QuizResultsPageProps {
  params: {
    id: string
  }
}

export default async function QuizResultsPage({ params }: QuizResultsPageProps) {
  const session = await getServerSession(authOptions)
  const { id } = await params

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/auth/signin')
  }

  // Fetch quiz details
  const [quiz] = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.id, id))

  if (!quiz) {
    redirect('/')
  }

  // Fetch quiz attempts with user details
  const attempts = await db
    .select({
      id: quizAttempts.id,
      score: quizAttempts.score,
      passed: quizAttempts.passed,
      completedAt: quizAttempts.completedAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(quizAttempts)
    .innerJoin(users, eq(quizAttempts.userId, users.id))
    .where(eq(quizAttempts.quizId, id))
    .orderBy(desc(quizAttempts.completedAt))

  // Calculate statistics
  const totalAttempts = attempts.length
  const passedAttempts = attempts.filter(a => a.passed).length
  const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0
  const averageScore = totalAttempts > 0 
    ? Math.round(attempts.reduce((sum, a) => sum + (a.score || 0), 0) / totalAttempts) 
    : 0

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Quiz Results</h1>
          <p className="text-muted-foreground mt-2">
            {quiz.title} - Performance Analytics
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAttempts}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{passRate}%</div>
              <p className="text-xs text-muted-foreground">
                {passedAttempts} of {totalAttempts} passed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageScore}%</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Passing Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quiz.passingScore}%</div>
              <p className="text-xs text-muted-foreground">Required to pass</p>
            </CardContent>
          </Card>
        </div>

        {/* Attempts List */}
        <Card>
          <CardHeader>
            <CardTitle>All Attempts</CardTitle>
            <CardDescription>
              Detailed view of all quiz attempts by students
            </CardDescription>
          </CardHeader>
          <CardContent>
            {attempts.length > 0 ? (
              <div className="space-y-4">
                {attempts.map((attempt) => (
                  <div key={attempt.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{attempt.userName}</p>
                        <p className="text-sm text-muted-foreground">{attempt.userEmail}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {attempt.completedAt ? new Date(attempt.completedAt).toLocaleDateString() : 'N/A'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {attempt.completedAt ? new Date(attempt.completedAt).toLocaleTimeString() : 'N/A'}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold">{attempt.score}%</p>
                      </div>
                      
                      <Badge variant={attempt.passed ? 'default' : 'destructive'}>
                        {attempt.passed ? (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-1" />
                        )}
                        {attempt.passed ? 'Passed' : 'Failed'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Attempts Yet</h3>
                <p className="text-muted-foreground">
                  No students have attempted this quiz yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
