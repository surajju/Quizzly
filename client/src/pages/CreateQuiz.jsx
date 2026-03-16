import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useSocket } from '../context/SocketContext'
import { useGame } from '../context/GameContext'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Card from '../components/common/Card'
import QuestionEditor from '../components/Quiz/QuestionEditor'
import PageWrapper from '../components/layout/PageWrapper'

const emptyQuestion = {
  text: '',
  options: ['', ''],
  correctIndex: 0,
  timeLimit: 15,
}

export default function CreateQuiz() {
  const navigate = useNavigate()
  const { socket, connected } = useSocket()
  const { dispatch } = useGame()
  const [title, setTitle] = useState('')
  const [questions, setQuestions] = useState([])
  const [draft, setDraft] = useState(emptyQuestion)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const handleAddQuestion = () => {
    const q = {
      text: draft.text.trim(),
      options: draft.options.filter(Boolean),
      correctIndex: draft.correctIndex,
      timeLimit: draft.timeLimit,
    }
    if (!q.text) {
      setError('Question text is required')
      return
    }
    if (q.options.length < 2) {
      setError('At least 2 options are required')
      return
    }
    setError('')
    setQuestions((prev) => [...prev, q])
    setDraft(emptyQuestion)
  }

  const handleRemoveQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCreateQuiz = () => {
    if (questions.length < 1) return
    setError('')
    setCreating(true)
    const quizData = {
      title: title.trim() || 'Untitled Quiz',
      questions,
    }
    socket.emit('createGame', quizData, (res) => {
      setCreating(false)
      if (res?.error) {
        setError(res.error || 'Failed to create game')
        return
      }
      dispatch({ type: 'SET_GAME', payload: { gameCode: res.gameCode, hostToken: res.hostToken } })
      dispatch({ type: 'SET_QUIZ', payload: quizData })
      navigate('/host/lobby')
    })
  }

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white mb-8"
        >
          Create Quiz
        </motion.h1>

        <Card className="mb-6">
          <Input
            label="Quiz Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter quiz title..."
          />
        </Card>

        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Add Question</h2>
          <QuestionEditor key={questions.length} value={draft} onChange={setDraft} />
          <Button
            variant="secondary"
            className="mt-4"
            onClick={handleAddQuestion}
          >
            Add Question
          </Button>
        </Card>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Questions ({questions.length})
          </h2>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {questions.map((q, i) => (
                <motion.div
                  key={i}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{q.text || '(No text)'}</p>
                    <p className="text-sm text-white/50">{q.options?.length || 0} options</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveQuestion(i)}
                  >
                    Remove
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleCreateQuiz}
          disabled={questions.length < 1 || !connected || creating}
          loading={creating}
        >
          Create Quiz
        </Button>
      </div>
    </PageWrapper>
  )
}
