import {
  analyzeQuestRequirement,
  buildQuestAnalysisMap,
  buildReadyQuestFilter,
  isQuestRequirementReady,
} from '../analysis'
import { parseShipCsvImport } from '../importedInventory/csv'
import { emptyImportedInventoryState } from '../importedInventory/types'
import { QUEST_REQUIREMENTS } from '../requirements'
import type { QuestRequirement } from '../requirements'

const inventory = {
  ships: [
    {
      id: '1',
      shipId: 1,
      name: '明石',
      shipType: 19,
      shipClass: 47,
      compatibleNames: ['明石'],
      remodelRank: 0,
    },
    {
      id: '2',
      shipId: 2,
      name: '吹雪',
      shipType: 2,
      shipClass: 1,
      compatibleNames: ['吹雪'],
      remodelRank: 0,
    },
    {
      id: '3',
      shipId: 3,
      name: '白雪',
      shipType: 2,
      shipClass: 1,
      compatibleNames: ['白雪'],
      remodelRank: 0,
    },
    {
      id: '4',
      shipId: 4,
      name: '初雪',
      shipType: 2,
      shipClass: 1,
      compatibleNames: ['初雪'],
      remodelRank: 0,
    },
    {
      id: '5',
      shipId: 5,
      name: '綾波改二',
      shipType: 2,
      shipClass: 1,
      compatibleNames: ['綾波', '綾波改', '綾波改二'],
      remodelRank: 2,
    },
  ],
  equipments: [
    { id: '10', equipmentId: 10, name: '25mm単装機銃', type2: 21 },
    { id: '11', equipmentId: 11, name: '25mm連装機銃', type2: 21 },
    { id: '12', equipmentId: 12, name: '12.7cm連装砲', type2: 1 },
  ],
}

