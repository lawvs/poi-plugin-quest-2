import React, { useCallback, useEffect, useRef } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
// https://github.com/bvaughn/react-window
import { ListChildComponentProps, VariableSizeList as List } from 'react-window'
import styled from 'styled-components'
import { useIsQuestPluginTab } from '../poi/hooks'
import type { UnionQuest } from '../questHelper'
import { QuestCard } from './QuestCard'

const QuestListWrapper = styled.div`
  flex: 1;
`

export const QuestList = ({ quests }: { quests: UnionQuest[] }) => {
  const activeTab = useIsQuestPluginTab()
  const listRef = useRef<List>(null)
  const rowHeights = useRef<Record<number, number>>({})

  useEffect(() => {
    listRef.current?.resetAfterIndex(0)
  }, [quests])

  useEffect(() => {
    if (activeTab) {
      listRef.current?.resetAfterIndex(0)
    }
  }, [activeTab])

  const setRowHeight = useCallback((index, size) => {
    if (rowHeights.current[index] === size) {
      return
    }
    rowHeights.current = { ...rowHeights.current, [index]: size }
    listRef.current?.resetAfterIndex(index)
  }, [])

  const getRowHeight = useCallback((index) => {
    return rowHeights.current[index] + 8 || 200
  }, [])

  const Row = ({ index, style }: ListChildComponentProps) => {
    const rowRef = useRef<HTMLDivElement>(null)

    const quest = quests[index]
    const { gameId } = quest
    const { code, name, desc, memo, memo2 } = quest.docQuest

    useEffect(() => {
      if (rowRef.current) {
        setRowHeight(index, rowRef.current.clientHeight)
      }
    }, [index])

    return (
      <div style={style}>
        <div ref={rowRef}>
          <QuestCard
            style={{ margin: '4px' }}
            gameId={gameId}
            code={code}
            name={name}
            desc={desc}
            tip={memo}
            tip2={memo2}
          />
        </div>
      </div>
    )
  }

  return (
    <QuestListWrapper>
      <AutoSizer>
        {({ height, width }) => (
          <List
            ref={listRef}
            height={height}
            width={width}
            itemCount={quests.length}
            estimatedItemSize={200}
            itemSize={getRowHeight}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </QuestListWrapper>
  )
}
