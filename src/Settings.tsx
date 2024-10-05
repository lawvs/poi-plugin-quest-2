import {
  AnchorButton,
  Button,
  HTMLSelect,
  Intent,
  Text,
  TextArea,
} from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import type { ChangeEvent } from 'react'
import React, { StrictMode, useCallback, useState } from 'react'
import styled from 'styled-components'
import { QUEST_DATA } from '../build'
import { version as DATA_VERSION } from '../build/kcanotifyGamedata'
import PKG from '../package.json'
import { IN_POI } from './poi/env'
import { usePluginTranslation, useStateExporter } from './poi/hooks'
import { tips } from './poi/utils'
import { StoreProvider, useDataSource, useRemoveStorage } from './store'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  user-select: text;
  gap: 8px;
  padding: 8px;
`

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

const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
`

export const SettingsMain = () => {
  const { t } = usePluginTranslation()
  const removeStorage = useRemoveStorage()
  const { dataSource, setDataSource } = useDataSource()

  const handleChangeQuestSource = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value
      if (!value) {
        setDataSource(null)
        return
      }
      setDataSource(value as any)
    },
    [setDataSource],
  )

  return (
    <Container>
      <Group>
        <Text>{t('Data Source')}</Text>
        <HTMLSelect value={dataSource} onChange={handleChangeQuestSource}>
          <option value="">{t('Auto detect')}</option>
          {QUEST_DATA.map((source) => (
            <option key={source.key} value={source.key}>
              {source.name} ({Object.keys(source.res).length})
            </option>
          ))}
        </HTMLSelect>
      </Group>

      <Button
        intent={Intent.WARNING}
        icon={IconNames.TRASH}
        text={t('Restore defaults')}
        onClick={removeStorage}
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
      <DataExportArea />
    </Container>
  )
}

export const Settings = () => (
  <StrictMode>
    <StoreProvider>
      <SettingsMain />
    </StoreProvider>
  </StrictMode>
)
