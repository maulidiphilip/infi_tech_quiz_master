"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createQuizSchema, createQuestionSchema } from '@/validations/quiz'

interface Question {
  id: string
  question: string
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER'
  options: string[]
  correctAnswer: string
  points: number
  order: number
}

export default function CreateQuizPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Quiz form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [timeLimit, setTimeLimit] = useState<number | undefined>(undefined)
  const [passingScore, setPassingScore] = useState(70)
  const [maxAttempts, setMaxAttempts] = useState(3)
  const [isActive, setIsActive] = useState(true)

  // Questions state
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
    question: '',
    type: 'MULTIPLE_CHOICE',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 1,
  })

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
    setIsLoading(true)
    setError('')

    try {
      // Validate quiz data
      const quizData = {
        title,
        description,
        timeLimit,
        passingScore,
        maxAttempts,
        isActive,
      }
      
      createQuizSchema.parse(quizData)

      if (questions.length === 0) {
        throw new Error('At least one question is required')
      }

      // Here you would typically make an API call to create the quiz
      // For now, we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'Failed to create quiz')
    } finally {
      setIsLoading(false)
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Create New Quiz</CardTitle>
              <CardDescription>
                Set up a new quiz with questions for your students
              </CardDescription>
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
                  <Button type="submit" disabled={isLoading || questions.length === 0}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Quiz
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
