import styled from 'styled-components'
import React, { StrictMode } from 'react'
import { Text } from '@blueprintjs/core'
import { QuestCard } from './components/QuestCard'
import { Toolbar, useFilterQuest } from './Toolbar'
import { StoreProvider } from './store'
import { QUEST_STATUS } from './questHelper'
import { usePluginTranslation } from './poi'

const Container = styled.div`
  display: flex;
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
  const { t } = usePluginTranslation()
  const quests = useFilterQuest()

  return (
    <>
      <Toolbar></Toolbar>
      <CountText>{t('TotalQuests', { count: quests.length })}</CountText>
      <QuestCardWrapper>
        {quests.map(({ gameId, code, name, desc, active }) => (
          <QuestCard
            key={gameId}
            code={code}
            name={name}
            desc={desc}
            status={active ? QUEST_STATUS.InProgress : QUEST_STATUS.Default}
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
