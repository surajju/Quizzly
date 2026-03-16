import { motion, AnimatePresence } from 'framer-motion'

export default function PageWrapper({ children, key }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl mx-auto px-4 py-8"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
