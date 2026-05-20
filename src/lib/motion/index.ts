import type { Transition, Variants } from 'framer-motion'

export const spring = {
  smooth: { type: 'spring', stiffness: 300, damping: 30 } as Transition,
  snappy: { type: 'spring', stiffness: 500, damping: 40 } as Transition,
  gentle: { type: 'spring', stiffness: 200, damping: 25 } as Transition,
}

export const ease = {
  apple: [0.16, 1, 0.3, 1] as [number, number, number, number],
  out:   [0.0,  0, 0.2, 1] as [number, number, number, number],
  in:    [0.4,  0, 1.0, 1] as [number, number, number, number],
}

export const variants = {
  fadeUp: {
    hidden:  { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: ease.apple } },
  } as Variants,

  fadeIn: {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.25 } },
  } as Variants,

  cardEnter: {
    hidden:  { opacity: 0, y: 8, scale: 0.99 },
    visible: { opacity: 1, y: 0, scale: 1, transition: spring.smooth },
  } as Variants,

  modal: {
    hidden:  { opacity: 0, scale: 0.96, y: 8 },
    visible: { opacity: 1, scale: 1,    y: 0, transition: spring.snappy },
    exit:    { opacity: 0, scale: 0.96, y: 4, transition: { duration: 0.15, ease: ease.in } },
  } as Variants,

  slideRight: {
    hidden:  { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: ease.apple } },
    exit:    { opacity: 0, x: 20,  transition: { duration: 0.2,  ease: ease.in } },
  } as Variants,

  stagger: {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.05 } },
  } as Variants,

  staggerSlow: {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.1 } },
  } as Variants,
}

export const tapScale = { scale: 0.98 }

export const hoverLift = {
  whileHover: { y: -2, transition: spring.gentle },
  whileTap:   { scale: 0.98, transition: { duration: 0.1 } },
}
