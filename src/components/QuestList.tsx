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
import { QUEST_STATUS } from '../questHelper'
import type { UnionQuest } from '../questHelper'
import { QuestCard } from './QuestCard'
import { useIsQuestPluginTab } from '../poi/hooks'
import { QUEST_API_STATE } from '../poi/types'

const QuestListWrapper = styled.div`
  flex: 1;
`

const MINIMAL_CARD_HEIGHT = 70
// const LARGE_CARD_HEIGHT = 120
const cache = new CellMeasurerCache({
  defaultHeight: MINIMAL_CARD_HEIGHT,
  fixedWidth: true,
})

const questApiStateToQuestStatus = (
  state: QUEST_API_STATE | undefined
): QUEST_STATUS => {
  switch (state) {
    case QUEST_API_STATE.DEFAULT:
      return QUEST_STATUS.DEFAULT
    case QUEST_API_STATE.COMPLETED:
      return QUEST_STATUS.COMPLETED
    case QUEST_API_STATE.IN_PROGRESS:
      return QUEST_STATUS.IN_PROGRESS
    default:
      return QUEST_STATUS.DEFAULT
  }
}

const useQuestsRowRenderer = (quests: UnionQuest[]) => {
  const rowRenderer = useCallback(
    ({ key, index, style, parent }: ListRowProps) => {
      const quest = quests[index]
      const { gameId } = quest
      const { code, name, desc, memo, memo2, pre } = quest.docQuest
      const questStatus = questApiStateToQuestStatus(quest.gameQuest?.api_state)

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
              tip={memo}
              tip2={memo2}
              preQuest={pre}
              status={questStatus}
            ></QuestCard>
          </div>
        </CellMeasurer>
      )
    },
    [quests]
  )
  return rowRenderer
}

export const QuestList: React.FC<{ quests: UnionQuest[] }> = ({ quests }) => {
  const activeTab = useIsQuestPluginTab()
  const listRef = useRef<List>(null)
  const rowRenderer: ListRowRenderer = useQuestsRowRenderer(quests)

  useEffect(() => {
    cache.clearAll()
    listRef.current?.recomputeRowHeights()
  }, [quests])

  useEffect(() => {
    if (activeTab) {
      cache.clearAll()
      listRef.current?.recomputeRowHeights()
    }
  }, [activeTab])

  const onResize = useCallback(() => {
    cache.clearAll()
    listRef.current?.recomputeRowHeights()
  }, [])

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
