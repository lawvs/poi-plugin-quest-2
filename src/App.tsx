import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { QuestCard } from './components/QuestCard'
import QuestData from '../build/kcanotifyGamedata'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 4px 8px;

  & > * + * {
    margin-top: 8px;
  }
`

const DEFAULT_LANG = 'ja-JP'

export const App: React.FC = () => {
  const { i18n } = useTranslation()
  const LANGUAGE =
    i18n.language in QuestData
      ? (i18n.language as keyof typeof QuestData)
      : DEFAULT_LANG

  return (
    <Container>
      {Object.entries(QuestData[LANGUAGE])
        .map(([gameId, val]) => ({ gameId, ...val }))
        .map(({ code, name, desc }) => (
          <QuestCard code={code} name={name} desc={desc}></QuestCard>
        ))}
    </Container>
  )
}
