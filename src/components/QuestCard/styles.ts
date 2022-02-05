import { Card } from '@blueprintjs/core'
import styled from 'styled-components'

export const FlexCard = styled(Card)`
  display: flex;
  align-items: center;

  & > * + * {
    margin-left: 8px;
  }
`

export const CardMedia = styled.img`
  width: 64px;
  height: 64px;
`

export const CatIndicator = styled.span<{ color: string }>`
  height: 1em;
  width: 4px;
  background-color: ${({ color }) => color};
`

export const CardBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;

  & > * + * {
    margin-top: 8px;
  }
`

export const CardTail = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    height: 20px;
  }
`
