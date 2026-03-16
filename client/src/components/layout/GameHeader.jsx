import { useGame } from '../../context/GameContext'
import { usePlayer } from '../../context/PlayerContext'

export default function GameHeader() {
  const { quizTitle, gameCode, questionIndex, totalQuestions, state } = useGame()
  const { nickname } = usePlayer()

  if (!gameCode) return null

  return (
    <div className="flex items-center justify-between mb-6 px-1">
      <div className="flex items-center gap-3">
        <span className="text-lg">🔥</span>
        <div>
          <h3 className="text-white font-semibold text-sm leading-tight">
            {quizTitle || 'Quiz'}
          </h3>
          <p className="text-white/50 text-xs">
            Code: {gameCode}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {state === 'question' || state === 'reveal' ? (
          <span className="text-white/60 text-sm">
            Q{questionIndex + 1}/{totalQuestions}
          </span>
        ) : null}
        {nickname && (
          <span className="text-indigo-300 text-sm font-medium">
            {nickname}
          </span>
        )}
      </div>
    </div>
  )
}
