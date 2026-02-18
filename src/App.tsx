import { OverlaysProvider, Text } from '@blueprintjs/core'
import React, { StrictMode } from 'react'
import styled from 'styled-components'

import { Toolbar, useFilterQuest } from './Toolbar'
import { QuestList } from './components/QuestList'
import { AdvancedFilterProvider } from './filter-sphere'
import { usePluginTranslation } from './poi/hooks'
import { StoreProvider } from './store'

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
      <OverlaysProvider>
        <AdvancedFilterProvider>
          <Container>
            <Main></Main>
          </Container>
        </AdvancedFilterProvider>
      </OverlaysProvider>
    </StoreProvider>
  </StrictMode>
)
