import * as React from "react"

const MOBILE_BREAKPOINT = 768
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

const getSnapshot = () => window.matchMedia(QUERY).matches
// The server can't know the viewport; render the desktop layout (the desktop
// sidebar is CSS-hidden below md, so mobile users don't see it).
const getServerSnapshot = () => false

export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
