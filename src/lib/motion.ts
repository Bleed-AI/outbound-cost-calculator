import type { Variants, Transition } from 'framer-motion'

/* ── Scroll-reveal variants ─────────────────────────────── */

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

/* ── Spring transitions (stitch-skill spec) ─────────────── */

export const spring: Transition = {
  type: 'spring',
  stiffness: 100,
  damping: 20,
}

export const springFast: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 25,
}

export const counterSpring: Transition = {
  type: 'spring',
  stiffness: 80,
  damping: 25,
  mass: 1,
}

/* ── Stagger container ──────────────────────────────────── */

export const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

/* ── Modal variants ─────────────────────────────────────── */

export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 10 },
}
