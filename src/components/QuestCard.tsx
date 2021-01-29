import { Card, Elevation, H5 } from '@blueprintjs/core'
import styled from 'styled-components'
// @ts-ignore Fix me
import IconComposition from '../../assets/IconComposition.png'
// @ts-ignore Fix me
import IconExpedition from '../../assets/IconExpedition.png'
// @ts-ignore Fix me
import IconFactory from '../../assets/IconFactory.png'
// @ts-ignore Fix me
import IconModernization from '../../assets/IconModernization.png'
// @ts-ignore Fix me
import IconExercise from '../../assets/IconExercise.png'
// @ts-ignore Fix me
import IconSortie from '../../assets/IconSortie.png'
// @ts-ignore Fix me
import IconSupplyDocking from '../../assets/IconSupplyDocking.png'

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

/**
 * TODO use api.category
 * See https://github.com/poooi/poi/blob/da75b507e8f67615a39dc4fdb466e34ff5b5bdcf/views/components/main/parts/task-panel.es#L48-L71
 */
const getIcon = (code: string): string => {
  switch (true) {
    case code.startsWith('A'):
      return IconComposition
    case code.startsWith('B'):
      return IconSortie
    case code.startsWith('C'):
      return IconExercise
    case code.startsWith('D'):
      return IconExpedition
    case code.startsWith('E'):
      return IconSupplyDocking
    case code.startsWith('F'):
      return IconFactory
    case code.startsWith('G'):
      return IconModernization
    default:
      // transparent GIF pixel
      return 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='
  }
}

export const QuestCard: React.FC<{
  code: string
  name: string
  desc: string
}> = ({ code, name, desc }) => {
  const icon = getIcon(code)
  return (
    <CardWithMedia interactive={true} elevation={Elevation.TWO}>
      <CardMedia src={icon}></CardMedia>
      <H5>{[code, name].filter((i) => i != undefined).join(' ')}</H5>
      <p>{desc}</p>
    </CardWithMedia>
  )
}
