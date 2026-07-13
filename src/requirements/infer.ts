import type { UnionQuest } from '../questHelper'
import type { QuestRequirement, ShipTypeRequirement } from './types'

export type ResolvedQuestRequirement =
  | { kind: 'curated'; requirement: QuestRequirement }
  | { kind: 'inferred'; requirement: QuestRequirement }
  | { kind: 'not_applicable' }
  | { kind: 'unsupported' }

const SHIP_TYPE_TOKENS: Array<{
  label: string
  tokens: string[]
  shipTypes: number[]
}> = [
  { label: '輕巡洋艦', tokens: ['軽巡洋艦', '輕巡洋艦', '轻巡洋舰'], shipTypes: [3] },
  { label: '驅逐艦', tokens: ['駆逐艦', '驅逐艦', '驱逐舰'], shipTypes: [2] },
  { label: '水上機母艦', tokens: ['水上機母艦', '水上机母舰'], shipTypes: [16] },
  { label: '重巡洋艦 / 航空巡洋艦', tokens: ['重巡洋艦', '重巡洋舰', '航空巡洋艦', '航空巡洋舰'], shipTypes: [5, 6] },
  { label: '空母系', tokens: ['空母系'], shipTypes: [7, 11, 18] },
]

const QUOTED_NAME_PATTERN = /「([^」]+)」/g
const BARE_SHIP_NAME_PATTERN =
  /[A-Za-z][A-Za-z0-9 .-]*(?:Mod\.2|Mk\.II)?|[一-龥ぁ-んァ-ヶー]{2,8}(?:改二特|改二戊|改二丁|改二丙|改二乙|改二甲|改二|改)?/g

const INVENTORY_SIGNAL_PATTERNS = [
  /旗艦/u,
  /僚艦/u,
  /随伴艦/u,
  /隨伴艦/u,
  /編成/u,
  /含む/u,
  /包含/u,
  /含有/u,
  /配以/u,
  /配した/u,
]

const SPECIAL_VARIANT_SUFFIX_PATTERNS = [/^Mod\./u, /^[甲乙丙丁戊特]$/u]

const buildSourceText = (quest: UnionQuest) =>
  [quest.docQuest.desc, quest.docQuest.memo2].filter(Boolean).join(' ')

const unique = <T,>(entries: T[]) => Array.from(new Set(entries))

const normalizeName = (name: string) =>
  name.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '')

const expandVariantNames = (rawName: string): string[] => {
  const normalized = normalizeName(rawName)
  if (!normalized.includes('/')) {
    return [normalized]
  }

  const parts = normalized.split('/').map(normalizeName).filter(Boolean)
  if (parts.length <= 1) {
    return [normalized]
  }

  const [base, ...variants] = parts
  const names = [base]

  variants.forEach((variant) => {
    if (
      SPECIAL_VARIANT_SUFFIX_PATTERNS.some((pattern) => pattern.test(variant)) ||
      variant.length <= 4
    ) {
      names.push(
        /^[A-Za-z0-9]/u.test(variant) && /[A-Za-z0-9.]$/u.test(base)
          ? `${base} ${variant}`
          : `${base}${variant}`,
      )
      return
    }
    names.push(variant)
  })

  return unique(names)
}

const extractQuotedNames = (text: string): string[] =>
  unique(
    Array.from(text.matchAll(QUOTED_NAME_PATTERN)).flatMap((match) =>
      expandVariantNames(match[1]),
    ),
  )

const extractShipLikeNames = (text: string): string[] =>
  unique(
    Array.from(
      text
        .replace(/または|或者|及び|および/gu, '、')
        .replace(/或/gu, '、')
        .matchAll(BARE_SHIP_NAME_PATTERN),
    )
      .map((match) => normalizeName(match[0]))
      .filter(
        (name) =>
          ![
            '第一艦隊',
            '第二艦隊',
            '第三一驅逐隊',
            '第三一駆逐隊',
            '第一小隊',
            '二船艦隊',
            '二艘艦隊',
            '編成任務',
            '機動部隊',
            '夜間作戰',
            '夜間作戦',
          ].includes(name),
      ),
  )

const extractFlagshipNames = (text: string): string[] => {
  const flagshipIndex = text.indexOf('旗艦')
  if (flagshipIndex >= 0) {
    const quotedNames = Array.from(text.matchAll(QUOTED_NAME_PATTERN))
      .filter((match) => Math.abs((match.index ?? 0) - flagshipIndex) <= 24)
      .flatMap((match) => expandVariantNames(match[1]))
    if (quotedNames.length > 0) {
      return unique(quotedNames)
    }
  }

  const directMatch = text.match(
    /([A-Za-z][A-Za-z0-9 .-]*(?:Mod\.2|Mk\.II)?|[一-龥ぁ-んァ-ヶー]{2,8}(?:改二特|改二戊|改二丁|改二丙|改二乙|改二甲|改二|改))旗艦/u,
  )
  if (directMatch?.[1]) {
    return [normalizeName(directMatch[1])]
  }

  const descriptiveMatch =
    text.match(/以(.{1,24}?)為旗艦/u) ??
    text.match(/以(.{1,24}?)为旗舰/u) ??
    text.match(/旗艦に(.{1,24}?)を/u)
  if (!descriptiveMatch?.[1]) {
    return []
  }

  return extractQuotedNames(descriptiveMatch[1]).concat(
    extractShipLikeNames(descriptiveMatch[1]),
  )
}

