import React, { StrictMode, useCallback } from 'react'
import { Button, AnchorButton, Text, Checkbox } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import styled from 'styled-components'
import { version as PACKAGE_VERSION, homepage } from '../package.json'
import { version as DATA_VERSION } from '../build/kcanotifyGamedata'
import { usePluginTranslation } from './poi/hooks'
import {
  useRemoveStorage,
  StoreProvider,
  useLanguage,
  usePreferKcwiki,
} from './store'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  user-select: text;

  & > * + * {
    margin-top: 8px;
  }
`

const useIsSimplifiedChinese = () => useLanguage() === 'zh-CN'

const SettingsMain = () => {
  const { t } = usePluginTranslation()
  const isSimplifiedChinese = useIsSimplifiedChinese()
  const removeStorage = useRemoveStorage()
  const [preferKcwiki, setPreferKcwiki] = usePreferKcwiki()
  const handleEnabledChange: React.FormEventHandler<HTMLInputElement> =
    useCallback(() => {
      setPreferKcwiki(!preferKcwiki)
    }, [preferKcwiki, setPreferKcwiki])

  return (
    <>
      <Checkbox
        checked={preferKcwiki}
        disabled={!isSimplifiedChinese}
        label={t('Use Kcwiki data')}
        onChange={handleEnabledChange}
      />

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
