import { motion } from 'framer-motion'

export default function Card({
  children,
  glow = false,
  className = '',
  ...props
}) {
  return (
    <motion.div
      className={`
        rounded-xl p-6
        bg-white/5 backdrop-blur-md border border-white/10
        ${glow ? 'shadow-lg shadow-indigo-500/10' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  )
}
