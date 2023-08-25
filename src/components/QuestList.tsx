import React, { useCallback, useEffect, useRef } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
// https://github.com/bvaughn/react-window
import { VariableSizeList as List, ListChildComponentProps } from 'react-window'
import styled from 'styled-components'
import { useIsQuestPluginTab } from '../poi/hooks'
import type { UnionQuest } from '../questHelper'
import { QuestCard } from './QuestCard'

const QuestListWrapper = styled.div`
  flex: 1;
  overflow: hidden;
`

// CSS - Overflow: Scroll; - Always show vertical scroll bar?
// See https://stackoverflow.com/questions/7492062/css-overflow-scroll-always-show-vertical-scroll-bar
const ListWrapper = styled(List)`
  -webkit-overflow-scrolling: auto;

  ::-webkit-scrollbar {
    -webkit-appearance: none;
    width: 8px;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background-color: rgba(1, 1, 1, 0.3);
  }

  ::-webkit-scrollbar {
    border-radius: 4px;
    background-color: rgba(1, 1, 1, 0.1);
  }
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
    const { code, name, desc, rewards, memo2 } = quest.docQuest

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
            tip={rewards}
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
          <ListWrapper
            ref={listRef}
            height={height}
            width={width}
            itemCount={quests.length}
            estimatedItemSize={200}
            itemSize={getRowHeight}
          >
            {Row}
          </ListWrapper>
        )}
      </AutoSizer>
    </QuestListWrapper>
  )
}
