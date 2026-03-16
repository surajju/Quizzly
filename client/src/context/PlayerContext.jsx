import { createContext, useContext, useReducer } from 'react'

const initialState = {
  nickname: '',
  score: 0,
  rank: null,
  prevRank: null,
  streak: 0,
  wasCorrect: null,
  pointsEarned: 0,
  selectedAnswer: null,
  answerSubmitted: false,
}

function playerReducer(state, action) {
  switch (action.type) {
    case 'SET_NICKNAME':
      return { ...state, nickname: action.payload }
    case 'SET_SELECTED_ANSWER':
      return { ...state, selectedAnswer: action.payload }
    case 'SET_ANSWER_SUBMITTED':
      return { ...state, answerSubmitted: action.payload }
    case 'UPDATE_FROM_LEADERBOARD':
      return { ...state, ...action.payload }
    case 'RESET':
      return initialState
    case 'RESET_ANSWER_STATE':
      return { ...state, selectedAnswer: null, answerSubmitted: false }
    default:
      return state
  }
}

const PlayerContext = createContext(null)

export function PlayerProvider({ children }) {
  const [state, dispatch] = useReducer(playerReducer, initialState)

  const setNickname = (nickname) => dispatch({ type: 'SET_NICKNAME', payload: nickname })
  const setSelectedAnswer = (index) => dispatch({ type: 'SET_SELECTED_ANSWER', payload: index })
  const setAnswerSubmitted = (value) => dispatch({ type: 'SET_ANSWER_SUBMITTED', payload: value })
  const reset = () => dispatch({ type: 'RESET' })
  const resetAnswerState = () => dispatch({ type: 'RESET_ANSWER_STATE' })

  const updateFromLeaderboard = (leaderboard, socketId) => {
    const entry = leaderboard?.find((e) => e.socketId === socketId)
    if (!entry) return
    const prevRank = state.rank
    dispatch({
      type: 'UPDATE_FROM_LEADERBOARD',
      payload: {
        score: entry.score,
        rank: entry.rank,
        prevRank,
        streak: entry.streak ?? 0,
        wasCorrect: entry.wasCorrect ?? null,
        pointsEarned: entry.pointsEarned ?? 0,
      },
    })
  }

  return (
    <PlayerContext.Provider
      value={{
        ...state,
        setNickname,
        setSelectedAnswer,
        setAnswerSubmitted,
        updateFromLeaderboard,
        reset,
        resetAnswerState,
        dispatch,
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider')
  return ctx
}
