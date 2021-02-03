import styled from 'styled-components'
import { StrictMode } from 'react'
import { useTranslation } from 'react-i18next'
import { QuestCard } from './components/QuestCard'
import { QuestData } from '../build/kcanotifyGamedata'
import { Toolbar, useToolbarFilter } from './Toolbar'
import { StoreProvider } from './store'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  user-select: text;

  & > * + * {
    margin-top: 8px;
  }
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

const Main: React.FC = () => {
  const { i18n } = useTranslation()
  const toolbarFilter = useToolbarFilter()

  const LANGUAGE =
    i18n.language in QuestData
      ? (i18n.language as keyof typeof QuestData)
      : DEFAULT_LANG

  return (
    <>
      <Toolbar></Toolbar>
      <QuestCardWrapper>
        {Object.entries(QuestData[LANGUAGE])
          .map(([gameId, val]) => ({ gameId, ...val }))
          .filter(toolbarFilter)
          .map(({ code, name, desc }) => (
            <QuestCard
              key={code}
              code={code}
              name={name}
              desc={desc}
            ></QuestCard>
          ))}
      </QuestCardWrapper>
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
