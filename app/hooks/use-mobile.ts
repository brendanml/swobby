import * as React from "react"

const MOBILE_BREAKPOINT = 768
const LG_BREAKPOINT = 1480

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px) and (max-width: ${LG_BREAKPOINT - 1}px)`)
    const onChange = () => {
      const w = window.innerWidth
      setIsTablet(w >= MOBILE_BREAKPOINT && w < LG_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    const w = window.innerWidth
    setIsTablet(w >= MOBILE_BREAKPOINT && w < LG_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isTablet
}
