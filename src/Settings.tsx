import React, { StrictMode } from 'react'
import { AnchorButton, Text } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import { version as PACKAGE_VERSION, homepage } from '../package.json'
import { version as DATA_VERSION } from '../build/kcanotifyGamedata'
import { usePluginTranslation } from './poi'
import styled from 'styled-components'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  user-select: text;

  & > * + * {
    margin-top: 8px;
  }
`

export const Settings = () => {
  const { t } = usePluginTranslation()
  return (
    <StrictMode>
      <Container>
        <Text>{t('Version', { version: PACKAGE_VERSION })}</Text>
        <Text>{t('Data Version', { version: DATA_VERSION })}</Text>
        <AnchorButton
          icon={IconNames.CODE}
          rightIcon={IconNames.SHARE}
          text={t('View source code on GitHub')}
          href={homepage}
          target="_blank"
        ></AnchorButton>
      </Container>
    </StrictMode>
  )
}
