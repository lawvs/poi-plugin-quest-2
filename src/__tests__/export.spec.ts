import { buildQuestExportPayload } from '../export'

describe('buildQuestExportPayload', () => {
  test('includes quest metadata, analysis, and debug payload', () => {
    const payload = buildQuestExportPayload({
      pluginVersion: '0.16.0',
      inventory: {
        shipCsv: {
          fileName: 'kancolle_kan_26-03-12.csv',
          importedAt: '2026-03-12T01:23:45.000Z',
          count: 478,
          format: 'external_csv',
        },
        equipmentCsv: {
          fileName: 'kancolle_equips_2026-03-07.csv',
          importedAt: '2026-03-12T01:23:45.000Z',
          count: 1234,
          format: 'external_csv',
        },
      },
      summary: {
        ready: 1,
        missing_ships: 0,
        missing_equipments: 0,
        missing_both: 0,
        missing_inventory: 0,
        not_applicable: 0,
        unsupported: 0,
      },
      quests: [
        {
          gameId: 903,
          gameQuest: { api_no: 903, api_state: 2 },
          docQuest: {
            code: 'B139',
            name: '拡張「六水戦」、最前線へ！',
            desc: 'quest description',
            rewards: 'reward text',
            memo2: 'detail text',
          },
        },
      ] as any,
      analysisMap: {
        903: {
          gameId: 903,
          status: 'missing_inventory',
          origin: 'curated',
          missingShips: [],
          missingEquipments: [],
          missingInventoryParts: ['ships', 'equipments'],
          notes: ['import inventory first'],
          requirement: null,
        },
      },
      debugMap: {
        903: {
          gameId: 903,
          status: 'missing_inventory',
          origin: 'curated',
          shipMatchers: [],
          equipmentMatchers: [],
        },
      },
    })

    expect(payload.pluginVersion).toBe('0.16.0')
    expect(payload.inventory).toEqual({
      shipCsv: {
        fileName: 'kancolle_kan_26-03-12.csv',
        importedAt: '2026-03-12T01:23:45.000Z',
        count: 478,
        format: 'external_csv',
      },
      equipmentCsv: {
        fileName: 'kancolle_equips_2026-03-07.csv',
        importedAt: '2026-03-12T01:23:45.000Z',
        count: 1234,
        format: 'external_csv',
      },
    })
    expect(payload.analysisSummary.missing_inventory).toBe(0)
    expect(payload.quests).toEqual([
      {
        gameId: 903,
        code: 'B139',
        name: '拡張「六水戦」、最前線へ！',
        description: 'quest description',
        rewards: 'reward text',
        details: 'detail text',
        inGameState: 2,
        analysis: {
          status: 'missing_inventory',
          origin: 'curated',
          missingShips: [],
          missingEquipments: [],
          missingInventoryParts: ['ships', 'equipments'],
          notes: ['import inventory first'],
        },
        debug: {
          gameId: 903,
          status: 'missing_inventory',
          origin: 'curated',
          shipMatchers: [],
          equipmentMatchers: [],
        },
      },
    ])
    expect(payload.generatedAt).toEqual(expect.any(String))
  })

  test('falls back to unsupported analysis when a quest has no analysis result', () => {
    const payload = buildQuestExportPayload({
      pluginVersion: '0.16.0',
      inventory: {
        shipCsv: null,
        equipmentCsv: null,
      },
      summary: {
        ready: 0,
        missing_ships: 0,
        missing_equipments: 0,
        missing_both: 0,
        missing_inventory: 0,
        not_applicable: 0,
        unsupported: 1,
      },
      quests: [
        {
          gameId: 1,
          docQuest: {
            code: 'A1',
            name: '編成任務',
            desc: 'quest description',
          },
        },
      ] as any,
      analysisMap: {},
      debugMap: {},
    })

    expect(payload.quests[0]).toMatchObject({
      gameId: 1,
      code: 'A1',
      analysis: {
        status: 'unsupported',
        origin: 'none',
        missingShips: [],
        missingEquipments: [],
        missingInventoryParts: [],
        notes: [],
      },
    })
  })
})
