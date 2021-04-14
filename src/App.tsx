import styled from 'styled-components'
import React, { StrictMode, useCallback, useEffect, useRef } from 'react'
import { Text } from '@blueprintjs/core'
// See https://github.com/bvaughn/react-virtualized
import {
  AutoSizer,
  List,
  CellMeasurer,
  CellMeasurerCache,
} from 'react-virtualized'
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

const MINIMAL_CARD_HEIGHT = 70
// const LARGE_CARD_HEIGHT = 120
const cache = new CellMeasurerCache({
  defaultHeight: MINIMAL_CARD_HEIGHT,
  fixedWidth: true,
})

const QuestList: React.FC<{ quests: KcanotifyQuestExt[] }> = ({ quests }) => {
  const { largeCard } = useLargeCard()
  const listRef = useRef<List>(null)

  useEffect(() => {
    const changedIdx = quests.findIndex((i) => i.gameId === largeCard)
    cache.clearAll()
    listRef.current?.recomputeRowHeights(changedIdx)
  }, [quests, largeCard])

  const onResize = useCallback(() => {
    cache.clearAll()
    listRef.current?.recomputeRowHeights()
  }, [])

  const rowRenderer: ListRowRenderer = useCallback(
    ({ key, index, style, parent }) => {
      const { gameId, code, name, desc, memo, active } = quests[index]
      return (
        <CellMeasurer
          cache={cache}
          columnIndex={0}
          key={key}
          parent={parent}
          rowIndex={index}
        >
          <div style={style}>
            <QuestCard
              style={{ margin: '4px' }}
              gameId={gameId}
              code={code}
              name={name}
              desc={desc}
              tips={memo}
              status={active ? QUEST_STATUS.InProgress : QUEST_STATUS.Default}
            ></QuestCard>
          </div>
        </CellMeasurer>
      )
    },
    [quests]
  )
  if (!quests.length) {
    // Prevent Uncaught Error: Requested index 0 is outside of range 0..0
    // See https://github.com/bvaughn/react-virtualized/issues/1016
    return null
  }

  return (
    <QuestListWrapper>
      <AutoSizer onResize={onResize}>
        {({ height, width }) => (
          <List
            ref={listRef}
            height={height}
            width={width}
            rowCount={quests.length}
            rowHeight={cache.rowHeight}
            deferredMeasurementCache={cache}
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
