import React, { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { GameQuest } from '../poi/types'
import { useGameQuest } from '../poi/hooks'

export const GameQuestContext = createContext<GameQuest[]>([])

export const GameQuestProvider = ({ children }: { children?: ReactNode }) => {
  const gameQuest = useGameQuest()
  return (
    <GameQuestContext.Provider value={gameQuest}>
      {children}
    </GameQuestContext.Provider>
  )
}

/**
 * Get the questList from poi.
 *
 * Same as {@link useGameQuest}, but singleton
 */
export const useGlobalGameQuest = () => {
  const gameQuest = useContext(GameQuestContext)
  return gameQuest
}
