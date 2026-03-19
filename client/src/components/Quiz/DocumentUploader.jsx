import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { generateFromDocument } from '../../services/api'
import Button from '../common/Button'

const ACCEPTED_TYPES = '.pdf,.txt'
const MAX_SIZE_MB = 5

export default function DocumentUploader({ onGenerated }) {
  const [inputMode, setInputMode] = useState('upload')
  const [file, setFile] = useState(null)
  const [pastedText, setPastedText] = useState('')
  const [count, setCount] = useState(5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const handleFile = (f) => {
    if (!f) return
    const ext = f.name.split('.').pop()?.toLowerCase()
    if (!['pdf', 'txt'].includes(ext)) {
      setError('Please upload a PDF or TXT file')
      return
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`)
      return
    }
    setError('')
    setFile(f)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    handleFile(f)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleGenerate = async () => {
    setError('')
    if (inputMode === 'upload' && !file) {
      setError('Please select a file')
      return
    }
    if (inputMode === 'paste' && !pastedText.trim()) {
      setError('Please paste some text')
      return
    }
    if (inputMode === 'paste' && pastedText.trim().length < 50) {
      setError('Text is too short. Please provide more content (at least 50 characters).')
      return
    }

    setLoading(true)
    try {
      const data = await generateFromDocument(
        inputMode === 'upload' ? file : null,
        inputMode === 'paste' ? pastedText.trim() : null,
        count
      )
      onGenerated?.(data.questions, data.source || 'Document')
    } catch (err) {
      setError(err.message || 'Failed to generate questions')
    } finally {
      setLoading(false)
    }
  }

  const removeFile = () => {
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">📄</span>
        <h3 className="text-lg font-semibold text-white">Quiz from Document</h3>
      </div>

      <p className="text-white/50 text-sm">
        Upload a PDF or text file, or paste content directly. AI will generate questions based on the material.
      </p>

      {/* Toggle between upload and paste */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setInputMode('upload'); setError('') }}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            inputMode === 'upload'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
              : 'bg-white/5 text-white/50 hover:bg-white/10 border border-white/10'
          }`}
        >
          📁 Upload File
        </button>
        <button
          type="button"
          onClick={() => { setInputMode('paste'); setError('') }}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            inputMode === 'paste'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
              : 'bg-white/5 text-white/50 hover:bg-white/10 border border-white/10'
          }`}
        >
          📋 Paste Text
        </button>
      </div>

      {inputMode === 'upload' ? (
        <>
          {/* Drag and drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
              dragOver
                ? 'border-indigo-400 bg-indigo-500/10'
                : file
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/8'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES}
              onChange={(e) => handleFile(e.target.files?.[0])}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center gap-3">
                <span className="text-3xl">
                  {file.name.endsWith('.pdf') ? '📕' : '📝'}
                </span>
                <div className="text-left">
                  <p className="text-white font-medium text-sm">{file.name}</p>
                  <p className="text-white/40 text-xs">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeFile() }}
                  className="ml-2 p-1.5 rounded-lg bg-white/10 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <span className="text-4xl opacity-60">📂</span>
                <p className="text-white/60 text-sm text-center">
                  <span className="text-indigo-400 font-medium">Click to browse</span> or drag and drop
                </p>
                <p className="text-white/30 text-xs">PDF or TXT · Max {MAX_SIZE_MB}MB</p>
              </>
            )}
          </div>
        </>
      ) : (
        <textarea
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          placeholder="Paste your document text, notes, article, or any content here..."
          rows={7}
          className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-white/8 transition-colors resize-none"
        />
      )}

      {/* Question count selector */}
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
        disabled={
          loading ||
          (inputMode === 'upload' && !file) ||
          (inputMode === 'paste' && !pastedText.trim())
        }
        loading={loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="inline-block"
            >
              📄
            </motion.span>
            Analyzing document...
          </span>
        ) : (
          '📄 Generate from Document'
        )}
      </Button>

      {loading && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-white/40 text-sm"
        >
          AI is reading your document and crafting questions... this may take a few seconds
        </motion.p>
      )}
    </div>
  )
}
