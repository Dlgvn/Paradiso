'use client'

import React, { createContext, useContext, useState } from 'react'

interface BackdropState {
  src: string | null
  key: string
}

interface BackdropContextValue extends BackdropState {
  setBackdrop: (src: string | null, key: string) => void
}

const BackdropContext = createContext<BackdropContextValue>({
  src: null,
  key: 'default',
  setBackdrop: () => {},
})

export function BackdropProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BackdropState>({ src: null, key: 'default' })

  const setBackdrop = (src: string | null, key: string) => {
    setState({ src, key })
  }

  return (
    <BackdropContext.Provider value={{ ...state, setBackdrop }}>
      {children}
    </BackdropContext.Provider>
  )
}

export function useBackdrop() {
  return useContext(BackdropContext)
}
