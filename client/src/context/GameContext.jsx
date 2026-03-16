import { createContext, useContext, useReducer } from 'react'

const initialState = {
  gameCode: null,
  hostToken: null,
  state: 'idle',
  quiz: null,
  currentQuestion: null,
  questionIndex: 0,
  totalQuestions: 0,
  participants: [],
  leaderboard: [],
  finalLeaderboard: [],
  correctIndex: null,
  endsAt: null,
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_GAME':
      return { ...state, gameCode: action.payload.gameCode, hostToken: action.payload.hostToken }
    case 'SET_QUIZ':
      return { ...state, quiz: action.payload }
    case 'PARTICIPANTS_UPDATED':
      return { ...state, participants: action.payload }
    case 'QUESTION_START':
      return {
        ...state,
        currentQuestion: action.payload.question,
        questionIndex: action.payload.questionIndex,
        totalQuestions: action.payload.totalQuestions,
        endsAt: action.payload.endsAt,
        state: 'question',
      }
    case 'REVEAL':
      return {
        ...state,
        leaderboard: action.payload.leaderboard,
        correctIndex: action.payload.correctIndex,
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
          },
        })
        break
      case 'reveal':
        dispatch({
          type: 'REVEAL',
          payload: { leaderboard: payload.leaderboard, correctIndex: payload.correctIndex },
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
