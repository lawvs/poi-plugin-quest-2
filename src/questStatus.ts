import type { GameQuest } from './poi/types'
import { QUEST_API_STATE } from './poi/types'
import type { QuestStateCache } from './questPeriod'
import { isSamePeriod } from './questPeriod'
import {
  QUEST_STATUS,
  canInferByVisibility,
  questApiStateToQuestStatus,
} from './questHelper'

/** 记录里「本周期内确认完成」的任务集合（跨周期后自动失效） */
export const getAliveCompletedQuest = (
  cache: QuestStateCache,
  now: number,
): Set<number> => {
  const aliveCompletedQuest = new Set<number>()
  for (const [gameId, record] of Object.entries(cache)) {
    if (
      record.apiState === QUEST_API_STATE.COMPLETED &&
      isSamePeriod(record, now)
    ) {
      aliveCompletedQuest.add(Number(gameId))
    }
  }
  return aliveCompletedQuest
}

export type QuestStatusInput = {
  /** 最近一次 questlist 响应里的任务，按 api_no 索引 */
  visibleQuests: Record<number, GameQuest>
  /** 「某可见任务的前置必然已完成」的闭包（getVisiblePreQuestMap） */
  inferredCompletedQuest: Record<number, true>
  /** 可见任务的后置闭包（getPostQuestMap，已剔除可见者与本周期已完成者） */
  lockedQuest: Record<number, true>
  /** 本周期内确认完成的任务集合 */
  aliveCompletedQuest: ReadonlySet<number>
}

/**
 * 任务状态判定。
 *
 * 优先级：
 *   1. 游戏当前可见 → 直接采信 api_state；
 *   2. 本周期内亲眼见它「已完成」→ ALREADY_COMPLETED；
 *   3. 纯一次性任务链 → 允许用「后继可见 ⇒ 前置已完成」安全推断；
 *   4. 可见任务的后置闭包 → LOCKED；
 *   5. 其余 → UNKNOWN。
 *
 * 与旧实现的区别：不再用「下游任务当前可见」反推周期性任务的完成状态。
 * 周常 / 日常 / 月常会重置，而下游任务不会随刷新消失，
 * 旧逻辑因此会把尚未解锁的周期性前置标成「已完成」，
 * 并与其后置的「锁定」结论自相矛盾。
 */
export const resolveQuestStatus = (
  gameId: number,
  {
    visibleQuests,
    inferredCompletedQuest,
    lockedQuest,
    aliveCompletedQuest,
  }: QuestStatusInput,
): QUEST_STATUS => {
  const visibleQuest = visibleQuests[gameId]
  if (visibleQuest) {
    return questApiStateToQuestStatus(visibleQuest.api_state)
  }
  if (aliveCompletedQuest.has(gameId)) {
    return QUEST_STATUS.ALREADY_COMPLETED
  }
  if (inferredCompletedQuest[gameId] && canInferByVisibility(gameId)) {
    return QUEST_STATUS.ALREADY_COMPLETED
  }
  if (gameId in lockedQuest) {
    return QUEST_STATUS.LOCKED
  }
  return QUEST_STATUS.UNKNOWN
}
