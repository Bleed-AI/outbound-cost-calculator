'use client'

import { useEffect, useRef, useState } from 'react'
import { useSpring, useTransform, motion, useMotionValue } from 'framer-motion'

interface AnimatedNumberProps {
  value: number
  format?: (n: number) => string
  className?: string
}

const defaultFormat = (n: number) =>
  '$' + Math.round(Math.abs(n)).toLocaleString()

export function AnimatedNumber({
  value,
  format = defaultFormat,
  className,
}: AnimatedNumberProps) {
  const [mounted, setMounted] = useState(false)
  const motionValue = useMotionValue(value)
  const springValue = useSpring(motionValue, {
    stiffness: 80,
    damping: 25,
    mass: 1,
  })
  const display = useTransform(springValue, (v) => format(v))
  const prevValue = useRef(value)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && value !== prevValue.current) {
      motionValue.set(value)
      prevValue.current = value
    }
  }, [value, motionValue, mounted])

  // Server + first client render: static text (no hydration mismatch)
  // After mount: Framer Motion takes over for animated transitions
  if (!mounted) {
    return <span className={className}>{format(value)}</span>
  }

  return <motion.span className={className}>{display}</motion.span>
}
