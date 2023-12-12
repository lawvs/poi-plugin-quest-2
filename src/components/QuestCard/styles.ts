import { Button, Card } from '@blueprintjs/core'
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
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: center;

  img {
    height: 20px;
  }
`

export const MoreButton = styled(Button)`
  opacity: 0;

  ${FlexCard}:hover & {
    opacity: 1;
  }
`

export const TailIconWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`

export const CardActionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: baseline;
`

export const TagsWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  align-items: center;
`

export const SpanText = styled.span`
  white-space: nowrap;
`
