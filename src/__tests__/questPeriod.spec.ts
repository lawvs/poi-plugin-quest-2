import { getQuestPeriod, isDifferentWeek, isSamePeriod } from '../questPeriod'
import type { QuestPeriod, QuestStateRecord } from '../questPeriod'

// 固定基准：2026-09-28T04:00Z = JST 周一 13:00（周内白天），与运行环境时区无关
const NOW = Date.UTC(2026, 8, 28, 4, 0, 0)
const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

const record = (
  period: QuestPeriod,
  time: number,
  resetMonth?: number,
): QuestStateRecord => ({
  apiState: 3,
  period,
  time,
  resetMonth,
})

describe('questPeriod', () => {
  test('getQuestPeriod 按任务分类返回周期', () => {
    expect(getQuestPeriod(216)).toBe(1) // Bd2 日常
    expect(getQuestPeriod(214)).toBe(2) // Bw1 周常
    expect(getQuestPeriod(249)).toBe(3) // Bm1 月常
    expect(getQuestPeriod(284)).toBe(4) // Bq11 季常
    expect(getQuestPeriod(345)).toBe(5) // Cy1 年常
    expect(getQuestPeriod(101)).toBe(6) // A1 单次
    expect(getQuestPeriod(276)).toBe(6) // B44 单次
  })

  test('周常记录跨周失效', () => {
    expect(isSamePeriod(record(2, NOW - HOUR), NOW)).toBe(true)
    expect(isSamePeriod(record(2, NOW - 8 * DAY), NOW)).toBe(false)
  })

  test('日常记录跨天失效', () => {
    expect(isSamePeriod(record(1, NOW - HOUR), NOW)).toBe(true)
    expect(isSamePeriod(record(1, NOW - DAY - HOUR), NOW)).toBe(false)
  })

  test('月常记录跨月失效', () => {
    expect(isSamePeriod(record(3, Date.UTC(2026, 8, 2, 4)), NOW)).toBe(true)
    expect(isSamePeriod(record(3, Date.UTC(2026, 7, 30, 4)), NOW)).toBe(false)
  })

  test('一次性任务的记录永不过期', () => {
    expect(isSamePeriod(record(6, Date.UTC(2020, 0, 1)), NOW)).toBe(true)
  })

  test('年常按自己的刷新月判定', () => {
    // 刷新月为 6 的年常：7 月完成，到 9 月仍然有效
    expect(isSamePeriod(record(5, Date.UTC(2026, 6, 15, 4), 6), NOW)).toBe(true)
    // 去年 5 月完成的记录，今年已经过期
    expect(isSamePeriod(record(5, Date.UTC(2025, 4, 10, 4), 6), NOW)).toBe(
      false,
    )
  })

  test('周界落在周一 05:00 JST', () => {
    // JST 周一 04:59（周界之前）仍属于上一周
    const beforeReset = Date.UTC(2026, 8, 27, 19, 59, 0)
    expect(isDifferentWeek(beforeReset, NOW)).toBe(true)
    // JST 周一 05:01（周界之后）属于本周
    const afterReset = Date.UTC(2026, 8, 27, 20, 1, 0)
    expect(isDifferentWeek(afterReset, NOW)).toBe(false)
  })
})
