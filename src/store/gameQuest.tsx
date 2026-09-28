import type { ReactNode } from 'react'
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useActiveQuest, useGameQuest } from '../poi/hooks'
import type { GameQuest } from '../poi/types'
import { QUEST_API_STATE } from '../poi/types'
import { getQuestPeriod } from '../questPeriod'
import type { QuestStateCache } from '../questPeriod'
import {
  QUEST_STATUS,
  getPostQuestMap,
  getVisiblePreQuestMap,
} from '../questHelper'
import { getAliveCompletedQuest, resolveQuestStatus } from '../questStatus'
import { useStore } from './store'

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

/** 状态重算间隔：跨周期（如周一 05:00 JST）后即使没有交互也能自动刷新 */
const STATUS_REFRESH_INTERVAL = 5 * 60 * 1000

/**
 * 判定用的「当前时间」。
 *
 * 不在渲染期直接调用 Date.now()（那会让渲染不纯），
 * 而是挂载后立刻取一次，之后按固定间隔刷新。
 * 首帧会取到 0，周期性记录先按「已跨周期」保守处理，随即被真实时间替换。
 */
const useQuestNow = () => {
  const [now, setNow] = useState(0)
  useEffect(() => {
    const update = () => setNow(Date.now())
    update()
    const timer = setInterval(update, STATUS_REFRESH_INTERVAL)
    return () => clearInterval(timer)
  }, [])
  return now
}

const useQuestStatusQuery = (
  gameQuest: GameQuest[],
  cache: QuestStateCache,
  now: number,
) => {
  const visibleQuests = useMemo(
    () => Object.fromEntries(gameQuest.map((quest) => [quest.api_no, quest])),
    [gameQuest],
  )
  const visibleQuestIds = useMemo(
    () => gameQuest.map((quest) => quest.api_no),
    [gameQuest],
  )

  /** 记录里「本周期内确认完成」的任务（跨周期后自动失效） */
  const aliveCompletedQuest = useMemo(
    () => getAliveCompletedQuest(cache, now),
    [cache, now],
  )

  /** 「某可见任务的前置必然已完成」的闭包（不做链尾推断） */
  const inferredCompletedQuest = useMemo(
    () => getVisiblePreQuestMap(visibleQuestIds),
    [visibleQuestIds],
  )

  /** 锁定：可见任务的全部后置，剔除「可见的」与「本周期内已完成」的 */
  const lockedQuest = useMemo(() => {
    const map = getPostQuestMap(visibleQuestIds)
    Object.keys(map).forEach((gameId) => {
      const id = Number(gameId)
      if (visibleQuests[id] || aliveCompletedQuest.has(id)) {
        delete map[id]
      }
    })
    return map
  }, [visibleQuestIds, visibleQuests, aliveCompletedQuest])

  const completedQuestNum = useMemo(
    () =>
      gameQuest.filter((quest) => quest.api_state === QUEST_API_STATE.COMPLETED)
        .length,
    [gameQuest],
  )

  const statusInput = useMemo(
    () => ({
      visibleQuests,
      inferredCompletedQuest,
      lockedQuest,
      aliveCompletedQuest,
    }),
    [visibleQuests, inferredCompletedQuest, lockedQuest, aliveCompletedQuest],
  )

  return {
    lockedQuestNum: Object.keys(lockedQuest).length,
    unlockedQuestNum: visibleQuestIds.length,
    completedQuestNum,
    alreadyCompletedQuestNum: aliveCompletedQuest.size,
    questStatusQuery: (gameId: number) =>
      resolveQuestStatus(gameId, statusInput),
  }
}

export const GameQuestProvider = ({ children }: { children?: ReactNode }) => {
  const gameQuest = useGameQuest()
  // poi 自己维护的活跃任务（带「进入该状态的时刻」），
  // 它每天 05:00 会按周期清理，顺便也就成了跨周期后重算状态的刷新信号。
  const activeQuests = useActiveQuest()
  const { store, updateStore } = useStore()
  const questStateCache = useMemo(
    () => store.questStateCache ?? {},
    [store.questStateCache],
  )
  const now = useQuestNow()

  /**
   * 记录「最后一次看到每个任务处于什么状态」。
   *
   * 数据来源：poi 的 activeQuests（状态进入时间更准） + 最近一次 questlist 响应。
   * 只有状态发生变化时才更新时间戳，所以时间戳天然带有「本周期从何时开始」的语义：
   * 周常上周完成 → 记录停在上周 → 本周一 05:00 之后自动失效。
   */
  useEffect(() => {
    const next: QuestStateCache = { ...questStateCache }
    const time = Date.now()
    // 先放 poi 的活跃任务（用 poi 记录的时间），再让最近一次游戏响应覆盖它
    const latest = new Map<number, { quest: GameQuest; time: number }>()
    for (const entry of Object.values(activeQuests)) {
      const quest = entry?.detail
      if (quest && typeof quest.api_no === 'number') {
        latest.set(quest.api_no, { quest, time: entry.time ?? time })
      }
    }
    for (const quest of gameQuest) {
      if (quest && typeof quest.api_no === 'number') {
        latest.set(quest.api_no, { quest, time })
      }
    }
    let changed = false
    for (const [gameId, { quest, time: stateTime }] of latest) {
      const old = next[gameId]
      if (old && old.apiState === quest.api_state) {
        continue
      }
      const period = getQuestPeriod(gameId)
      const labelType = Number(quest.api_label_type ?? 0)
      next[gameId] = {
        apiState: quest.api_state,
        period,
        resetMonth:
          period === 5 && labelType > 100 && labelType <= 112
            ? labelType - 100
            : undefined,
        time: stateTime,
      }
      changed = true
    }
    if (changed) {
      updateStore({ questStateCache: next })
    }
  }, [gameQuest, activeQuests, questStateCache, updateStore])

  const {
    lockedQuestNum,
    unlockedQuestNum,
    completedQuestNum,
    alreadyCompletedQuestNum,
    questStatusQuery,
  } = useQuestStatusQuery(gameQuest, questStateCache, now)

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
