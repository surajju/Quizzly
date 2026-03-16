import { motion } from 'framer-motion'

export default function QuestionDisplay({
  question,
  questionIndex,
  totalQuestions,
  children,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <p className="text-white/60 text-sm">
        Question {questionIndex + 1} of {totalQuestions}
      </p>
      {question?.imageUrl && (
        <div className="rounded-xl overflow-hidden border border-white/10 bg-white/5">
          <img
            src={question.imageUrl}
            alt=""
            className="max-h-48 sm:max-h-64 w-full object-contain"
            onError={(e) => { e.target.parentElement.style.display = 'none' }}
          />
        </div>
      )}
      <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
        {question?.text}
      </h2>
      {children && (
        <div className="mt-8">
          {children}
        </div>
      )}
    </motion.div>
  )
}