describe('analyzeQuestRequirement', () => {
  test('detects ready analysis status for ready-filter usage', () => {
    expect(
      isQuestRequirementReady({
        gameId: 1,
        status: 'ready',
        origin: 'curated',
        missingShips: [],
        missingEquipments: [],
        missingInventoryParts: [],
        notes: [],
        requirement: null,
      }),
    ).toBe(true)

    expect(
      isQuestRequirementReady({
        gameId: 2,
        status: 'missing_ships',
        origin: 'curated',
        missingShips: ['夕張改二 x1'],
        missingEquipments: [],
        missingInventoryParts: [],
        notes: [],
        requirement: null,
      }),
    ).toBe(false)
  })

  test('builds a quest filter that keeps only ready quests', () => {
    const readyFilter = buildReadyQuestFilter({
      1: {
        gameId: 1,
        status: 'ready',
        origin: 'curated',
        missingShips: [],
        missingEquipments: [],
        missingInventoryParts: [],
        notes: [],
        requirement: null,
      },
      2: {
        gameId: 2,
        status: 'missing_ships',
        origin: 'curated',
        missingShips: ['皐月改二 x1'],
        missingEquipments: [],
        missingInventoryParts: [],
        notes: [],
        requirement: null,
      },
    } as any)

    expect(
      [1, 2]
        .map((gameId) => ({ gameId, docQuest: { code: `A${gameId}`, name: '', desc: '' } }))
        .filter(readyFilter)
        .map((quest) => quest.gameId),
    ).toEqual([1])
  })

  test('returns ready when named ship requirement is met', () => {
    const requirement: QuestRequirement = {
      ships: [{ label: '明石', names: ['明石'], count: 1 }],
    }

    expect(analyzeQuestRequirement(1, requirement, inventory)).toMatchObject({
      status: 'ready',
      missingShips: [],
      missingEquipments: [],
    })
  })

  test('returns missing_ships when named ship requirement is not met', () => {
    const requirement: QuestRequirement = {
      ships: [{ label: '由良改二', names: ['由良改二'], count: 1 }],
    }

    expect(analyzeQuestRequirement(1, requirement, inventory)).toMatchObject({
      status: 'missing_ships',
      missingShips: ['由良改二 x1'],
    })
  })

  test('returns missing_equipments when equipment requirement is not met', () => {
    const requirement: QuestRequirement = {
      equipments: [{ label: '對空機銃', type2: [21], count: 3 }],
    }

    expect(analyzeQuestRequirement(1, requirement, inventory)).toMatchObject({
      status: 'missing_equipments',
      missingEquipments: ['對空機銃 x1'],
    })
  })

  test('returns missing_both when ships and equipments are both missing', () => {
    const requirement: QuestRequirement = {
      ships: [{ label: '由良改二', names: ['由良改二'], count: 1 }],
      equipments: [{ label: '對空機銃', type2: [21], count: 3 }],
    }

    expect(analyzeQuestRequirement(1, requirement, inventory)).toMatchObject({
      status: 'missing_both',
      missingShips: ['由良改二 x1'],
      missingEquipments: ['對空機銃 x1'],
    })
  })

  test('returns missing_inventory when required CSV inventory is not imported', () => {
    const requirement: QuestRequirement = {
      ships: [{ label: '明石', names: ['明石'], count: 1 }],
      equipments: [{ label: '對空機銃', type2: [21], count: 1 }],
    }

    expect(
      analyzeQuestRequirement(1, requirement, emptyImportedInventoryState),
    ).toMatchObject({
      status: 'missing_inventory',
      missingInventoryParts: ['ships', 'equipments'],
    })
  })

  test('checks remodel names exactly', () => {
    const requirement: QuestRequirement = {
      ships: [{ label: '綾波', names: ['綾波'], count: 1 }],
    }

    expect(analyzeQuestRequirement(1, requirement, inventory)).toMatchObject({
      status: 'ready',
    })
  })

  test('accepts renamed predecessor when current remodel changed names', () => {
    const renamedInventory = {
      ...inventory,
      ships: [
        ...inventory.ships,
        {
          id: '6',
          shipId: 6,
          name: '龍鳳改二戊',
          shipType: 7,
          shipClass: 75,
          compatibleNames: ['大鯨', '龍鳳', '龍鳳改', '龍鳳改二戊'],
          remodelRank: 3,
        },
      ],
    }
    const requirement: QuestRequirement = {
      ships: [{ label: '大鯨', names: ['大鯨'], count: 1 }],
    }

    expect(analyzeQuestRequirement(1, requirement, renamedInventory)).toMatchObject({
      status: 'ready',
    })
  })

  test('checks flagship position and escort count', () => {
    const requirement: QuestRequirement = {
      positions: {
        flagship: [{ label: '旗艦：明石', names: ['明石'] }],
      },
      shipTypes: [{ label: '驅逐艦 3 艘', shipTypes: [2], count: 3 }],
    }

    expect(analyzeQuestRequirement(1, requirement, inventory)).toMatchObject({
      status: 'ready',
    })
  })

  test('uses remodel-chain compatibility for flagship name checks', () => {
    const requirement: QuestRequirement = {
      positions: {
        flagship: [{ label: '旗艦：明石', names: ['明石'] }],
      },
    }
    const remodeledInventory = {
      ...inventory,
      ships: [
        {
          id: '1',
          shipId: 182,
          name: '明石改',
          shipType: 19,
          shipClass: 47,
          compatibleNames: ['明石', '明石改'],
          remodelRank: 1,
        },
      ],
    }

    expect(analyzeQuestRequirement(1, requirement, remodeledInventory)).toMatchObject({
      status: 'ready',
    })
  })

  test('supports ship groups for historical fleet aliases', () => {
    const requirement: QuestRequirement = {
      ships: [{ label: '三川艦隊成員 4 艘', group: 'mikawa_fleet', count: 4 }],
    }

    const mikawaInventory = {
      ...inventory,
      ships: [
        ...inventory.ships,
        {
          id: '6',
          shipId: 6,
          name: '鳥海改二',
          shipType: 5,
          shipClass: 7,
          compatibleNames: ['鳥海', '鳥海改', '鳥海改二'],
          remodelRank: 2,
        },
        {
          id: '7',
          shipId: 7,
          name: '青葉改',
          shipType: 5,
          shipClass: 7,
          compatibleNames: ['青葉', '青葉改'],
          remodelRank: 1,
        },
        {
          id: '8',
          shipId: 8,
          name: '衣笠改二',
          shipType: 5,
          shipClass: 7,
          compatibleNames: ['衣笠', '衣笠改', '衣笠改二'],
          remodelRank: 2,
        },
        {
          id: '9',
          shipId: 9,
          name: '加古改二',
          shipType: 5,
          shipClass: 7,
          compatibleNames: ['加古', '加古改', '加古改二'],
          remodelRank: 2,
        },
      ],
    }

    expect(analyzeQuestRequirement(1, requirement, mikawaInventory)).toMatchObject({
      status: 'ready',
    })
  })

  test('supports flagship-specific destroyer division quests such as A70', () => {
    const requirement: QuestRequirement = {
      positions: {
        flagship: [{ label: '旗艦：朝潮改二 / 朝潮改二丁', names: ['朝潮改二', '朝潮改二丁'] }],
      },
      ships: [{ label: '滿潮 / 大潮 / 荒潮 3 艘', names: ['満潮', '大潮', '荒潮'], count: 3 }],
    }

    const dai8Inventory = {
      ...inventory,
      ships: [
        {
          id: '11',
          shipId: 11,
          name: '朝潮改二丁',
          shipType: 2,
          shipClass: 54,
          compatibleNames: ['朝潮', '朝潮改', '朝潮改二', '朝潮改二丁'],
          remodelRank: 3,
        },
        {
          id: '12',
          shipId: 12,
          name: '満潮改二',
          shipType: 2,
          shipClass: 54,
          compatibleNames: ['満潮', '満潮改', '満潮改二'],
          remodelRank: 2,
        },
        {
          id: '13',
          shipId: 13,
          name: '大潮改二',
          shipType: 2,
          shipClass: 54,
          compatibleNames: ['大潮', '大潮改', '大潮改二'],
          remodelRank: 2,
        },
        {
          id: '14',
          shipId: 14,
          name: '荒潮改二',
          shipType: 2,
          shipClass: 54,
          compatibleNames: ['荒潮', '荒潮改', '荒潮改二'],
          remodelRank: 2,
        },
      ],
    }

    expect(analyzeQuestRequirement(175, requirement, dai8Inventory)).toMatchObject({
      status: 'ready',
    })
  })

  test('supports Saratoga-led task-force requirements such as A80', () => {
    const requirement: QuestRequirement = {
      positions: {
        flagship: [
          {
            label: '第一艦隊旗艦：Saratoga Mk.II / Mod.2',
            names: ['Saratoga Mk.II', 'Saratoga Mk.II Mod.2'],
          },
        ],
      },
      shipTypes: [
        { label: '輕巡洋艦 1 艘', shipTypes: [3], count: 1 },
        { label: '驅逐艦 2 艘', shipTypes: [2], count: 2 },
      ],
    }

    const taskForceInventory = {
      ...inventory,
      ships: [
        {
          id: '15',
          shipId: 15,
          name: 'Saratoga Mk.II Mod.2',
          shipType: 11,
          shipClass: 83,
          compatibleNames: ['Saratoga', 'Saratoga改', 'Saratoga Mk.II', 'Saratoga Mk.II Mod.2'],
          remodelRank: 3,
        },
        {
          id: '16',
          shipId: 16,
          name: '阿武隈改二',
          shipType: 3,
          shipClass: 16,
          compatibleNames: ['阿武隈', '阿武隈改', '阿武隈改二'],
          remodelRank: 2,
        },
        {
          id: '17',
          shipId: 17,
          name: '夕立改二',
          shipType: 2,
          shipClass: 23,
          compatibleNames: ['夕立', '夕立改', '夕立改二'],
          remodelRank: 2,
        },
        {
          id: '18',
          shipId: 18,
          name: '綾波改二',
          shipType: 2,
          shipClass: 1,
          compatibleNames: ['綾波', '綾波改', '綾波改二'],
          remodelRank: 2,
        },
      ],
    }

    expect(analyzeQuestRequirement(185, requirement, taskForceInventory)).toMatchObject({
      status: 'ready',
    })
  })

  test('uses external ship CSV data to keep A66 focused on the truly missing remodel', () => {
    const csv = [
      '艦 ID,艦名,假名,艦種,後續改造',
      '12,五十鈴改二,いすず,軽巡洋艦,NA',
      '34,卯月改,うづき,駆逐艦,NA',
    ].join('\n')
    const { ships } = parseShipCsvImport(csv)

    expect(
      analyzeQuestRequirement(171, QUEST_REQUIREMENTS[171], {
        ships,
        equipments: [],
      }),
    ).toMatchObject({
      status: 'missing_ships',
      missingShips: ['皐月改二 x1'],
    })
  })

  test('uses external ship CSV data so A80 only reports missing Saratoga variants', () => {
    const csv = [
      '艦 ID,艦名,假名,艦種,後續改造',
      '201,阿武隈改二,あぶくま,軽巡洋艦,NA',
      '202,夕立改二,ゆうだち,駆逐艦,NA',
      '203,綾波改二,あやなみ,駆逐艦,NA',
    ].join('\n')
    const { ships } = parseShipCsvImport(csv)

    expect(
      analyzeQuestRequirement(185, QUEST_REQUIREMENTS[185], {
        ships,
        equipments: [],
      }),
    ).toMatchObject({
      status: 'missing_ships',
      missingShips: ['第一艦隊旗艦：Saratoga Mk.II / Mod.2 x1'],
    })
  })

  test('uses curated A89 requirement to detect missing Tenryu/Tatsuta kai-ni precisely', () => {
    const csv = [
      '艦 ID,艦名,假名,艦種,後續改造',
      '197,天龍改,てんりゅう,軽巡洋艦,天龍改二',
      '42,龍田改,たつた,軽巡洋艦,龍田改二',
    ].join('\n')
    const { ships } = parseShipCsvImport(csv)

    expect(
      analyzeQuestRequirement(194, QUEST_REQUIREMENTS[194], {
        ships,
        equipments: [],
      }),
    ).toMatchObject({
      status: 'missing_ships',
      missingShips: ['天龍改二 x1', '龍田改二 x1'],
    })
  })

  test('supports minimum remodel rank like kaini-or-better', () => {
    const requirement: QuestRequirement = {
      ships: [
        {
          label: '第十九驅逐隊 4 艘（改二以上）',
          group: 'dai19_destroyer_division',
          count: 4,
          minRemodelRank: 2,
        },
      ],
    }

    const rank1Inventory = {
      ...inventory,
      ships: [
        ...inventory.ships,
        {
          id: '6',
          shipId: 6,
          name: '磯波改',
          shipType: 2,
          shipClass: 1,
          compatibleNames: ['磯波', '磯波改'],
          remodelRank: 1,
        },
        {
          id: '7',
          shipId: 7,
          name: '浦波改',
          shipType: 2,
          shipClass: 1,
          compatibleNames: ['浦波', '浦波改'],
          remodelRank: 1,
        },
        {
          id: '8',
          shipId: 8,
          name: '敷波改',
          shipType: 2,
          shipClass: 1,
          compatibleNames: ['敷波', '敷波改'],
          remodelRank: 1,
        },
      ],
    }

    expect(analyzeQuestRequirement(1, requirement, rank1Inventory)).toMatchObject({
      status: 'missing_ships',
      missingShips: ['第十九驅逐隊 4 艘（改二以上） x3'],
    })

    const rank2Inventory = {
      ...rank1Inventory,
      ships: rank1Inventory.ships.map((ship) => {
        if (ship.name === '磯波改') {
          return {
            ...ship,
            name: '磯波改二',
            compatibleNames: ['磯波', '磯波改', '磯波改二'],
            remodelRank: 2,
          }
        }
        if (ship.name === '浦波改') {
          return {
            ...ship,
            name: '浦波改二',
            compatibleNames: ['浦波', '浦波改', '浦波改二'],
            remodelRank: 2,
          }
        }
        if (ship.name === '敷波改') {
          return {
            ...ship,
            name: '敷波改二',
            compatibleNames: ['敷波', '敷波改', '敷波改二'],
            remodelRank: 2,
          }
        }
        return ship
      }),
    }

    expect(analyzeQuestRequirement(1, requirement, rank2Inventory)).toMatchObject({
      status: 'ready',
    })
  })

  test('uses inferred fallback rules for direct-name composition quests such as A83', () => {
    const analysisMap = buildQuestAnalysisMap(
      [
        {
          gameId: 188,
          docQuest: {
            code: 'A83',
            name: '精銳「三一驅」第一小隊，準備拔錨',
            desc: '編成任務：長波改二旗艦，並配以高波改，沖波改或朝霜改作為僚艦，編成第三一驅逐隊第一小隊 (二船艦隊)',
          },
        },
      ] as any,
      {},
      inventory,
    )

    expect(analysisMap[188]).toMatchObject({
      status: 'missing_ships',
      origin: 'inferred',
      missingShips: ['旗艦：長波改二 x1', '高波改 / 沖波改 / 朝霜改 x1'],
      notes: ['未檢查二艘艦隊細節。', '未檢查隊別編成細節。'],
    })
  })

  test('preserves curated rules ahead of inferred fallback for quests such as A70', () => {
    const analysisMap = buildQuestAnalysisMap(
      [
        {
          gameId: 175,
          docQuest: {
            code: 'A70',
            name: '新編「第八驅逐隊」的再編成',
            desc: '「朝潮改二 / 丁」作為旗艦和「滿潮」「大潮」「荒潮」組成的「第八驅逐隊」的再編成',
          },
        },
      ] as any,
      QUEST_REQUIREMENTS,
      {
        ...inventory,
        ships: [
          {
            id: '11',
            shipId: 11,
            name: '朝潮改二丁',
            shipType: 2,
            shipClass: 54,
            compatibleNames: ['朝潮', '朝潮改', '朝潮改二', '朝潮改二丁'],
            remodelRank: 3,
          },
          {
            id: '12',
            shipId: 12,
            name: '満潮改二',
            shipType: 2,
            shipClass: 54,
            compatibleNames: ['満潮', '満潮改', '満潮改二'],
            remodelRank: 2,
          },
          {
            id: '13',
            shipId: 13,
            name: '大潮改二',
            shipType: 2,
            shipClass: 54,
            compatibleNames: ['大潮', '大潮改', '大潮改二'],
            remodelRank: 2,
          },
          {
            id: '14',
            shipId: 14,
            name: '荒潮改二',
            shipType: 2,
            shipClass: 54,
            compatibleNames: ['荒潮', '荒潮改', '荒潮改二'],
            remodelRank: 2,
          },
        ],
        equipments: inventory.equipments,
      },
    )

    expect(analysisMap[175]).toMatchObject({
      status: 'ready',
      origin: 'curated',
    })
  })

  test('returns not_applicable for pure progress quests such as Bw7', () => {
    const analysisMap = buildQuestAnalysisMap(
      [
        {
          gameId: 241,
          docQuest: {
            code: 'Bw7',
            name: '(週常) 消滅敵北方艦隊主力',
            desc: '向北方海域深處 (3-3,3-4,3-5) 出擊，捕捉敵人北方艦隊的主力，擊敗敵軍主力艦 5 次',
          },
        },
      ] as any,
      {},
      inventory,
    )

    expect(analysisMap[241]).toMatchObject({
      status: 'not_applicable',
      origin: 'none',
    })
  })

  test('keeps unsupported when a quest hints at inventory conditions but cannot be parsed safely', () => {
    const analysisMap = buildQuestAnalysisMap(
      [
        {
          gameId: 9999,
          docQuest: {
            code: 'Bz1',
            name: '艦隊任務',
            desc: '以「西村艦隊」為核心出擊並獲得勝利',
          },
        },
      ] as any,
      {},
      inventory,
    )

    expect(analysisMap[9999]).toMatchObject({
      status: 'unsupported',
      origin: 'none',
    })
  })

  test('returns unsupported when requirement is missing', () => {
    expect(analyzeQuestRequirement(1, null, inventory)).toMatchObject({
      status: 'unsupported',
      origin: 'none',
    })
  })
})
