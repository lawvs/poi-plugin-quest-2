import React, { StrictMode, useCallback } from 'react'
import { Button, AnchorButton, Text } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import styled from 'styled-components'
import { version as PACKAGE_VERSION, homepage } from '../package.json'
import { version as DATA_VERSION } from '../build/kcanotifyGamedata'
import { usePluginTranslation } from './poi'
import { removeStorage } from './store'

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
  const handleClearCache = useCallback(() => removeStorage(), [])
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
        <Button
          icon={IconNames.TRASH}
          text={t('Restore defaults')}
          onClick={handleClearCache}
        ></Button>
      </Container>
    </StrictMode>
  )
}
