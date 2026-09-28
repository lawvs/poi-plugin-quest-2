import type { GameQuest } from '../poi/types'
import { QUEST_API_STATE } from '../poi/types'
import { getQuestPeriod } from '../questPeriod'
import type { QuestStateCache } from '../questPeriod'
import {
  QUEST_STATUS,
  canInferByVisibility,
  getPostQuestMap,
  getVisiblePreQuestMap,
} from '../questHelper'
import { getAliveCompletedQuest, resolveQuestStatus } from '../questStatus'

const NOW = Date.UTC(2026, 8, 28, 4, 0, 0)
const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

/** 只关心 api_no / api_state 的测试替身 */
const quest = (api_no: number, api_state: number): GameQuest =>
  ({ api_no, api_state }) as GameQuest

describe('questStatus', () => {
  describe('回归：周常前置被误标为「已完成」', () => {
    // 复现数据（真实账号快照里的可见任务）：
    //   Bw2(220) 进行中、B145(917) 可接
    // 修复前：由 B145 的前置链 B145 ← B62(809) ← Bw9(243) ← … 把周常 Bw9 判成「已完成」，
    // 而 Bw9 的后置 B44(276) 又被判「锁定」，两个结论自相矛盾。
    const visibleQuests: Record<number, GameQuest> = {
      220: quest(220, QUEST_API_STATE.IN_PROGRESS),
      917: quest(917, QUEST_API_STATE.DEFAULT),
    }
    const visibleQuestIds = Object.keys(visibleQuests).map(Number)
    const inferredCompletedQuest = getVisiblePreQuestMap(visibleQuestIds)

    const lockedQuest = getPostQuestMap(visibleQuestIds)
    Object.keys(lockedQuest).forEach((gameId) => {
      if (visibleQuests[Number(gameId)]) {
        delete lockedQuest[Number(gameId)]
      }
    })

    const context = (aliveCompletedQuest: Set<number> = new Set()) => ({
      visibleQuests,
      inferredCompletedQuest,
      lockedQuest,
      aliveCompletedQuest,
    })

    test('可见性闭包确实会把周常 Bw9 当成前置已完成（误判来源本身存在）', () => {
      expect(inferredCompletedQuest[243]).toBe(true) // Bw9
    })

    test('Bw9 是周常，没有本周完成记录时不得显示「已完成」', () => {
      expect(getQuestPeriod(243)).toBe(2)
      expect(resolveQuestStatus(243, context())).not.toBe(
        QUEST_STATUS.ALREADY_COMPLETED,
      )
    })

    test('B44 也不得因为这个推断被显示成「已完成」', () => {
      expect(getQuestPeriod(276)).toBe(6) // B44 是单次任务
      expect(canInferByVisibility(276)).toBe(false) // 但祖先含周常
      expect(resolveQuestStatus(276, context())).not.toBe(
        QUEST_STATUS.ALREADY_COMPLETED,
      )
    })

    test('Bw9 的上一周完成记录在跨周后失效', () => {
      const cache: QuestStateCache = {
        243: {
          apiState: QUEST_API_STATE.COMPLETED,
          period: 2,
          time: NOW - 8 * DAY,
        },
      }
      const alive = getAliveCompletedQuest(cache, NOW)
      expect(alive.has(243)).toBe(false)
      expect(resolveQuestStatus(243, context(alive))).not.toBe(
        QUEST_STATUS.ALREADY_COMPLETED,
      )
    })

    test('Bw9 的本周完成记录仍然有效', () => {
      const cache: QuestStateCache = {
        243: {
          apiState: QUEST_API_STATE.COMPLETED,
          period: 2,
          time: NOW - HOUR,
        },
      }
      const alive = getAliveCompletedQuest(cache, NOW)
      expect(alive.has(243)).toBe(true)
      expect(resolveQuestStatus(243, context(alive))).toBe(
        QUEST_STATUS.ALREADY_COMPLETED,
      )
    })
  })

  describe('基础判定优先级', () => {
    test('游戏可见时直接采信 api_state', () => {
      const visibleQuests = {
        214: quest(214, QUEST_API_STATE.IN_PROGRESS),
      }
      const base = {
        visibleQuests,
        inferredCompletedQuest: {},
        lockedQuest: {},
        aliveCompletedQuest: new Set<number>(),
      }
      expect(resolveQuestStatus(214, base)).toBe(QUEST_STATUS.IN_PROGRESS)
      // 即便记录里说它完成过，也以游戏当前状态为准
      expect(
        resolveQuestStatus(214, {
          ...base,
          aliveCompletedQuest: new Set([214]),
        }),
      ).toBe(QUEST_STATUS.IN_PROGRESS)
    })

    test('一次性任务的完成记录生效，且不受周期过滤影响', () => {
      const cache: QuestStateCache = {
        276: {
          apiState: QUEST_API_STATE.COMPLETED,
          period: 6,
          time: NOW - 400 * DAY,
        },
      }
      const alive = getAliveCompletedQuest(cache, NOW)
      expect(alive.has(276)).toBe(true)
      expect(
        resolveQuestStatus(276, {
          visibleQuests: {},
          inferredCompletedQuest: {},
          lockedQuest: {},
          aliveCompletedQuest: alive,
        }),
      ).toBe(QUEST_STATUS.ALREADY_COMPLETED)
    })

    test('锁定与未知', () => {
      const base = {
        visibleQuests: {},
        inferredCompletedQuest: {},
        lockedQuest: { 101: true } as Record<number, true>,
        aliveCompletedQuest: new Set<number>(),
      }
      expect(resolveQuestStatus(101, base)).toBe(QUEST_STATUS.LOCKED)
      expect(resolveQuestStatus(102, base)).toBe(QUEST_STATUS.UNKNOWN)
    })
  })

  describe('canInferByVisibility：只有纯一次性链才允许从可见性推断', () => {
    test('一次性任务及其祖先都是一次性时允许推断', () => {
      expect(canInferByVisibility(101)).toBe(true) // A1，无前置
      expect(canInferByVisibility(103)).toBe(true) // A3，前置为 A1/A2
    })

    test('祖先含周期性任务时禁止推断', () => {
      expect(canInferByVisibility(276)).toBe(false) // B44 ← Bw9（周常）
      expect(canInferByVisibility(222)).toBe(false) // B12 ← Bw3（周常）
      expect(canInferByVisibility(214)).toBe(false) // Bw1 本身是周常
    })
  })
})
