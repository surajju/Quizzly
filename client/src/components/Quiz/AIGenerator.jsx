import { useState } from 'react'
import { motion } from 'framer-motion'
import { generateQuestions } from '../../services/api'
import Button from '../common/Button'
import Input from '../common/Input'

const SUGGESTIONS = [
  'World History',
  'Space & Astronomy',
  'Famous Inventions',
  'Human Body',
  'JavaScript Programming',
  'Classic Literature',
  'Olympic Games',
  'Animals & Wildlife',
]

export default function AIGenerator({ onGenerated }) {
  const [topic, setTopic] = useState('')
  const [count, setCount] = useState(5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic')
      return
    }
    setError('')
    setLoading(true)
    try {
      const data = await generateQuestions(topic.trim(), count)
      onGenerated?.(data.questions, data.topic)
    } catch (err) {
      setError(err.message || 'Generation failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestion = (s) => {
    setTopic(s)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">✨</span>
        <h3 className="text-lg font-semibold text-white">AI Question Generator</h3>
      </div>

      <p className="text-white/50 text-sm">
        Enter any topic and AI will generate quiz questions instantly.
      </p>

      <Input
        label="Topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="e.g. Solar System, World War II, Python basics..."
        onKeyDown={(e) => e.key === 'Enter' && !loading && handleGenerate()}
      />

      <div>
        <p className="text-xs text-white/40 mb-2">Quick suggestions:</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSuggestion(s)}
              className={`px-3 py-1 rounded-full text-xs transition-all ${
                topic === s
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">
          Number of questions
        </label>
        <div className="flex gap-2">
          {[3, 5, 8, 10].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setCount(n)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                count === n
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <Button
        variant="primary"
        className="w-full"
        onClick={handleGenerate}
        disabled={!topic.trim() || loading}
        loading={loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="inline-block"
            >
              ✨
            </motion.span>
            Generating...
          </span>
        ) : (
          '✨ Generate Questions'
        )}
      </Button>

      {loading && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-white/40 text-sm"
        >
          AI is crafting your questions... this takes a few seconds
        </motion.p>
      )}
    </div>
  )
}
