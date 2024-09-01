import {
  AnchorButton,
  Button,
  Checkbox,
  Intent,
  Text,
  TextArea,
} from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import type { ChangeEvent } from 'react'
import React, { StrictMode, useCallback, useState } from 'react'
import styled from 'styled-components'
import { version as DATA_VERSION } from '../build/kcanotifyGamedata'
import PKG from '../package.json'
import { IN_POI } from './poi/env'
import { usePluginTranslation, useStateExporter } from './poi/hooks'
import { tips } from './poi/utils'
import {
  StoreProvider,
  useLanguage,
  usePreferKcwiki,
  useRemoveStorage,
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

const DataExportArea = () => {
  const [text, setText] = useState<string>('')
  const { t } = usePluginTranslation()
  const { exportQuestDataToClipboard, importAsPoiState } = useStateExporter()

  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
  }, [])

  const handleImportData = useCallback(() => {
    importAsPoiState(text)
    setText('')
    tips.success(t('Import data success'))
  }, [importAsPoiState, t, text])

  const handleExportData = useCallback(async () => {
    try {
      await exportQuestDataToClipboard()
      tips.success(t('Copied data to clipboard'))
    } catch (error) {
      console.error(error)
      tips.error(t('Failed to export quest data! Please sync quest data first'))
    }
  }, [exportQuestDataToClipboard, t])

  return IN_POI ? (
    <Button
      icon={IconNames.EXPORT}
      text={t('Export quest data')}
      onClick={handleExportData}
    />
  ) : (
    <>
      <TextArea
        growVertically={false}
        intent={Intent.PRIMARY}
        onChange={handleChange}
        value={text}
      />
      <Button
        icon={IconNames.IMPORT}
        text={t('Import quest data')}
        onClick={handleImportData}
      />
    </>
  )
}

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

      <Text>{t('Version', { version: PKG.version })}</Text>
      <Text>{t('Data Version', { version: DATA_VERSION })}</Text>
      <AnchorButton
        icon={IconNames.CODE}
        rightIcon={IconNames.SHARE}
        text={t('View source code on GitHub')}
        href={PKG.homepage}
        target="_blank"
      />

      <Button
        icon={IconNames.TRASH}
        text={t('Restore defaults')}
        onClick={removeStorage}
      />

      <DataExportArea />
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
