import {
  parseEquipmentCsv,
  parseEquipmentCsvImport,
  parseShipCsv,
  parseShipCsvImport,
} from '../importedInventory/csv'

describe('CSV inventory import', () => {
  test('detects external ship CSV format and preserves exact Japanese ship names', () => {
    const csv = [
      '艦 ID,艦名,假名,艦種,後續改造',
      '12,五十鈴改二,いすず,軽巡洋艦,NA',
      '42,龍田改,たつた,軽巡洋艦,龍田改二',
      '4466,長波,ながなみ,駆逐艦,長波改',
    ].join('\n')

    expect(parseShipCsvImport(csv)).toEqual({
      format: 'external_csv',
      ships: [
        {
          id: '12',
          shipId: 12,
          name: '五十鈴改二',
          shipType: 3,
          shipClass: -1,
          compatibleNames: ['五十鈴改二', '五十鈴', '五十鈴改'],
          remodelRank: 2,
        },
        {
          id: '42',
          shipId: 42,
          name: '龍田改',
          shipType: 3,
          shipClass: -1,
          compatibleNames: ['龍田改', '龍田'],
          remodelRank: 1,
        },
        {
          id: '4466',
          shipId: 4466,
          name: '長波',
          shipType: 2,
          shipClass: -1,
          compatibleNames: ['長波'],
          remodelRank: 0,
        },
      ],
    })
  })

  test('parses ship CSV with reordered columns', () => {
    const csv = [
      '艦種,等級,艦名,艦 ID',
      '駆逐艦,55,電改,1',
      '工作艦,35,明石改,182',
      '輕空母,99,龍鳳改二戊,888',
    ].join('\n')

    expect(parseShipCsv(csv)).toEqual([
      {
        id: '1',
        shipId: 1,
        name: '電改',
        shipType: 2,
        shipClass: -1,
        compatibleNames: ['電改', '電'],
        remodelRank: 1,
      },
      {
        id: '182',
        shipId: 182,
        name: '明石改',
        shipType: 19,
        shipClass: -1,
        compatibleNames: ['明石改', '明石'],
        remodelRank: 1,
      },
      {
        id: '888',
        shipId: 888,
        name: '龍鳳改二戊',
        shipType: 7,
        shipClass: -1,
        compatibleNames: ['龍鳳改二戊', '龍鳳', '龍鳳改', '龍鳳改二', '大鯨'],
        remodelRank: 2,
      },
    ])
  })

  test('marks localized ship CSV as legacy format', () => {
    const csv = [
      '艦種,等級,艦名,艦 ID',
      '駆逐艦,55,電改,1',
    ].join('\n')

    expect(parseShipCsvImport(csv).format).toBe('legacy_localized_csv')
  })

  test('parses equipment CSV with extra columns', () => {
    const csv = [
      '熟練度,類別ID,裝備名稱,ID (Instance),Master ID,備註',
      '7,10,零式小型水上機,144,522,NA',
      '0,1,10cm連装高角砲,189,3,NA',
    ].join('\n')

    expect(parseEquipmentCsv(csv)).toEqual([
      {
        id: '144',
        equipmentId: 522,
        name: '零式小型水上機',
        type2: 10,
      },
      {
        id: '189',
        equipmentId: 3,
        name: '10cm連装高角砲',
        type2: 1,
      },
    ])
  })

  test('marks equipment export CSV as external format', () => {
    const csv = [
      'ID (Instance),Master ID,裝備名稱,類別ID',
      '144,522,零式小型水上機,10',
    ].join('\n')

    expect(parseEquipmentCsvImport(csv)).toEqual({
      format: 'external_csv',
      equipments: [
        {
          id: '144',
          equipmentId: 522,
          name: '零式小型水上機',
          type2: 10,
        },
      ],
    })
  })

  test('throws on missing required headers', () => {
    expect(() => parseShipCsv('艦名\n明石')).toThrow(
      'Ship CSV is missing required columns: 艦種',
    )
  })
})
