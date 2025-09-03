"use client"

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { DashboardHeader } from '@/components/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createQuizSchema, createQuestionSchema } from '@/validations/quiz'

interface EditQuizPageProps {
  params: Promise<{
    id: string
  }>
}

interface Question {
  id: string
  question: string
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER'
  options: string[]
  correctAnswer: string
  points: number
  order: number
}

interface Quiz {
  id: string
  title: string
  description: string | null
  timeLimit: number | null
  passingScore: number
  maxAttempts: number | null
  isActive: boolean
  questions: Question[]
}

export default function EditQuizPage({ params }: EditQuizPageProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const resolvedParams = use(params)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
    question: '',
    type: 'MULTIPLE_CHOICE',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 1,
  })

  // Quiz form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [timeLimit, setTimeLimit] = useState<number | undefined>(undefined)
  const [passingScore, setPassingScore] = useState(70)
  const [maxAttempts, setMaxAttempts] = useState(3)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') {
      router.push('/auth/signin')
      return
    }

    fetchQuiz()
  }, [session, resolvedParams.id, router])

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`/api/quiz/${resolvedParams.id}`)
      if (response.ok) {
        const quizData = await response.json()
        setQuiz(quizData)
        setTitle(quizData.title)
        setDescription(quizData.description || '')
        setTimeLimit(quizData.timeLimit)
        setPassingScore(quizData.passingScore)
        setMaxAttempts(quizData.maxAttempts || 3)
        setIsActive(quizData.isActive)
        setQuestions(quizData.questions || [])
      } else {
        setError('Failed to fetch quiz data')
      }
    } catch (err) {
      setError('Failed to fetch quiz data')
    } finally {
      setIsLoading(false)
    }
  }

  const addQuestion = () => {
    try {
      const questionData = {
        ...currentQuestion,
        order: questions.length + 1,
      }
      
      createQuestionSchema.parse(questionData)
      
      const newQuestion: Question = {
        id: Math.random().toString(36).substr(2, 9),
        question: currentQuestion.question!,
        type: currentQuestion.type!,
        options: currentQuestion.options || [],
        correctAnswer: currentQuestion.correctAnswer!,
        points: currentQuestion.points!,
        order: questions.length + 1,
      }

      setQuestions([...questions, newQuestion])
      setCurrentQuestion({
        question: '',
        type: 'MULTIPLE_CHOICE',
        options: ['', '', '', ''],
        correctAnswer: '',
        points: 1,
      })
      setError('')
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Invalid question data')
    }
  }

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      const quizData = {
        title,
        description,
        timeLimit,
        passingScore,
        maxAttempts,
        isActive,
        questions,
      }
      
      createQuizSchema.parse(quizData)

      const response = await fetch(`/api/quiz/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizData)
      })

      if (response.ok) {
        router.push('/')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update quiz')
      }
    } catch (error: unknown) {
      setError('Failed to update quiz')
    } finally {
      setIsSaving(false)
    }
  }

  if (session?.user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive">
          <AlertDescription>Access denied. Admin privileges required.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

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

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Edit Quiz</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Quiz Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Quiz Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter quiz title"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                      <Input
                        id="timeLimit"
                        type="number"
                        value={timeLimit || ''}
                        onChange={(e) => setTimeLimit(e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter quiz description (optional)"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="passingScore">Passing Score (%)</Label>
                      <Input
                        id="passingScore"
                        type="number"
                        min="0"
                        max="100"
                        value={passingScore}
                        onChange={(e) => setPassingScore(parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="maxAttempts">Max Attempts</Label>
                      <Input
                        id="maxAttempts"
                        type="number"
                        min="1"
                        value={maxAttempts}
                        onChange={(e) => setMaxAttempts(parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-6">
                      <Switch
                        id="isActive"
                        checked={isActive}
                        onCheckedChange={setIsActive}
                      />
                      <Label htmlFor="isActive">Active</Label>
                    </div>
                  </div>
                </div>

                {/* Questions Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Questions ({questions.length})</h3>
                  
                  {/* Existing Questions */}
                  {questions.map((question, index) => (
                    <Card key={question.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">Q{index + 1}: {question.question}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Type: {question.type} | Points: {question.points}
                          </p>
                          {question.type === 'MULTIPLE_CHOICE' && (
                            <div className="mt-2">
                              <p className="text-sm text-muted-foreground">Options:</p>
                              <ul className="text-sm ml-4">
                                {question.options.map((option, i) => (
                                  <li key={i} className={option === question.correctAnswer ? 'text-green-600 font-medium' : ''}>
                                    {option} {option === question.correctAnswer && '✓'}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}

                  {/* Add New Question Form */}
                  <Card className="p-4">
                    <h4 className="font-medium mb-4">Add New Question</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Question *</Label>
                        <Textarea
                          value={currentQuestion.question || ''}
                          onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                          placeholder="Enter your question"
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <select
                            className="w-full h-10 px-3 rounded-md border border-input bg-background"
                            value={currentQuestion.type}
                            onChange={(e) => setCurrentQuestion({...currentQuestion, type: e.target.value as any})}
                          >
                            <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                            <option value="TRUE_FALSE">True/False</option>
                            <option value="SHORT_ANSWER">Short Answer</option>
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Points</Label>
                          <Input
                            type="number"
                            min="1"
                            value={currentQuestion.points || 1}
                            onChange={(e) => setCurrentQuestion({...currentQuestion, points: parseInt(e.target.value)})}
                          />
                        </div>
                      </div>

                      {currentQuestion.type === 'MULTIPLE_CHOICE' && (
                        <div className="space-y-2">
                          <Label>Options</Label>
                          {(currentQuestion.options || ['', '', '', '']).map((option, index) => (
                            <Input
                              key={index}
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...(currentQuestion.options || ['', '', '', ''])]
                                newOptions[index] = e.target.value
                                setCurrentQuestion({...currentQuestion, options: newOptions})
                              }}
                              placeholder={`Option ${index + 1}`}
                            />
                          ))}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Correct Answer *</Label>
                        <Input
                          value={currentQuestion.correctAnswer || ''}
                          onChange={(e) => setCurrentQuestion({...currentQuestion, correctAnswer: e.target.value})}
                          placeholder="Enter the correct answer"
                        />
                      </div>

                      <Button
                        type="button"
                        onClick={addQuestion}
                        className="w-full"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Question
                      </Button>
                    </div>
                  </Card>
                </div>

                <div className="flex justify-end space-x-4">
                  <Link href="/">
                    <Button type="button" variant="outline">Cancel</Button>
                  </Link>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
