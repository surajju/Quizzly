import { useEffect } from 'react'
import { useSocket } from '../context/SocketContext'
import { useGameContext } from '../context/GameContext'
import { usePlayer } from '../context/PlayerContext'

export function useGameEvents() {
  const { socket } = useSocket()
  const gameCtx = useGameContext()
  const { dispatch } = gameCtx
  const { resetAnswerState, nickname } = usePlayer()

  useEffect(() => {
    if (!socket) return

    const onConnect = () => {
      if (gameCtx.gameCode && nickname && gameCtx.state !== 'idle') {
        socket.emit('joinGame', gameCtx.gameCode, nickname, (res) => {
          if (res?.error) console.error('Auto-rejoin failed:', res.error)
        })
      }
    }

    socket.on('connect', onConnect)
    return () => socket.off('connect', onConnect)
  }, [socket, gameCtx.gameCode, gameCtx.state, nickname])

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
          quizTitle: payload.quizTitle,
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

    const onReconnected = (state) => {
      if (state.participants) {
        dispatch({ type: 'PARTICIPANTS_UPDATED', payload: state.participants })
      }
      if (state.quizTitle) {
        dispatch({ type: 'SET_QUIZ_TITLE', payload: state.quizTitle })
      }
      if (state.state === 'question' && state.question) {
        dispatch({
          type: 'QUESTION_START',
          payload: {
            question: state.question,
            questionIndex: state.questionIndex,
            totalQuestions: state.totalQuestions,
            endsAt: state.endsAt,
            quizTitle: state.quizTitle,
          },
        })
      }
      if (state.state === 'reveal' && state.leaderboard) {
        dispatch({
          type: 'REVEAL',
          payload: { leaderboard: state.leaderboard, correctIndex: state.correctIndex },
        })
      }
      if (state.state === 'ended' && state.finalLeaderboard) {
        dispatch({ type: 'QUIZ_END', payload: state.finalLeaderboard })
      }
    }

    socket.on('participantsUpdated', onParticipantsUpdated)
    socket.on('questionStart', onQuestionStart)
    socket.on('reveal', onReveal)
    socket.on('quizEnd', onQuizEnd)
    socket.on('reconnected', onReconnected)

    return () => {
      socket.off('participantsUpdated', onParticipantsUpdated)
      socket.off('questionStart', onQuestionStart)
      socket.off('reveal', onReveal)
      socket.off('quizEnd', onQuizEnd)
      socket.off('reconnected', onReconnected)
    }
  }, [socket, dispatch, resetAnswerState])
}
