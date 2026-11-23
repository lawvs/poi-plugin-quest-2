import questCategory from '../build/questCategory.json'

/**
 * 任务刷新周期（插件内部的枚举，来源是 build/questCategory.json 的 wiki 分类，
 * 不是游戏下发的 api_type）。
 *
 * 之所以不直接用 api_type：
 * 1. 需要判断的任务往往「不在当前任务列表里」，拿不到它的游戏字段；
 * 2. poi 本体（views/redux/info/quests/records.js 的 filterActiveQuestFactory）
 *    只对 api_type 1（日常）/ 2（周常）/ 3（月常）/ 5（年常 + api_label_type）做过期处理，
 *    其余（含实测为 4 的单次任务）视为不过期。
 */
export type QuestPeriod = 1 | 2 | 3 | 4 | 5 | 6

const dailyQuest = new Set<number>(questCategory.dailyQuest)
const weeklyQuest = new Set<number>(questCategory.weeklyQuest)
const monthlyQuest = new Set<number>(questCategory.monthlyQuest)
const quarterlyQuest = new Set<number>(questCategory.quarterlyQuest)
const yearlyQuest = new Set<number>(questCategory.yearlyQuest)

/** 1 日常 / 2 周常 / 3 月常 / 4 季常 / 5 年常 / 6 一次性 */
export const getQuestPeriod = (gameId: number): QuestPeriod => {
  if (dailyQuest.has(gameId)) {
    return 1
  }
  if (weeklyQuest.has(gameId)) {
    return 2
  }
  if (monthlyQuest.has(gameId)) {
    return 3
  }
  if (quarterlyQuest.has(gameId)) {
    return 4
  }
  if (yearlyQuest.has(gameId)) {
    return 5
  }
  return 6
}

/** 「最后一次看到某任务处于某状态」的记录条目 */
export type QuestStateRecord = {
  apiState: number
  period: QuestPeriod
  /** 年常的刷新月（= api_label_type - 100），仅 period === 5 时有意义 */
  resetMonth?: number
  /** 进入该状态的时间；只有状态发生变化时才会更新，因此天然带「周期起点」语义 */
  time: number
}

export type QuestStateCache = Record<number, QuestStateRecord>

const FOUR_HOURS = 4 * 60 * 60 * 1000
const DAY = 24 * 60 * 60 * 1000
const WEEK = 7 * DAY

// 任务在 JST 05:00 刷新，等价于 UTC+4 的 00:00；
// 先统一加 4 小时偏移再按 UTC 计算，与 poi 的 views/redux/info/quests/time.js 保持一致。
export const isDifferentDay = (time1: number, time2: number): boolean =>
  Math.floor((time1 + FOUR_HOURS) / DAY) !==
  Math.floor((time2 + FOUR_HOURS) / DAY)

/** 周界是周一 05:00 JST：1 月 1 日是周四，所以额外回退 4 天 */
export const isDifferentWeek = (time1: number, time2: number): boolean =>
  Math.floor((time1 + FOUR_HOURS - 4 * DAY) / WEEK) !==
  Math.floor((time2 + FOUR_HOURS - 4 * DAY) / WEEK)

export const isDifferentMonth = (time1: number, time2: number): boolean => {
  const date1 = new Date(time1 + FOUR_HOURS)
  const date2 = new Date(time2 + FOUR_HOURS)
  return (
    date1.getUTCMonth() !== date2.getUTCMonth() ||
    date1.getUTCFullYear() !== date2.getUTCFullYear()
  )
}

/**
 * 季度标识。
 *
 * 与 poi 的 getTanakalendarQuarterMonth（time.js）保持同一算法，
 * 以免插件和 poi 对季常的判断互相打架。
 */
const getQuarterIndex = (time: number): number => {
  const date = new Date(time + FOUR_HOURS)
  return Math.floor((date.getUTCFullYear() * 12 + (date.getUTCMonth() + 1)) / 3)
}

export const isDifferentQuarter = (time1: number, time2: number): boolean =>
  getQuarterIndex(time1) !== getQuarterIndex(time2)

/** 年常的「一年」从它自己的刷新月开始算 */
const getYearlyIndex = (time: number, resetMonth: number): number => {
  const date = new Date(time + FOUR_HOURS)
  const month = date.getUTCMonth() + 1
  return month >= resetMonth ? date.getUTCFullYear() : date.getUTCFullYear() - 1
}

export const isDifferentYear = (
  time1: number,
  time2: number,
  resetMonth: number,
): boolean =>
  getYearlyIndex(time1, resetMonth) !== getYearlyIndex(time2, resetMonth)

/**
 * 这条「已完成」记录在当前周期内是否仍然有效。
 *
 * 一次性任务（period === 6）永远有效；周期性任务在跨越自己的周期边界后失效。
 * 这是本修复的核心：周常 / 日常 / 月常刷新后，上一轮的完成记录不再算数。
 */
export const isSamePeriod = (
  record: QuestStateRecord,
  now: number,
): boolean => {
  const { time, period, resetMonth } = record
  if (!isDifferentDay(time, now)) {
    return true
  }
  switch (period) {
    case 1:
      // 日常：跨天即失效
      return false
    case 2:
      return !isDifferentWeek(time, now)
    case 3:
      return !isDifferentMonth(time, now)
    case 4:
      return !isDifferentQuarter(time, now)
    case 5:
      return !isDifferentYear(time, now, resetMonth ?? 1)
    default:
      // 一次性任务：完成就是完成
      return true
  }
}
