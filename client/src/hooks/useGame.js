import { useEffect } from 'react'
import { useSocket } from '../context/SocketContext'
import { useGameContext } from '../context/GameContext'
import { usePlayer } from '../context/PlayerContext'

export function useGameEvents() {
  const { socket } = useSocket()
  const { dispatch } = useGameContext()
  const { resetAnswerState } = usePlayer()

  useEffect(() => {
    if (!socket) return

    const onParticipantsUpdated = (data) => {
      dispatch({ type: 'PARTICIPANTS_UPDATED', payload: data.participants ?? data })
    }

    const onQuestionStart = (payload) => {
      resetAnswerState()
      dispatch({
        type: 'QUESTION_START',
        payload: {
          question: payload.question,
          questionIndex: payload.questionIndex,
          totalQuestions: payload.totalQuestions,
          endsAt: payload.endsAt,
        },
      })
    }

    const onReveal = (payload) => {
      dispatch({
        type: 'REVEAL',
        payload: { leaderboard: payload.leaderboard, correctIndex: payload.correctIndex },
      })
    }

    const onQuizEnd = (data) => {
      dispatch({ type: 'QUIZ_END', payload: data.finalLeaderboard ?? data })
    }

    socket.on('participantsUpdated', onParticipantsUpdated)
    socket.on('questionStart', onQuestionStart)
    socket.on('reveal', onReveal)
    socket.on('quizEnd', onQuizEnd)

    return () => {
      socket.off('participantsUpdated', onParticipantsUpdated)
      socket.off('questionStart', onQuestionStart)
      socket.off('reveal', onReveal)
      socket.off('quizEnd', onQuizEnd)
    }
  }, [socket, dispatch, resetAnswerState])
}
