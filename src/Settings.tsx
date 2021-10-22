import React, { StrictMode } from 'react'
import { Button, AnchorButton, Text } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import styled from 'styled-components'
import { version as PACKAGE_VERSION, homepage } from '../package.json'
import { version as DATA_VERSION } from '../build/kcanotifyGamedata'
import { usePluginTranslation } from './poi'
import { useRemoveStorage, StoreProvider } from './store'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  user-select: text;

  & > * + * {
    margin-top: 8px;
  }
`

const SettingsMain = () => {
  const { t } = usePluginTranslation()
  const removeStorage = useRemoveStorage()
  return (
    <>
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
        onClick={removeStorage}
      ></Button>
    </>
  )
}

export const Settings = () => (
  <StrictMode>
    <StoreProvider>
      <Container>
        <SettingsMain />
      </Container>
    </StoreProvider>
  </StrictMode>
)
