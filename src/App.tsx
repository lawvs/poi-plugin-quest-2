import { InputGroup } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import styled from 'styled-components'
import { ChangeEvent, StrictMode, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { QuestCard } from './components/QuestCard'
import QuestData from '../build/kcanotifyGamedata'
import { useThrottle } from './utils'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;

  & > * + * {
    margin-top: 8px;
  }
`

const ToolBarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 4px 8px;
`

const QuestCardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  padding: 4px 8px;

  & > * + * {
    margin-top: 8px;
  }
`

const DEFAULT_LANG = 'ja-JP'

const useSearch = () => {
  const [inputValue, setInputValue] = useState<string>()
  const throttledValue = useThrottle(inputValue, 200)
  const keywords = throttledValue?.split(' ').map((i) => i.toUpperCase())
  const filterString = useCallback(
    (text: string) => {
      if (!keywords) {
        return true
      }
      return keywords.some((keyword) => text.toUpperCase().includes(keyword))
    },
    [keywords]
  )

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value)
  }, [])

  const SearchInput = useCallback(
    () => (
      <InputGroup
        onChange={handleChange}
        placeholder="Search"
        leftIcon={IconNames.SEARCH}
        type="text"
      />
    ),
    [handleChange]
  )

  return {
    filterString,
    SearchInput,
  }
}

const useToolBar = () => {
  const { filterString, SearchInput } = useSearch()
  const ToolBar = useCallback(
    () => (
      <ToolBarWrapper>
        <SearchInput></SearchInput>
      </ToolBarWrapper>
    ),
    [SearchInput]
  )
  return {
    filterString,
    ToolBar,
  }
}

export const App: React.FC = () => {
  const { i18n } = useTranslation()
  const { filterString, ToolBar } = useToolBar()
  const LANGUAGE =
    i18n.language in QuestData
      ? (i18n.language as keyof typeof QuestData)
      : DEFAULT_LANG

  return (
    <StrictMode>
      <Container>
        <ToolBar></ToolBar>
        <QuestCardWrapper>
          {Object.entries(QuestData[LANGUAGE])
            .map(([gameId, val]) => ({ gameId, ...val }))
            .filter((i) => filterString(`${i.code} ${i.name} ${i.desc}`))
            .map(({ code, name, desc }) => (
              <QuestCard
                key={code}
                code={code}
                name={name}
                desc={desc}
              ></QuestCard>
            ))}
        </QuestCardWrapper>
      </Container>
    </StrictMode>
  )
}
