import type { PathLike } from 'fs'
import { existsSync, mkdirSync } from 'fs'

export const prepareDir = (dir: PathLike) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

/**
 * @example
 * ```ts
 * parseQuestCode('A1') // { type: 'A', number: 1 }
 * parseQuestCode('Bq11') // { type: 'Bq', number: 11 }
 * parseQuestCode('Cy10') // { type: 'Cy', number: 10 }
 *
 * // Special case
 * // バレンタイン2024限定任務【特別演習】
 * parseQuestCode('2402C1') // { type: '2402C', number: 1 }
 * // 【节分任务：枡】节分演习！二〇二四
 * parseQuestCode('L2401C1') // { type: 'L2401C', number: 1 }
 * ```
 */
export const parseQuestCode = (str: string) => {
  if (str.length === 0) {
    throw new Error('Empty quest code')
  }

  const number = +(str.match(/\d+$/)?.[0] ?? '')
  if (!number || isNaN(number)) {
    throw new Error('Invalid quest code')
  }
  const type = str.slice(0, -String(number).length)
  if (type.length === 0) {
    throw new Error('Invalid quest code')
  }

  return { type, number }
}
