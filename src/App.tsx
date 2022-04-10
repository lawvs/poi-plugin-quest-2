import styled from 'styled-components'
import React, { StrictMode } from 'react'
import { Text } from '@blueprintjs/core'

import { Toolbar, useFilterQuest } from './Toolbar'
import { StoreProvider } from './store'
import { usePluginTranslation } from './poi/hooks'
import { QuestList } from './components/QuestList'

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  user-select: text;

  & > * + * {
    margin-top: 8px;
  }
`

const CountText = styled(Text)`
  margin: 0 8px;
`

const Main: React.FC = () => {
  const { t } = usePluginTranslation()
  const quests = useFilterQuest()

  return (
    <>
      <Toolbar></Toolbar>
      <CountText>{t('TotalQuests', { number: quests.length })}</CountText>
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
