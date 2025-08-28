"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Question {
  id: string
  question: string
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER'
  options?: string[]
  points: number
  order: number
}

interface Quiz {
  id: string
  title: string
  description: string | null
  timeLimit: number | null
  passingScore: number
  questions: Question[]
}

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/quiz/${params.id}`)
        if (!response.ok) throw new Error('Failed to fetch quiz')
        
        const quizData = await response.json()
        setQuiz(quizData)
        
        if (quizData.timeLimit) {
          setTimeLeft(quizData.timeLimit * 60) // Convert minutes to seconds
        }
      } catch (error) {
        setError('Failed to load quiz')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchQuiz()
    }
  }, [params.id])

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || isSubmitted) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev && prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev ? prev - 1 : null
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, isSubmitted])

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleSubmit = async () => {
    if (isSubmitting || isSubmitted) return
    
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/quiz/${params.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            answer,
          })),
        }),
      })

      if (!response.ok) throw new Error('Failed to submit quiz')
      
      const result = await response.json()
      setResult(result)
      setIsSubmitted(true)
    } catch (error) {
      setError('Failed to submit quiz')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert>
          <AlertDescription>Please sign in to take the quiz.</AlertDescription>
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert>
          <AlertDescription>Quiz not found.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isSubmitted && result) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                  {result.passed ? (
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  ) : (
                    <XCircle className="h-16 w-16 text-red-500" />
                  )}
                </div>
                <CardTitle className="text-2xl">
                  {result.passed ? 'Congratulations!' : 'Quiz Complete'}
                </CardTitle>
                <CardDescription>
                  You have completed "{quiz.title}"
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Your Score</p>
                    <p className="text-2xl font-bold">{result.score}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Passing Score</p>
                    <p className="text-2xl font-bold">{quiz.passingScore}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Points Earned</p>
                    <p className="text-xl">{result.earnedPoints}/{result.totalPoints}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className={`text-xl font-semibold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {result.passed ? 'PASSED' : 'FAILED'}
                    </p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Link href="/">
                    <Button>Return to Dashboard</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          
          {timeLeft !== null && (
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4" />
              <span className={timeLeft < 300 ? 'text-red-500 font-bold' : ''}>
                Time Left: {formatTime(timeLeft)}
              </span>
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{quiz.title}</CardTitle>
              {quiz.description && (
                <CardDescription>{quiz.description}</CardDescription>
              )}
              <div className="text-sm text-muted-foreground">
                <p>Questions: {quiz.questions.length}</p>
                <p>Passing Score: {quiz.passingScore}%</p>
                {quiz.timeLimit && <p>Time Limit: {quiz.timeLimit} minutes</p>}
              </div>
            </CardHeader>
          </Card>

          <div className="space-y-6">
            {quiz.questions
              .sort((a, b) => a.order - b.order)
              .map((question, index) => (
                <Card key={question.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Question {index + 1} ({question.points} point{question.points !== 1 ? 's' : ''})
                    </CardTitle>
                    <CardDescription>{question.question}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {question.type === 'MULTIPLE_CHOICE' && question.options && (
                      <RadioGroup
                        value={answers[question.id] || ''}
                        onValueChange={(value) => handleAnswerChange(question.id, value)}
                      >
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`${question.id}-${optionIndex}`} />
                            <Label htmlFor={`${question.id}-${optionIndex}`}>{option}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}

                    {question.type === 'TRUE_FALSE' && (
                      <RadioGroup
                        value={answers[question.id] || ''}
                        onValueChange={(value) => handleAnswerChange(question.id, value)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="True" id={`${question.id}-true`} />
                          <Label htmlFor={`${question.id}-true`}>True</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="False" id={`${question.id}-false`} />
                          <Label htmlFor={`${question.id}-false`}>False</Label>
                        </div>
                      </RadioGroup>
                    )}

                    {question.type === 'SHORT_ANSWER' && (
                      <Input
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        placeholder="Enter your answer"
                        className="max-w-md"
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || Object.keys(answers).length === 0}
              size="lg"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Quiz
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
