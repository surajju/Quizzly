import { useState, useEffect } from 'react'
import Button from '../common/Button'
import Input from '../common/Input'

const TIME_LIMITS = [10, 15, 20, 30]

export default function QuestionEditor({ value, onChange }) {
  const [text, setText] = useState(value?.text ?? '')
  const [options, setOptions] = useState(value?.options ?? ['', ''])
  const [correctIndex, setCorrectIndex] = useState(value?.correctIndex ?? 0)
  const [timeLimit, setTimeLimit] = useState(value?.timeLimit ?? 15)

  useEffect(() => {
    onChange?.({
      text,
      options: options.filter(Boolean),
      correctIndex,
      timeLimit,
    })
  }, [text, options, correctIndex, timeLimit])

  const addOption = () => {
    if (options.length >= 4) return
    const next = [...options, '']
    setOptions(next)
  }

  const removeOption = (i) => {
    if (options.length <= 2) return
    const next = options.filter((_, idx) => idx !== i)
    setCorrectIndex(
      correctIndex >= next.length ? next.length - 1 : correctIndex
    )
    setOptions(next)
  }

  const updateOption = (i, v) => {
    const next = [...options]
    next[i] = v
    setOptions(next)
  }

  return (
    <div className="space-y-4">
      <Input
        label="Question"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter your question..."
      />
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">
          Options (select correct)
        </label>
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="radio"
                name="correct"
                checked={correctIndex === i}
                onChange={() => setCorrectIndex(i)}
                className="w-4 h-4 text-indigo-500"
              />
              <Input
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeOption(i)}
                disabled={options.length <= 2}
              >
                −
              </Button>
            </div>
          ))}
        </div>
        {options.length < 4 && (
          <Button variant="ghost" size="sm" onClick={addOption} className="mt-2">
            + Add option
          </Button>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">
          Time limit (seconds)
        </label>
        <div className="flex gap-2">
          {TIME_LIMITS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTimeLimit(t)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium
                transition-colors
                ${
                  timeLimit === t
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }
              `}
            >
              {t}s
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
