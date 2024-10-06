import {
  Button,
  Card,
  Elevation,
  H5,
  Menu,
  MenuItem,
  Popover,
} from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import React, { ComponentPropsWithoutRef, forwardRef } from 'react'
// https://github.com/bvaughn/react-highlight-words
import Highlighter from 'react-highlight-words'
import { usePluginTranslation } from '../../poi/hooks'
import {
  QUEST_STATUS,
  getQuestPrePost,
  guessQuestCategory,
} from '../../questHelper'
import { useQuestStatus } from '../../store/quest'
import { useStableSearchWords } from '../../store/search'
import { QuestTag } from '../QuestTag'
import {
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
import { questIconMap, questStatusMap } from './utils'

export type QuestCardProps = {
  gameId: number
  code: string
  name: string
  desc: string
  tip?: string
  tip2?: string
  status?: QUEST_STATUS
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
            {prePostQuests.pre.map((i) => (
              <QuestTag key={i} code={i}></QuestTag>
            ))}
          </>
        )}
      </TagsWrapper>

      <TagsWrapper>
        {!!prePostQuests.post.length && (
          <>
            <SpanText>{t('Unlocks')}</SpanText>
            {prePostQuests.post.map((i) => (
              <QuestTag key={i} code={i}></QuestTag>
            ))}
          </>
        )}
      </TagsWrapper>
    </CardActionWrapper>
  )
}

export const QuestCard = forwardRef<
  Card,
  QuestCardProps & ComponentPropsWithoutRef<typeof FlexCard>
>(({ gameId, code, name, desc, tip, tip2, ...props }, ref) => {
  const status = useQuestStatus(gameId)
  const headIcon = questIconMap[guessQuestCategory(code).type]
  const TailIcon = questStatusMap[status]
  const searchWords = useStableSearchWords()

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
            searchWords={searchWords}
            autoEscape={true}
            textToHighlight={[code, name]
              .filter((i) => i != undefined)
              .join(' - ')}
          />
        </H5>
        <Highlighter
          searchWords={searchWords}
          autoEscape={true}
          textToHighlight={desc}
        />
        {tip2 && (
          <b>
            <Highlighter
              searchWords={searchWords}
              autoEscape={true}
              textToHighlight={tip2}
            />
          </b>
        )}
        {tip && (
          <i>
            <Highlighter
              searchWords={searchWords}
              autoEscape={true}
              textToHighlight={tip}
            />
          </i>
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
  Button,
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
