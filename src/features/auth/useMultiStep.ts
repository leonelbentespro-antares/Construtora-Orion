import { useState, useCallback, useEffect } from 'react'

interface UseMultiStepOptions {
  totalSteps: number
  storageKey?: string
}

export function useMultiStep({ totalSteps, storageKey }: UseMultiStepOptions) {
  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (!storageKey) return 0
    const saved = localStorage.getItem(`${storageKey}:step`)
    return saved ? Math.min(parseInt(saved, 10), totalSteps - 1) : 0
  })

  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(`${storageKey}:step`, String(currentStep))
    }
  }, [currentStep, storageKey])

  const goNext = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, totalSteps - 1))
  }, [totalSteps])

  const goPrev = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0))
  }, [])

  const goTo = useCallback((step: number) => {
    setCurrentStep(Math.max(0, Math.min(step, totalSteps - 1)))
  }, [totalSteps])

  const reset = useCallback(() => {
    setCurrentStep(0)
    if (storageKey) localStorage.removeItem(`${storageKey}:step`)
  }, [storageKey])

  return {
    currentStep,
    totalSteps,
    goNext,
    goPrev,
    goTo,
    reset,
    isFirst: currentStep === 0,
    isLast:  currentStep === totalSteps - 1,
    progress: ((currentStep) / (totalSteps - 1)) * 100,
  }
}
