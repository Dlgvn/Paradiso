'use client'

import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useBackdrop } from './BackdropContext'

export function BackdropLayer() {
  const { src, key: backdropKey } = useBackdrop()

  return (
    <div className="fixed inset-0 -z-10">
      <AnimatePresence>
        {src && (
          <motion.div
            key={backdropKey}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <Image
              src={src}
              alt=""
              fill
              className="object-cover object-center"
              priority
              quality={60}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Gradient scrim — fades poster to solid dark at bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-backdrop-mid to-backdrop-base" />
    </div>
  )
}
