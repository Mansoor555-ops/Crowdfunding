import React from 'react'
import { motion } from 'framer-motion'

export function Reveal({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32, filter: 'blur(4px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ 
        duration: 0.7, 
        delay, 
        ease: [0.22, 1, 0.36, 1] // UlmGrotesk decelerating settle curve
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
