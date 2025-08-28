import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { DashboardHeader } from '@/components/dashboard-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { eq, desc } from 'drizzle-orm'
import { CheckCircle, XCircle, Clock, Calendar } from 'lucide-react'
import { db } from '@/src/db'
import { quizAttempts, quizzes } from '@/src/schema'

export default async function StudentHistoryPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user?.role !== 'STUDENT') {
    redirect('/')
  }

  // Fetch student's quiz attempts
  const attempts = await db
    .select({
      id: quizAttempts.id,
      score: quizAttempts.score,
      passed: quizAttempts.passed,
      completedAt: quizAttempts.completedAt,
      quizTitle: quizzes.title,
      quizPassingScore: quizzes.passingScore,
    })
    .from(quizAttempts)
    .innerJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
    .where(eq(quizAttempts.userId, session.user.id))
    .orderBy(desc(quizAttempts.completedAt))

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Quiz History</h1>
          <p className="text-muted-foreground mt-2">
            View your past quiz attempts and scores
          </p>
        </div>

        {attempts.length > 0 ? (
          <div className="space-y-4">
            {attempts.map((attempt) => (
              <Card key={attempt.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{attempt.quizTitle}</CardTitle>
                      <CardDescription className="flex items-center mt-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(attempt.completedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </CardDescription>
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
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl font-bold">
                        {attempt.score}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Required: {attempt.quizPassingScore}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Score</div>
                      <div className={`text-lg font-semibold ${
                        attempt.passed ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {attempt.score >= attempt.quizPassingScore ? 'Above' : 'Below'} Passing
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Quiz Attempts Yet</h3>
              <p className="text-muted-foreground">
                You haven't attempted any quizzes yet. Start by taking your first quiz!
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
