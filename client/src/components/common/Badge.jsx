import { motion } from 'framer-motion'

const variants = {
  success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  danger: 'bg-red-500/20 text-red-300 border-red-500/30',
  warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  info: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
}

export default function Badge({
  variant = 'info',
  children,
  className = '',
  ...props
}) {
  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`
        inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
        border ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.span>
  )
}
