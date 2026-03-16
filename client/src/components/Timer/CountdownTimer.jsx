import { useTimer } from '../../hooks/useTimer'

function getColor(progress) {
  if (progress < 0.5) return '#10b981'
  if (progress < 0.75) return '#f59e0b'
  return '#ef4444'
}

export default function CountdownTimer({ endsAt, size = 80 }) {
  const { timeLeft, progress, isExpired } = useTimer(endsAt)
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * progress
  const color = getColor(progress)

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="4"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-100"
        />
      </svg>
      <span
        className={`
          absolute text-lg font-bold
          ${isExpired ? 'text-red-400' : 'text-white'}
        `}
      >
        {timeLeft}
      </span>
    </div>
  )
}
