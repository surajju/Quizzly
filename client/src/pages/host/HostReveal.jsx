import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGameEvents } from '../../hooks/useGame'
import { useGame } from '../../context/GameContext'
import { useSocket } from '../../context/SocketContext'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import QuestionDisplay from '../../components/Quiz/QuestionDisplay'
import Leaderboard from '../../components/Leaderboard/Leaderboard'
import AnswerProgress from '../../components/Quiz/AnswerProgress'
import PageWrapper from '../../components/layout/PageWrapper'
import GameHeader from '../../components/layout/GameHeader'
import ChatBox from '../../components/Chat/ChatBox'

const optionColors = [
  'bg-red-500/20 border-red-500/50',
  'bg-blue-500/20 border-blue-500/50',
  'bg-emerald-500/20 border-emerald-500/50',
  'bg-amber-500/20 border-amber-500/50',
]

export default function HostReveal() {
  const { gameCode, hostToken, currentQuestion, questionIndex, totalQuestions, correctIndex, leaderboard, participants } = useGame()
  const { socket } = useSocket()
  const [perOption, setPerOption] = useState([])

  useGameEvents()

  useEffect(() => {
    if (!socket) return
    const onAnswerUpdate = (data) => {
      if (data.perOption) setPerOption(data.perOption)
    }
    socket.on('answerUpdate', onAnswerUpdate)
    return () => socket.off('answerUpdate', onAnswerUpdate)
  }, [socket])

  const handleNextQuestion = () => {
    socket.emit('nextQuestion', gameCode, hostToken, (res) => {
      if (res?.error) console.error(res.error)
    })
  }

  const total = participants?.length || 0
  const answered = perOption?.reduce((a, b) => a + b, 0) || 0

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        <GameHeader />
        <QuestionDisplay
          question={currentQuestion}
          questionIndex={questionIndex}
          totalQuestions={totalQuestions}
        >
          <div className="space-y-3 mt-6">
            {currentQuestion?.options?.map((opt, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0.8, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex items-center gap-4 px-6 py-4 rounded-xl border-2 ${
                  i === correctIndex ? 'bg-emerald-500/40 border-emerald-400' : optionColors[i % 4]
                } text-white`}
              >
                <span className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center font-bold">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{opt}</span>
                {i === correctIndex && <span className="text-emerald-300">✓ Correct</span>}
              </motion.div>
            ))}
          </div>
        </QuestionDisplay>

        <Card className="my-6">
          <AnswerProgress answered={answered} total={total} perOption={perOption} />
        </Card>

        <div className="mb-6">
          <Leaderboard leaderboard={leaderboard} />
        </div>

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleNextQuestion}
        >
          {questionIndex + 1 >= totalQuestions ? 'End Quiz' : 'Next Question'}
        </Button>

        <div className="mt-4">
          <ChatBox collapsed />
        </div>
      </div>
    </PageWrapper>
  )
}
