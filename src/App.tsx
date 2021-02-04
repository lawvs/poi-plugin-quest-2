import styled from 'styled-components'
import { StrictMode } from 'react'
import { QuestCard } from './components/QuestCard'
import { Toolbar, useFilterQuest } from './Toolbar'
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

const Main: React.FC = () => {
  const quests = useFilterQuest()

  return (
    <>
      <Toolbar></Toolbar>
      <QuestCardWrapper>
        {quests.map(({ code, name, desc }) => (
          <QuestCard key={code} code={code} name={name} desc={desc}></QuestCard>
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
