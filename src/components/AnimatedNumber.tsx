'use client'

import { useEffect, useRef } from 'react'
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
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, {
    stiffness: 80,
    damping: 25,
    mass: 1,
  })
  const display = useTransform(springValue, (v) => format(v))
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!hasAnimated.current) {
      // Skip animation on first render — show value immediately
      motionValue.jump(value)
      hasAnimated.current = true
    } else {
      motionValue.set(value)
    }
  }, [value, motionValue])

  return <motion.span className={className}>{display}</motion.span>
}
