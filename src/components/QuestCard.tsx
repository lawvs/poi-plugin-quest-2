import { Card, Elevation, H5, Text } from '@blueprintjs/core'
import styled from 'styled-components'
import { getQuestCategory, QUEST_CATEGORY } from '../questHelper'
import { IconComposition } from '../../build/assets'
import { IconExpedition } from '../../build/assets'
import { IconArsenal } from '../../build/assets'
import { IconModernization } from '../../build/assets'
import { IconExercise } from '../../build/assets'
import { IconSortie } from '../../build/assets'
import { IconSupplyDocking } from '../../build/assets'

const CardWithMedia = styled(Card)`
  display: grid;
  gap: 0 8px;
  grid-template-columns: auto 1fr;
  grid-template-areas:
    'media .'
    'media .';
  align-items: start;
`

const CardMedia = styled.img`
  width: 78px;
  height: 78px;
  grid-area: media;
`

const questIconMap = {
  [QUEST_CATEGORY.Composition]: IconComposition,
  [QUEST_CATEGORY.Sortie]: IconSortie,
  [QUEST_CATEGORY.Exercise]: IconExercise,
  [QUEST_CATEGORY.Expedition]: IconExpedition,
  [QUEST_CATEGORY.SupplyOrDocking]: IconSupplyDocking,
  [QUEST_CATEGORY.Arsenal]: IconArsenal,
  [QUEST_CATEGORY.Modernization]: IconModernization,
  // transparent GIF pixel
  [QUEST_CATEGORY.Unknown]:
    'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
} as const

const getIcon = (code: string): string => questIconMap[getQuestCategory(code)]

export const QuestCard: React.FC<{
  code: string
  name: string
  desc: string | JSX.Element
}> = ({ code, name, desc }) => {
  const icon = getIcon(code)
  return (
    <CardWithMedia elevation={Elevation.TWO}>
      <CardMedia src={icon}></CardMedia>
      <H5>{[code, name].filter((i) => i != undefined).join(' ')}</H5>
      <Text>{desc}</Text>
    </CardWithMedia>
  )
}