const extractEscortAlternativeNames = (text: string): string[] => {
  const segment =
    text.match(/配以(.{1,40}?)作為僚艦/u)?.[1] ??
    text.match(/配以(.{1,40}?)作为僚舰/u)?.[1] ??
    text.match(/僚艦に(.{1,60}?)(?:を配|として|とし)/u)?.[1]

  if (!segment) {
    return []
  }

  const quotedNames = extractQuotedNames(segment)
  if (quotedNames.length > 0) {
    return quotedNames
  }

  return extractShipLikeNames(segment)
}

const extractIncludedShipNames = (
  text: string,
  consumedNames: string[],
): string[] => {
  if (!/(含む|包含|含有)/u.test(text)) {
    return []
  }

  return extractQuotedNames(text).filter((name) => !consumedNames.includes(name))
}

const extractShipTypeRequirements = (text: string): ShipTypeRequirement[] =>
  SHIP_TYPE_TOKENS.flatMap(({ label, shipTypes, tokens }) =>
    tokens.flatMap((token) =>
      Array.from(
        text.matchAll(
          new RegExp(`${token}\\s*(\\d+)\\s*[隻艘](以上)?`, 'gu'),
        ),
      ).map((match) => ({
        label: `${label} ${match[1]} 艘`,
        shipTypes,
        count: Number(match[1]),
      })),
    ),
  )

const buildInferenceNotes = (text: string): string[] => {
  const notes: string[] = []

  if (/第一艦隊/u.test(text)) {
    notes.push('未檢查第一艦隊限制。')
  }
  if (/夜間作戰|夜間作戦/u.test(text)) {
    notes.push('未檢查夜間作戰細節。')
  }
  if (/(二船艦隊|(?:2|二)\s*[隻艘]艦隊)/u.test(text)) {
    notes.push('未檢查二艘艦隊細節。')
  }
  if (/第一小隊/u.test(text)) {
    notes.push('未檢查隊別編成細節。')
  }

  return unique(notes)
}

const inferQuestRequirement = (quest: UnionQuest): QuestRequirement | null => {
  const text = buildSourceText(quest)
  const flagshipNames = extractFlagshipNames(text)
  const escortAlternativeNames = extractEscortAlternativeNames(text)
  const includedShipNames = extractIncludedShipNames(
    text,
    flagshipNames.concat(escortAlternativeNames),
  )
  const shipTypes = extractShipTypeRequirements(text)

  const requirement: QuestRequirement = {
    positions:
      flagshipNames.length > 0
        ? {
            flagship: [
              {
                label: `旗艦：${flagshipNames.join(' / ')}`,
                names: flagshipNames,
              },
            ],
          }
        : undefined,
    ships: [
      ...(escortAlternativeNames.length > 0
        ? [
            {
              label: escortAlternativeNames.join(' / '),
              names: escortAlternativeNames,
              count: 1,
            },
          ]
        : []),
      ...includedShipNames.map((name) => ({
        label: name,
        names: [name],
        count: 1,
      })),
    ],
    shipTypes,
    notes: buildInferenceNotes(text),
  }

  const hasAnyCondition =
    Boolean(requirement.positions?.flagship?.length) ||
    Boolean(requirement.ships?.length) ||
    Boolean(requirement.shipTypes?.length)

  if (!hasAnyCondition) {
    return null
  }

  return requirement
}

const hasInventorySignals = (quest: UnionQuest) => {
  const text = buildSourceText(quest)
  return (
    INVENTORY_SIGNAL_PATTERNS.some((pattern) => pattern.test(text)) ||
    extractQuotedNames(text).length > 0 ||
    extractShipTypeRequirements(text).length > 0
  )
}

export const resolveQuestRequirement = (
  quest: UnionQuest,
  curatedRequirement?: QuestRequirement,
): ResolvedQuestRequirement => {
  if (curatedRequirement) {
    return {
      kind: 'curated',
      requirement: curatedRequirement,
    }
  }

  const inferredRequirement = inferQuestRequirement(quest)
  if (inferredRequirement) {
    return {
      kind: 'inferred',
      requirement: inferredRequirement,
    }
  }

  if (!hasInventorySignals(quest)) {
    return { kind: 'not_applicable' }
  }

  return { kind: 'unsupported' }
}
