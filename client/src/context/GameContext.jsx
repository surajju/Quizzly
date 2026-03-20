import { createContext, useContext, useReducer } from 'react'

const initialState = {
  gameCode: null,
  hostToken: null,
  state: 'idle',
  quiz: null,
  quizTitle: null,
  currentQuestion: null,
  questionIndex: 0,
  totalQuestions: 0,
  participants: [],
  leaderboard: [],
  finalLeaderboard: [],
  correctIndex: null,
  isPoll: false,
  pollResults: null,
  endsAt: null,
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_GAME':
      return { ...state, gameCode: action.payload.gameCode, hostToken: action.payload.hostToken }
    case 'SET_QUIZ':
      return { ...state, quiz: action.payload, quizTitle: action.payload?.title ?? state.quizTitle }
    case 'SET_QUIZ_TITLE':
      return { ...state, quizTitle: action.payload }
    case 'PARTICIPANTS_UPDATED':
      return { ...state, participants: action.payload }
    case 'QUESTION_START':
      return {
        ...state,
        currentQuestion: action.payload.question,
        questionIndex: action.payload.questionIndex,
        totalQuestions: action.payload.totalQuestions,
        endsAt: action.payload.endsAt,
        quizTitle: action.payload.quizTitle ?? state.quizTitle,
        state: 'question',
      }
    case 'REVEAL':
      return {
        ...state,
        leaderboard: action.payload.leaderboard,
        correctIndex: action.payload.correctIndex,
        isPoll: action.payload.isPoll || false,
        pollResults: action.payload.pollResults || null,
        state: 'reveal',
      }
    case 'QUIZ_END':
      return {
        ...state,
        finalLeaderboard: action.payload,
        state: 'ended',
      }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

const GameContext = createContext(null)

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  const setGameCode = (gameCode, hostToken) =>
    dispatch({ type: 'SET_GAME', payload: { gameCode, hostToken } })
  const setHostToken = (hostToken) =>
    dispatch({ type: 'SET_GAME', payload: { gameCode: state.gameCode, hostToken } })
  const setQuiz = (quiz) => dispatch({ type: 'SET_QUIZ', payload: quiz })
  const reset = () => dispatch({ type: 'RESET' })

  const updateFromEvent = (event, payload) => {
    switch (event) {
      case 'participantsUpdated':
        dispatch({ type: 'PARTICIPANTS_UPDATED', payload })
        break
      case 'questionStart':
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
        break
      case 'reveal':
        dispatch({
          type: 'REVEAL',
          payload: { leaderboard: payload.leaderboard, correctIndex: payload.correctIndex, isPoll: payload.isPoll, pollResults: payload.pollResults },
        })
        break
      case 'quizEnd':
        dispatch({ type: 'QUIZ_END', payload })
        break
      default:
        break
    }
  }

  return (
    <GameContext.Provider
      value={{
        ...state,
        setGameCode,
        setHostToken,
        setQuiz,
        updateFromEvent,
        reset,
        dispatch,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGameContext() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGameContext must be used within GameProvider')
  return ctx
}

export const useGame = useGameContext
