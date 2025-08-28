import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { DashboardHeader } from '@/components/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

import { eq } from 'drizzle-orm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { db } from '@/src/db'
import { questions, quizzes } from '@/src/schema'
import type { ReactNode } from 'react'

interface EditQuizPageProps {
  params: {
    id: string
  }
}

// ✅ helper to render question options safely
function renderOptions(options: unknown): ReactNode {
  try {
    if (!options || options === 'null') return null

    const parsed = typeof options === 'string' ? JSON.parse(options) : options

    if (Array.isArray(parsed)) {
      return (
        <div className="text-sm text-muted-foreground">
          Options: {parsed.join(', ')}
        </div>
      )
    }

    return (
      <div className="text-sm text-muted-foreground">
        Options: Invalid format
      </div>
    )
  } catch {
    return (
      <div className="text-sm text-muted-foreground">
        Options: {String(options || '')}
      </div>
    )
  }
}

export default async function EditQuizPage({ params }: EditQuizPageProps) {
  const session = await getServerSession(authOptions)
  const { id } = params

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/auth/signin')
  }

  // Fetch quiz and questions
  const [quiz] = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.id, id))

  if (!quiz) {
    redirect('/')
  }

  const quizQuestions = await db
    .select()
    .from(questions)
    .where(eq(questions.quizId, id))
    .orderBy(questions.order)

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Edit Quiz</h1>
          <p className="text-muted-foreground mt-2">
            Modify quiz details and questions
          </p>
        </div>

        <div className="space-y-6">
          {/* Quiz Details */}
          <Card>
            <CardHeader>
              <CardTitle>Quiz Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Quiz Title</Label>
                  <Input id="title" defaultValue={quiz.title} />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="active" defaultChecked={quiz.isActive} />
                  <Label htmlFor="active">Active</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" defaultValue={quiz.description || ''} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                  <Input id="timeLimit" type="number" defaultValue={quiz.timeLimit || ''} />
                </div>
                <div>
                  <Label htmlFor="passingScore">Passing Score (%)</Label>
                  <Input id="passingScore" type="number" min="0" max="100" defaultValue={quiz.passingScore} />
                </div>
                <div>
                  <Label htmlFor="maxAttempts">Max Attempts</Label>
                  <Input id="maxAttempts" type="number" min="1" defaultValue={quiz.maxAttempts || ''} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <Card>
            <CardHeader>
              <CardTitle>Questions ({quizQuestions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {quizQuestions.length > 0 ? (
                <div className="space-y-4">
                  {quizQuestions.map((question, index) => (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          Question {index + 1} • {question.type.replace('_', ' ')} • {question.points} points
                        </span>
                      </div>
                      <p className="font-medium mb-2">{String(question.question)}</p>

                      {/* ✅ use helper here */}
                      {renderOptions(question.options)}

                      <div className="text-sm text-green-600 mt-1">
                        Correct Answer: {String(question.correctAnswer || '')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No questions added yet.
                </p>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/">Cancel</Link>
            </Button>
            <Button>Save Changes</Button>
          </div>
        </div>
      </main>
    </div>
  )
}
