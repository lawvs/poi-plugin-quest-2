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
import React, { StrictMode, useCallback, useRef, useState } from 'react'
import styled from 'styled-components'

import { QUEST_DATA } from '../build'
import { version as DATA_VERSION } from '../build/kcanotifyGamedata'
import PKG from '../package.json'
import { summarizeQuestAnalysis } from './analysis'
import { buildQuestExportPayload } from './export'
import {
  parseEquipmentCsvImport,
  parseShipCsvImport,
} from './importedInventory/csv'
import { IN_POI } from './poi/env'
import { usePluginTranslation, useStateExporter } from './poi/hooks'
import { tips } from './poi/utils'
import {
  StoreProvider,
  useDataSource,
  useImportedInventory,
  useImportedInventoryActions,
  useQuest,
  useQuestAnalysisDebugMap,
  useQuestAnalysisMap,
  useRemoveStorage,
} from './store'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  user-select: text;
  gap: 8px;
  padding: 8px;
`

const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
`

const HiddenFileInput = styled.input`
  display: none;
`

const ImportSummary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const DataExportArea = () => {
  const [text, setText] = useState<string>('')
  const { t } = usePluginTranslation()
  const { exportQuestDataToFile, importAsPoiState } = useStateExporter()
  const quests = useQuest()
  const analysisMap = useQuestAnalysisMap()
  const debugMap = useQuestAnalysisDebugMap()
  const analysisSummary = summarizeQuestAnalysis(analysisMap)
  const importedInventory = useImportedInventory()

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
      const payload = buildQuestExportPayload({
        quests,
        analysisMap,
        debugMap,
        summary: analysisSummary,
        inventory: importedInventory,
        pluginVersion: PKG.version,
      })
      const saved = await exportQuestDataToFile(payload)
      if (!saved) {
        return
      }
      tips.success(t('Exported quest analysis file'))
    } catch (error) {
      console.error(error)
      tips.error(t('Failed to export quest data to file'))
    }
  }, [
    analysisMap,
    analysisSummary,
    debugMap,
    exportQuestDataToFile,
    importedInventory,
    quests,
    t,
  ])

  return IN_POI ? (
    <Button
      icon={IconNames.EXPORT}
      text={t('Export quest analysis')}
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

const InventoryImportArea = () => {
  const { t } = usePluginTranslation()
  const importedInventory = useImportedInventory()
  const { setImportedShips, setImportedEquipments, clearImportedInventory } =
    useImportedInventoryActions()
  const shipInputRef = useRef<HTMLInputElement>(null)
  const equipmentInputRef = useRef<HTMLInputElement>(null)

  const handleShipCsv = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (!file) {
        return
      }

      try {
        const text = await file.text()
        const { ships, format } = parseShipCsvImport(text)
        setImportedShips(ships, {
          fileName: file.name,
          importedAt: new Date().toISOString(),
          count: ships.length,
          format,
        })
        tips.success(t('Ship CSV import success'))
      } catch (error) {
        console.error(error)
        tips.error(t('Ship CSV import failed'))
      }
    },
    [setImportedShips, t],
  )

  const handleEquipmentCsv = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (!file) {
        return
      }

      try {
        const text = await file.text()
        const { equipments, format } = parseEquipmentCsvImport(text)
        setImportedEquipments(equipments, {
          fileName: file.name,
          importedAt: new Date().toISOString(),
          count: equipments.length,
          format,
        })
        tips.success(t('Equipment CSV import success'))
      } catch (error) {
        console.error(error)
        tips.error(t('Equipment CSV import failed'))
      }
    },
    [setImportedEquipments, t],
  )

  const handleClear = useCallback(() => {
    clearImportedInventory()
    tips.success(t('Imported inventory cleared'))
  }, [clearImportedInventory, t])

  return (
    <Group>
      <Text>{t('Inventory Import')}</Text>
      <HiddenFileInput
        ref={shipInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleShipCsv}
      />
      <HiddenFileInput
        ref={equipmentInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleEquipmentCsv}
      />
      <Button
        icon={IconNames.UPLOAD}
        text={t('Import ship CSV')}
        onClick={() => shipInputRef.current?.click()}
      />
      <Button
        icon={IconNames.UPLOAD}
        text={t('Import equipment CSV')}
        onClick={() => equipmentInputRef.current?.click()}
      />
      <Button
        intent={Intent.WARNING}
        icon={IconNames.TRASH}
        text={t('Clear imported inventory')}
        onClick={handleClear}
      />
      <ImportSummary>
        <Text>
          {importedInventory.shipCsv
            ? t('Imported Ship CSV Summary', {
              fileName: importedInventory.shipCsv.fileName,
              count: importedInventory.shipCsv.count,
              format: t(
                importedInventory.shipCsv.format === 'external_csv'
                  ? 'External CSV Format'
                  : 'Legacy CSV Format',
              ),
              importedAt: importedInventory.shipCsv.importedAt,
            })
            : t('Ship CSV not imported')}
        </Text>
        {importedInventory.shipCsv?.format === 'legacy_localized_csv' ? (
          <Text>{t('Legacy Ship CSV Warning')}</Text>
        ) : null}
        <Text>
          {importedInventory.equipmentCsv
            ? t('Imported Equipment CSV Summary', {
                fileName: importedInventory.equipmentCsv.fileName,
                count: importedInventory.equipmentCsv.count,
                format: t(
                  importedInventory.equipmentCsv.format === 'external_csv'
                    ? 'External CSV Format'
                    : 'Legacy CSV Format',
                ),
                importedAt: importedInventory.equipmentCsv.importedAt,
              })
            : t('Equipment CSV not imported')}
        </Text>
      </ImportSummary>
    </Group>
  )
}

export const SettingsMain = () => {
  const { t } = usePluginTranslation()
  const removeStorage = useRemoveStorage()
  const { dataSource, setDataSource } = useDataSource()
  const packageMeta = PKG as typeof PKG & {
    bugs?: { url?: string }
    homepage?: string
  }
  const issueUrl =
    typeof packageMeta.bugs?.url === 'string' ? packageMeta.bugs.url : undefined
  const homepageUrl =
    typeof packageMeta.homepage === 'string' ? packageMeta.homepage : undefined

  const handleChangeQuestSource = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value
      if (!value) {
        setDataSource(null)
        return
      }
      setDataSource(value as typeof dataSource)
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

      <InventoryImportArea />

      <Button
        intent={Intent.WARNING}
        icon={IconNames.TRASH}
        text={t('Restore defaults')}
        onClick={removeStorage}
      />

      {issueUrl ? (
        <AnchorButton
          icon={IconNames.Bug}
          rightIcon={IconNames.SHARE}
          text={t('Report issue')}
          href={issueUrl}
          target="_blank"
        />
      ) : null}
      {homepageUrl ? (
        <AnchorButton
          icon={IconNames.Heart}
          rightIcon={IconNames.SHARE}
          text={t('Star project, support the author')}
          href={homepageUrl}
          target="_blank"
        />
      ) : null}
      <DataExportArea />

      <Text>{t('Version', { version: PKG.version })}</Text>
      <Text>{t('Data Version', { version: DATA_VERSION })}</Text>
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
