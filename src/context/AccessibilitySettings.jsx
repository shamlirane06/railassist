import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AccessibilitySettingsContext = createContext(null)

export function AccessibilityProvider({ children }) {
  const [largeText, setLargeText] = useState(false)
  const [highContrast, setHighContrast] = useState(false)

  // Applied on <html> so rem-based type scales and contrast tokens switch app-wide.
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('ra-large-text', largeText)
    root.classList.toggle('ra-high-contrast', highContrast)
  }, [largeText, highContrast])

  const value = useMemo(() => ({
    largeText, setLargeText,
    highContrast, setHighContrast,
  }), [largeText, highContrast])

  return (
    <AccessibilitySettingsContext.Provider value={value}>
      {children}
    </AccessibilitySettingsContext.Provider>
  )
}

export function useAccessibilitySettings() {
  const context = useContext(AccessibilitySettingsContext)
  if (!context) throw new Error('useAccessibilitySettings must be used inside AccessibilityProvider')
  return context
}
