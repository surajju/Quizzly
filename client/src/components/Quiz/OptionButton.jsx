import { motion } from 'framer-motion'

const optionColors = {
  0: { bg: 'bg-red-500/20', border: 'border-red-500/50', hover: 'hover:bg-red-500/30', selected: 'bg-red-500/40 border-red-400' },
  1: { bg: 'bg-blue-500/20', border: 'border-blue-500/50', hover: 'hover:bg-blue-500/30', selected: 'bg-blue-500/40 border-blue-400' },
  2: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', hover: 'hover:bg-emerald-500/30', selected: 'bg-emerald-500/40 border-emerald-400' },
  3: { bg: 'bg-amber-500/20', border: 'border-amber-500/50', hover: 'hover:bg-amber-500/30', selected: 'bg-amber-500/40 border-amber-400' },
}

const stateStyles = {
  default: '',
  selected: 'ring-2 ring-white scale-[1.02]',
  correct: 'bg-emerald-500/50 border-emerald-400',
  wrong: 'bg-red-500/50 border-red-400 opacity-70',
  disabled: 'opacity-50 cursor-not-allowed',
}

export default function OptionButton({
  letter,
  text,
  index,
  state = 'default',
  onClick,
  disabled = false,
}) {
  const colors = optionColors[index % 4]
  const stateClass = stateStyles[state]

  return (
    <motion.button
      type="button"
      whileHover={!disabled ? { scale: 1.01 } : undefined}
      whileTap={!disabled ? { scale: 0.99 } : undefined}
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full flex items-center gap-4 px-6 py-4 rounded-xl
        border-2 text-left font-medium text-white
        transition-all duration-200
        ${colors.bg} ${colors.border} ${colors.hover}
        ${stateClass}
        ${disabled ? stateStyles.disabled : ''}
      `}
    >
      <span
        className={`
          w-10 h-10 rounded-lg flex items-center justify-center
          font-bold text-lg
          ${state === 'correct' ? 'bg-emerald-500/50' : ''}
          ${state === 'wrong' ? 'bg-red-500/50' : ''}
        `}
      >
        {letter}
      </span>
      <span className="flex-1">{text}</span>
    </motion.button>
  )
}
