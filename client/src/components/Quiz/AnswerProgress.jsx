import { motion } from 'framer-motion'

export default function AnswerProgress({ answered, total, perOption }) {
  const progress = total > 0 ? answered / total : 0

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-white/80">
        <span>{answered} of {total} answered</span>
        <span>{Math.round(progress * 100)}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full bg-indigo-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      {perOption && perOption.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mt-4">
          {perOption.map((count, i) => (
            <div key={i} className="text-center">
              <div className="h-12 rounded bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full bg-indigo-500/50"
                  initial={{ height: 0 }}
                  animate={{ height: `${(count / total) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-xs text-white/60">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
