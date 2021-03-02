import styled from 'styled-components'
import React, { StrictMode } from 'react'
import { Text } from '@blueprintjs/core'
import { useTranslation } from 'react-i18next'
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

const CountText = styled(Text)`
  margin: 0 8px;
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
  const { t } = useTranslation()
  const quests = useFilterQuest()

  return (
    <>
      <Toolbar></Toolbar>
      <CountText>{t('TotalQuests', { count: quests.length })}</CountText>
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