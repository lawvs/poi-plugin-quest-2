import { Tag } from '@blueprintjs/core'
import React from 'react'
import styled from 'styled-components'
import { usePluginTranslation } from './poi/hooks'
import type { GameQuest } from './poi/types'
import type { UnionQuest } from './questHelper'
import {
  hasNewQuest,
  isArsenalQuest,
  isCompositionQuest,
  isDailyQuest,
  isExerciseQuest,
  isExpeditionQuest,
  isInProgressQuest,
  isModernizationQuest,
  isMonthlyQuest,
  isNewQuest,
  isQuarterlyQuest,
  isSingleQuest,
  isSortieQuest,
  isSupplyOrDockingQuest,
  isUnknownCategoryQuest,
  isWeeklyQuest,
  isYearlyQuest,
  newQuestNumber,
} from './questHelper'
import { ALL_CATEGORY_TAG, ALL_TYPE_TAG, PROGRESS_TAG } from './store'
import { useFilterProgressTag, useFilterTags } from './store/filterTags'
import { useGlobalGameQuest, useGlobalQuestStatusNum } from './store/gameQuest'

const withDocQuest =
  <T,>(filterFn: (q: UnionQuest['docQuest']) => T) =>
  (unionQuest: UnionQuest) =>
    filterFn(unionQuest.docQuest)

const withGameQuestOr =
  <T,>(filterFn: (q: GameQuest) => T, fallback: T) =>
  ({ gameQuest }: UnionQuest) => {
    if (!gameQuest) {
      return fallback
    }
    return filterFn(gameQuest)
  }

export const CATEGORY_TAGS = [
  ALL_CATEGORY_TAG,
  { name: 'Composition', filter: withDocQuest(isCompositionQuest) },
  { name: 'Sortie', filter: withDocQuest(isSortieQuest) },
  { name: 'Exercise', filter: withDocQuest(isExerciseQuest) },
  { name: 'Expedition', filter: withDocQuest(isExpeditionQuest) },
  { name: 'Supply / Docking', filter: withDocQuest(isSupplyOrDockingQuest) },
  { name: 'Arsenal', filter: withDocQuest(isArsenalQuest) },
  { name: 'Modernization', filter: withDocQuest(isModernizationQuest) },
  { name: 'Others', filter: withDocQuest(isUnknownCategoryQuest) },
] as const

export const TYPE_TAGS = [
  ALL_TYPE_TAG,
  {
    name: 'In Progress',
    filter: withGameQuestOr(isInProgressQuest, false),
  },
  { name: 'New', filter: isNewQuest },
  { name: 'Daily', filter: isDailyQuest },
  { name: 'Weekly', filter: isWeeklyQuest },
  { name: 'Monthly', filter: isMonthlyQuest },
  { name: 'One-time', filter: isSingleQuest },
  { name: 'Quarterly', filter: isQuarterlyQuest },
  { name: 'Yearly', filter: isYearlyQuest },
] as const

const TagsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-left: -4px;
  margin-right: -4px;

  & > * {
    margin: 4px;
  }
`

export const ProgressTags = () => {
  const { t } = usePluginTranslation()
  const { progressTag, toggleTag } = useFilterProgressTag()
  const {
    lockedQuestNum,
    unlockedQuestNum,
    completedQuestNum,
    alreadyCompletedQuestNum,
  } = useGlobalQuestStatusNum()
  const completedQuestSuffix =
    completedQuestNum > 0
      ? `${alreadyCompletedQuestNum} + ${completedQuestNum}`
      : alreadyCompletedQuestNum
  return (
    <>
      <Tag
        onClick={() => {
          toggleTag(PROGRESS_TAG.Locked)
        }}
        intent={progressTag === PROGRESS_TAG.Locked ? 'success' : 'none'}
        interactive={true}
      >
        {t('Locked', { number: lockedQuestNum })}
      </Tag>
      <Tag
        onClick={() => {
          toggleTag(PROGRESS_TAG.Unlocked)
        }}
        intent={progressTag === PROGRESS_TAG.Unlocked ? 'success' : 'none'}
        interactive={true}
      >
        {t('Unlocked', { number: unlockedQuestNum })}
      </Tag>
      <Tag
        onClick={() => {
          toggleTag(PROGRESS_TAG.AlreadyCompleted)
        }}
        intent={
          progressTag === PROGRESS_TAG.AlreadyCompleted ? 'success' : 'none'
        }
        interactive={true}
      >
        {t('Already Completed', {
          number: completedQuestSuffix,
        })}
      </Tag>
    </>
  )
}

export const CategoryTags = () => {
  const { t } = usePluginTranslation()
  const { categoryTags, setCategoryTags } = useFilterTags()

  return (
    <TagsWrapper>
      {CATEGORY_TAGS.map(({ name }) => (
        <Tag
          onClick={() => setCategoryTags(name)}
          intent={
            categoryTags[name]
              ? name === ALL_CATEGORY_TAG.name
                ? 'success'
                : 'primary'
              : 'none'
          }
          interactive={true}
          key={name}
        >
          {t(name)}
        </Tag>
      ))}

      <ProgressTags />
    </TagsWrapper>
  )
}

export const TypeTags = () => {
  const { t } = usePluginTranslation()
  const gameQuests = useGlobalGameQuest()
  const { progressTag } = useFilterProgressTag()

  const inProgressQuest = gameQuests.filter((gameQuest) =>
    isInProgressQuest(gameQuest),
  )
  const { typeTags, setTypeTags } = useFilterTags()

  return (
    <TagsWrapper>
      <Tag
        intent={typeTags['All'] ? 'success' : 'none'}
        interactive={true}
        onClick={() => setTypeTags('All')}
      >
        {t('All')}
      </Tag>

      <Tag
        intent={
          typeTags['In Progress']
            ? progressTag === PROGRESS_TAG.AlreadyCompleted ||
              progressTag === PROGRESS_TAG.Locked
              ? 'warning'
              : 'primary'
            : 'none'
        }
        interactive={true}
        onClick={() => setTypeTags('In Progress')}
      >
        {t('In Progress', { number: inProgressQuest.length })}
      </Tag>

      {hasNewQuest && (
        <Tag
          intent={typeTags['New'] ? 'primary' : 'none'}
          interactive={true}
          onClick={() => setTypeTags('New')}
        >
          {t('New', { number: newQuestNumber })}
        </Tag>
      )}

      {TYPE_TAGS.slice(3).map((tag) => (
        <Tag
          onClick={() => setTypeTags(tag.name)}
          intent={typeTags[tag.name] ? 'primary' : 'none'}
          interactive={true}
          key={tag.name}
        >
          {t(tag.name)}
        </Tag>
      ))}
    </TagsWrapper>
  )
}
