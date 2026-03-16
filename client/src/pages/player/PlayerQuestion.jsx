import { useGameEvents } from '../../hooks/useGame'
import { useGame } from '../../context/GameContext'
import { usePlayer } from '../../context/PlayerContext'
import { useSocket } from '../../context/SocketContext'
import QuestionDisplay from '../../components/Quiz/QuestionDisplay'
import OptionButton from '../../components/Quiz/OptionButton'
import CountdownTimer from '../../components/Timer/CountdownTimer'
import PageWrapper from '../../components/layout/PageWrapper'
import GameHeader from '../../components/layout/GameHeader'

export default function PlayerQuestion() {
  const { gameCode, currentQuestion, questionIndex, totalQuestions, endsAt } = useGame()
  const { socket } = useSocket()
  const { selectedAnswer, answerSubmitted, setSelectedAnswer, setAnswerSubmitted } = usePlayer()

  useGameEvents()

  const handleOptionClick = (index) => {
    if (answerSubmitted) return
    setSelectedAnswer(index)
    socket.emit('submitAnswer', gameCode, index, (res) => {
      if (res?.error) {
        setSelectedAnswer(null)
        return
      }
      setAnswerSubmitted(true)
    })
  }

  const getOptionState = (index) => {
    if (!answerSubmitted) return selectedAnswer === index ? 'selected' : 'default'
    return selectedAnswer === index ? 'selected' : 'disabled'
  }

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        <GameHeader />
        <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
          <div className="flex-1">
            <QuestionDisplay
              question={currentQuestion}
              questionIndex={questionIndex}
              totalQuestions={totalQuestions}
            />
          </div>
          <CountdownTimer endsAt={endsAt} size={80} />
        </div>

        {answerSubmitted ? (
          <div className="space-y-4">
            <p className="text-emerald-400 font-medium text-center">Answer submitted!</p>
            <div className="space-y-3">
              {currentQuestion?.options?.map((opt, i) => (
                <OptionButton
                  key={i}
                  letter={String.fromCharCode(65 + i)}
                  text={opt}
                  index={i}
                  state={getOptionState(i)}
                  onClick={() => {}}
                  disabled
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {currentQuestion?.options?.map((opt, i) => (
              <OptionButton
                key={i}
                letter={String.fromCharCode(65 + i)}
                text={opt}
                index={i}
                state={getOptionState(i)}
                onClick={() => handleOptionClick(i)}
              />
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
