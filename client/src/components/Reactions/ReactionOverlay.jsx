import { useReactions } from '../../context/ReactionContext'

export default function ReactionOverlay() {
  const { floatingReactions } = useReactions()

  if (floatingReactions.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {floatingReactions.map((r) => (
        <span
          key={r.id}
          className="absolute text-3xl sm:text-4xl animate-float-up"
          style={{ left: `${r.x}%`, bottom: '10%' }}
        >
          {r.emoji}
        </span>
      ))}
    </div>
  )
}
