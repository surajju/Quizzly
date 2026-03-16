import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getTemplates, getTemplate } from '../../services/api'
import Card from '../common/Card'

export default function TemplateSelector({ onSelect }) {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingId, setLoadingId] = useState(null)

  useEffect(() => {
    getTemplates()
      .then(setTemplates)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSelect = async (id) => {
    setLoadingId(id)
    try {
      const template = await getTemplate(id)
      onSelect?.(template)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingId(null)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-32 rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {templates.map((t, i) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Card
            className={`cursor-pointer hover:border-indigo-500/50 transition-all ${
              loadingId === t.id ? 'opacity-70' : ''
            }`}
            onClick={() => handleSelect(t.id)}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{t.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold">{t.title}</h3>
                <p className="text-white/50 text-sm mt-1 line-clamp-2">{t.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full">{t.category}</span>
                  <span className="text-xs text-white/40">{t.questionCount} questions</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
