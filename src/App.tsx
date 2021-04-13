import styled from 'styled-components'
import React, { StrictMode, useCallback, useEffect, useRef } from 'react'
import { Text } from '@blueprintjs/core'
// See https://github.com/bvaughn/react-virtualized
import { AutoSizer, List } from 'react-virtualized'
import type { ListRowRenderer } from 'react-virtualized'

import { QuestCard } from './components/QuestCard'
import { Toolbar, useFilterQuest } from './Toolbar'
import { StoreProvider, useLargeCard } from './store'
import { KcanotifyQuestExt, QUEST_STATUS } from './questHelper'
import { usePluginTranslation } from './poi'

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  max-height: 100%;
  overflow: hidden;
  user-select: text;

  & > * + * {
    margin-top: 8px;
  }
`

const CountText = styled(Text)`
  margin: 0 8px;
`

const QuestListWrapper = styled.div`
  flex: 1;
`

const QuestList: React.FC<{ quests: KcanotifyQuestExt[] }> = ({ quests }) => {
  const MINIMAL_CARD_HEIGHT = 65
  const LARGE_CARD_HEIGHT = 120
  const { largeCard } = useLargeCard()
  const listRef = useRef<List>(null)

  useEffect(() => {
    listRef.current?.recomputeRowHeights()
  }, [quests, largeCard])

  const rowHeight = useCallback(
    ({ index }: { index: number }) =>
      quests[index].gameId === largeCard
        ? LARGE_CARD_HEIGHT
        : MINIMAL_CARD_HEIGHT,
    [largeCard, quests]
  )
  const rowRenderer: ListRowRenderer = useCallback(
    ({ key, index, style }) => {
      const { gameId, code, name, desc, memo, active } = quests[index]
      return (
        <div style={style}>
          <QuestCard
            key={key}
            style={{ margin: '8px' }}
            gameId={gameId}
            code={code}
            name={name}
            desc={desc}
            tips={memo}
            status={active ? QUEST_STATUS.InProgress : QUEST_STATUS.Default}
          ></QuestCard>
        </div>
      )
    },
    [quests]
  )

  return (
    <QuestListWrapper>
      <AutoSizer>
        {({ height, width }) => (
          <List
            ref={listRef}
            height={height}
            width={width}
            rowCount={quests.length}
            rowHeight={rowHeight}
            rowRenderer={rowRenderer}
          ></List>
        )}
      </AutoSizer>
    </QuestListWrapper>
  )
}

const Main: React.FC = () => {
  const { t } = usePluginTranslation()
  const quests = useFilterQuest()

  return (
    <>
      <Toolbar></Toolbar>
      <CountText>{t('TotalQuests', { count: quests.length })}</CountText>
      <QuestList quests={quests}></QuestList>
    </>
  )
}

export const App = () => (
  <StrictMode>
    <StoreProvider>
      <Container>
        <Main></Main>
      </Container>
    </StoreProvider>
  </StrictMode>
)
