import React, { useRef, useEffect, useCallback } from 'react'
// See https://github.com/bvaughn/react-virtualized
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  List,
  ListRowRenderer,
} from 'react-virtualized'
import type { ListRowProps } from 'react-virtualized'
import styled from 'styled-components'
import { KcanotifyQuestExt, QUEST_STATUS } from '../questHelper'
import { useLargeCard } from '../store'
import { QuestCard } from './QuestCard'

const QuestListWrapper = styled.div`
  flex: 1;
`

const MINIMAL_CARD_HEIGHT = 70
// const LARGE_CARD_HEIGHT = 120
const cache = new CellMeasurerCache({
  defaultHeight: MINIMAL_CARD_HEIGHT,
  fixedWidth: true,
})

const useQuestsRowRenderer = (quests: KcanotifyQuestExt[]) => {
  const rowRenderer = useCallback(
    ({ key, index, style, parent }: ListRowProps) => {
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
  return rowRenderer
}

export const QuestList: React.FC<{ quests: KcanotifyQuestExt[] }> = ({
  quests,
}) => {
  const { largeCard } = useLargeCard()
  const listRef = useRef<List>(null)

  useEffect(() => {
    const largeCardIdx = quests.findIndex((i) => i.gameId === largeCard)
    cache.clearAll()
    listRef.current?.recomputeRowHeights(largeCardIdx)
  }, [quests, largeCard])

  const onResize = useCallback(() => {
    cache.clearAll()
    listRef.current?.recomputeRowHeights()
  }, [])

  const rowRenderer: ListRowRenderer = useQuestsRowRenderer(quests)

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
