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
  alreadyCompletedQuestNum: number
}>({
  gameQuest: [],
  questStatusQuery: () => QUEST_STATUS.UNKNOWN,
  lockedQuestNum: 0,
  unlockedQuestNum: 0,
  completedQuestNum: 0,
  alreadyCompletedQuestNum: 0,
})

const useQuestStatusQuery = (inProgressQuests: GameQuest[]) => {
  const gameQuestIds = inProgressQuests.map((quest) => quest.api_no)
  const unlockedGameQuest = Object.fromEntries(
    inProgressQuests.map((quest) => [quest.api_no, quest])
  )
  const alreadyCompletedQuest = getCompletedQuest(gameQuestIds)
  const lockedQuest = getLockedQuest(gameQuestIds)
  const completedQuest = inProgressQuests
    .map((quest) => questApiStateToQuestStatus(quest.api_state))
    .filter((status) => status === QUEST_STATUS.COMPLETED)
  return {
    lockedQuestNum: Object.keys(lockedQuest).length,
    unlockedQuestNum: Object.keys(unlockedGameQuest).length,
    completedQuestNum: completedQuest.length,
    alreadyCompletedQuestNum: Object.keys(alreadyCompletedQuest).length,
    questStatusQuery: (gameId: number) => {
      const theGameQuest = unlockedGameQuest[gameId]
      if (theGameQuest) {
        // the quest is in game
        return questApiStateToQuestStatus(theGameQuest.api_state)
      }

      if (gameId in lockedQuest) {
        return QUEST_STATUS.LOCKED
      }
      if (gameId in alreadyCompletedQuest) {
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
    alreadyCompletedQuestNum,
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
        alreadyCompletedQuestNum,
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
  const {
    lockedQuestNum,
    unlockedQuestNum,
    completedQuestNum,
    alreadyCompletedQuestNum,
  } = useContext(GameQuestContext)
  return {
    lockedQuestNum,
    unlockedQuestNum,
    completedQuestNum,
    alreadyCompletedQuestNum,
  }
}
