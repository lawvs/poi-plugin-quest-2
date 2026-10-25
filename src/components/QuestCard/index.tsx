import { Elevation, H5, Menu, MenuItem, Popover, Tag } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import React, { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react'
// https://github.com/bvaughn/react-highlight-words
import Highlighter from 'react-highlight-words'
import type { QuestAnalysis } from '../../analysis'
import { usePluginTranslation } from '../../poi/hooks'
import {
  QUEST_STATUS,
  getQuestPrePost,
  guessQuestCategory,
} from '../../questHelper'
import { useQuestStatus } from '../../store/quest'
import { useHighlightWords } from '../../store/search'
import { QuestTag } from '../QuestTag'
import {
  AnalysisBlock,
  AnalysisList,
  AnalysisText,
  CardActionWrapper,
  CardBody,
  CardMedia,
  CardTail,
  FlexCard,
  MoreButton,
  SpanText,
  TagsWrapper,
  TailIconWrapper,
} from './styles'
import {
  getQuestAnalysisIntent,
  getQuestAnalysisSummary,
  questIconMap,
  questStatusMap,
} from './utils'

export type QuestCardProps = {
  gameId: number
  code: string
  name: string
  desc: string
  tip?: string
  tip2?: string
  status?: QUEST_STATUS
  analysis?: QuestAnalysis
}

const CardAction = ({ gameId }: { gameId: number }) => {
  const { t } = usePluginTranslation()

  const prePostQuests = getQuestPrePost(gameId)

  return (
    <CardActionWrapper>
      <TagsWrapper>
        {!!prePostQuests.pre.length && (
          <>
            <SpanText>{t('Requires')}</SpanText>
            {prePostQuests.pre.map((i: string) => (
              <QuestTag key={i} code={i}></QuestTag>
            ))}
          </>
        )}
      </TagsWrapper>

      <TagsWrapper>
        {!!prePostQuests.post.length && (
          <>
            <SpanText>{t('Unlocks')}</SpanText>
            {prePostQuests.post.map((i: string) => (
              <QuestTag key={i} code={i}></QuestTag>
            ))}
          </>
        )}
      </TagsWrapper>
    </CardActionWrapper>
  )
}

export const QuestCard = forwardRef<
  ElementRef<typeof FlexCard>,
  QuestCardProps & ComponentPropsWithoutRef<typeof FlexCard>
>(({ gameId, code, name, desc, tip, tip2, analysis, ...props }, ref) => {
  const status = useQuestStatus(gameId)
  const headIcon = questIconMap[guessQuestCategory(code).type]
  const TailIcon = questStatusMap[status]
  const highlightWords = useHighlightWords()
  const { t } = usePluginTranslation()

  return (
    <FlexCard
      ref={ref}
      elevation={Elevation.ZERO}
      interactive={false}
      {...props}
    >
      <CardMedia src={headIcon}></CardMedia>
      <CardBody>
        <H5>
          <Highlighter
            searchWords={highlightWords}
            autoEscape={true}
            textToHighlight={[code, name]
              .filter((i) => i != undefined)
              .join(' - ')}
          />
        </H5>
        <Highlighter
          searchWords={highlightWords}
          autoEscape={true}
          textToHighlight={desc}
        />
        {tip2 && (
          <b>
            <Highlighter
              searchWords={highlightWords}
              autoEscape={true}
              textToHighlight={tip2}
            />
          </b>
        )}
        {tip && (
          <i>
            <Highlighter
              searchWords={highlightWords}
              autoEscape={true}
              textToHighlight={tip}
            />
          </i>
        )}
        {analysis && (
          <AnalysisBlock>
            <AnalysisList>
              <Tag intent={getQuestAnalysisIntent(analysis.status)} minimal={true}>
                {getQuestAnalysisSummary(analysis, t)}
              </Tag>
              {analysis.origin === 'inferred' ? (
                <Tag intent="warning" minimal={true}>
                  {t('Requirement Inferred')}
                </Tag>
              ) : null}
            </AnalysisList>

            {analysis.status === 'unsupported' ? (
              <AnalysisText>{t('Requirement Unsupported Detail')}</AnalysisText>
            ) : analysis.status === 'not_applicable' ? (
              <AnalysisText>{t('Not Applicable Detail')}</AnalysisText>
            ) : analysis.status === 'missing_inventory' ? (
              <AnalysisText>
                {analysis.missingInventoryParts.includes('ships') &&
                analysis.missingInventoryParts.includes('equipments')
                  ? t('Inventory Missing Detail Both')
                  : analysis.missingInventoryParts.includes('ships')
                    ? t('Inventory Missing Detail Ships')
                    : t('Inventory Missing Detail Equipments')}
              </AnalysisText>
            ) : (
              <>
                {analysis.missingShips.length > 0 && (
                  <AnalysisText>
                    <b>{t('Missing Ships')}</b>: {analysis.missingShips.join('、')}
                  </AnalysisText>
                )}
                {analysis.missingEquipments.length > 0 && (
                  <AnalysisText>
                    <b>{t('Missing Equipments')}</b>: {analysis.missingEquipments.join('、')}
                  </AnalysisText>
                )}
                {analysis.notes.map((note) => (
                  <AnalysisText key={note}>{note}</AnalysisText>
                ))}
              </>
            )}
          </AnalysisBlock>
        )}

        <CardAction gameId={gameId}></CardAction>
      </CardBody>

      <CardTail>
        <MoreOptions code={code} gameId={gameId} name={name} />
        <TailIconWrapper>
          <TailIcon />
        </TailIconWrapper>
      </CardTail>
    </FlexCard>
  )
})

export const MoreOptions = forwardRef<
  ElementRef<typeof MoreButton>,
  Pick<QuestCardProps, 'code' | 'gameId' | 'name'>
>(({ code }, ref) => {
  const { t } = usePluginTranslation()

  const menu = (
    <Menu>
      <MenuItem
        icon={IconNames.Anchor}
        text={t('Search in Kcwiki')}
        tagName="a"
        href={`https://zh.kcwiki.cn/wiki/任务#:~:text=${code}`}
        target="_blank"
      />
      <MenuItem
        icon={IconNames.Graph}
        text={t('Search in wikiwiki')}
        tagName="a"
        href={`https://wikiwiki.jp/kancolle/任務#:~:text=${code}`}
        target="_blank"
      />
      <MenuItem
        icon={IconNames.Map}
        text={t('Search in KanColle Wiki')}
        tagName="a"
        href={`https://kancolle.fandom.com/wiki/Quests#:~:text=${code}`}
        target="_blank"
      />
      <MenuItem
        icon={IconNames.Control}
        text={t('Search in Richelieu Manager')}
        tagName="a"
        href={`https://richelieu-manager.net/quest/${code}`}
        target="_blank"
      />
    </Menu>
  )
  return (
    <Popover content={menu} fill={true} placement="bottom">
      <MoreButton ref={ref} icon={IconNames.More} />
    </Popover>
  )
})
