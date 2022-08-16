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
  questStatusQuery: (gameId: number) => QUEST_STATUS
  lockedQuestNum: number
  unlockedQuestNum: number
  completedQuestNum: number
}>({
  gameQuest: [],
  questStatusQuery: () => QUEST_STATUS.UNKNOWN,
  lockedQuestNum: 0,
  unlockedQuestNum: 0,
  completedQuestNum: 0,
})

const useQuestStatusQuery = (gameQuest: GameQuest[]) => {
  const gameQuestId = gameQuest.map((quest) => quest.api_no)
  const unlockedGameQuest = Object.fromEntries(
    gameQuest.map((quest) => [quest.api_no, quest])
  )
  const completedQuest = getCompletedQuest(gameQuestId)
  const lockedQuest = getLockedQuest(gameQuestId)
  return {
    lockedQuestNum: Object.keys(lockedQuest).length,
    unlockedQuestNum: Object.keys(unlockedGameQuest).length,
    completedQuestNum: Object.keys(completedQuest).length,
    questStatusQuery: (gameId: number) => {
      const theGameQuest = unlockedGameQuest[gameId]
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
    },
  }
}

export const GameQuestProvider = ({ children }: { children?: ReactNode }) => {
  const gameQuest = useGameQuest()
  const {
    lockedQuestNum,
    unlockedQuestNum,
    completedQuestNum,
    questStatusQuery,
  } = useQuestStatusQuery(gameQuest)

  return (
    <GameQuestContext.Provider
      value={{
        gameQuest,
        questStatusQuery,
        lockedQuestNum,
        unlockedQuestNum,
        completedQuestNum,
      }}
    >
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

/**
 * Get the number of quests in different states.
 */
export const useGlobalQuestStatusNum = () => {
  const { lockedQuestNum, unlockedQuestNum, completedQuestNum } =
    useContext(GameQuestContext)
  return { lockedQuestNum, unlockedQuestNum, completedQuestNum }
}
