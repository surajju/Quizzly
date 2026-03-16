import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGameEvents } from '../../hooks/useGame'
import { useGame } from '../../context/GameContext'
import { useSocket } from '../../context/SocketContext'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import QuestionDisplay from '../../components/Quiz/QuestionDisplay'
import CountdownTimer from '../../components/Timer/CountdownTimer'
import AnswerProgress from '../../components/Quiz/AnswerProgress'
import PageWrapper from '../../components/layout/PageWrapper'
import GameHeader from '../../components/layout/GameHeader'

const optionColors = [
  'bg-red-500/20 border-red-500/50',
  'bg-blue-500/20 border-blue-500/50',
  'bg-emerald-500/20 border-emerald-500/50',
  'bg-amber-500/20 border-amber-500/50',
]

export default function HostQuestion() {
  const { gameCode, hostToken, currentQuestion, questionIndex, totalQuestions, participants, endsAt } = useGame()
  const { socket } = useSocket()
  const [answeredCount, setAnsweredCount] = useState(0)
  const [perOption, setPerOption] = useState([])

  useGameEvents()

  useEffect(() => {
    if (!socket) return
    const onAnswerUpdate = (data) => {
      setAnsweredCount((prev) => prev + 1)
      if (data.optionIndex != null) {
        setPerOption((prev) => {
          const next = [...prev]
          while (next.length <= data.optionIndex) next.push(0)
          next[data.optionIndex] += 1
          return next
        })
      }
    }
    socket.on('answerUpdate', onAnswerUpdate)
    return () => socket.off('answerUpdate', onAnswerUpdate)
  }, [socket])

  useEffect(() => {
    setAnsweredCount(0)
    setPerOption([])
  }, [questionIndex])

  const handleReveal = () => {
    socket.emit('revealAnswer', gameCode, hostToken, (res) => {
      if (res?.error) console.error(res.error)
    })
  }

  const total = participants?.length || 0

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        <GameHeader />
        <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
          <QuestionDisplay
            question={currentQuestion}
            questionIndex={questionIndex}
            totalQuestions={totalQuestions}
          >
            <div className="space-y-3 mt-6">
              {currentQuestion?.options?.map((opt, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 px-6 py-4 rounded-xl border-2 ${optionColors[i % 4]} text-white`}
                >
                  <span className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center font-bold">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{opt}</span>
                </div>
              ))}
            </div>
          </QuestionDisplay>
          <div className="flex justify-center sm:justify-end">
            <CountdownTimer endsAt={endsAt} size={100} />
          </div>
        </div>

        <Card className="mb-6">
          <AnswerProgress answered={answeredCount} total={total} perOption={perOption.length ? perOption : undefined} />
        </Card>

        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={handleReveal}
        >
          Reveal Answer
        </Button>
      </div>
    </PageWrapper>
  )
}
