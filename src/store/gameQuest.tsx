import type { ReactNode } from 'react'
import React, { createContext, useContext } from 'react'
import { useGameQuest } from '../poi/hooks'
import { GameQuest } from '../poi/types'
import {
  getCompletedQuest,
  getLockedQuest,
  questApiStateToQuestStatus,
  QUEST_STATUS,
} from '../questHelper'

export const GameQuestContext = createContext<{
  gameQuest: GameQuest[]
  questStatusQuery: (gameId: number | null) => QUEST_STATUS
}>({} as any)

const useQuestStatusQuery = (gameQuest: GameQuest[]) => {
  const gameQuestId = gameQuest.map((quest) => quest.api_no)
  const completedQuest = getCompletedQuest(gameQuestId)
  const lockedQuest = getLockedQuest(gameQuestId)
  return (gameId: number | null) => {
    if (!gameId) {
      return QUEST_STATUS.UNKNOWN
    }

    const theGameQuest = gameQuest.find((quest) => quest.api_no === gameId)
    if (theGameQuest) {
      // the quest is in game
      return questApiStateToQuestStatus(theGameQuest.api_state)
    }

    if (gameId in lockedQuest) {
      return QUEST_STATUS.LOCKED
    }
    if (gameId in completedQuest) {
      return QUEST_STATUS.ALREADY_COMPLETED
    }
    return QUEST_STATUS.UNKNOWN
  }
}

export const GameQuestProvider = ({ children }: { children?: ReactNode }) => {
  const gameQuest = useGameQuest()
  const questStatusQuery = useQuestStatusQuery(gameQuest)

  return (
    <GameQuestContext.Provider value={{ gameQuest, questStatusQuery }}>
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
  const { gameQuest } = useContext(GameQuestContext)
  return gameQuest
}

/**
 * Get the questList from poi.
 *
 * Same as {@link useQuestStatusQuery}, but singleton
 */
export const useGlobalQuestStatusQuery = () => {
  const { questStatusQuery } = useContext(GameQuestContext)
  return questStatusQuery
}
