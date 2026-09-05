import type { QuestRequirement } from './types'

export const QUEST_REQUIREMENTS: Record<number, QuestRequirement> = {
  171: {
    positions: {
      flagship: [{ label: '旗艦：五十鈴改二', names: ['五十鈴改二'] }],
    },
    ships: [
      { label: '皐月改二', names: ['皐月改二'], count: 1 },
      { label: '卯月改', names: ['卯月改'], count: 1 },
    ],
    notes: ['僅檢查指定艦娘，不檢查其餘「對潛機動水上部隊」編成細節。'],
  },
  175: {
    positions: {
      flagship: [{ label: '旗艦：朝潮改二 / 朝潮改二丁', names: ['朝潮改二', '朝潮改二丁'] }],
    },
    ships: [{ label: '滿潮 / 大潮 / 荒潮 3 艘', names: ['満潮', '大潮', '荒潮'], count: 3 }],
    notes: ['旗艦條件接受朝潮改二與朝潮改二丁。'],
  },
  185: {
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
    notes: ['僅檢查旗艦與艦種數量，不檢查第一艦隊限制與「夜間作戰可能」細節。'],
  },
  194: {
    ships: [
      { label: '天龍改二', names: ['天龍改二'], count: 1 },
      { label: '龍田改二', names: ['龍田改二'], count: 1 },
    ],
    notes: ['僅檢查指定艦娘，不檢查其餘「第十八戰隊」語義。'],
  },
  318: {
    shipTypes: [{ label: '輕巡 2 艘', shipTypes: [3], count: 2 }],
    notes: ['僅檢查持有艦娘與裝備，不檢查演習次數。'],
  },
  330: {
    shipTypes: [{ label: '空母系 1 艘', shipTypes: [7, 11], count: 1 }],
    notes: ['僅檢查持有艦娘與裝備，不檢查演習次數。'],
  },
  337: {
    ships: [{ label: '第十八驅逐隊 4 艘', group: 'dai18_destroyer_division', count: 4 }],
    notes: ['僅檢查持有艦娘與裝備，不檢查演習次數。'],
  },
  339: {
    ships: [{ label: '第十九驅逐隊 4 艘', group: 'dai19_destroyer_division', count: 4 }],
    notes: ['僅檢查持有艦娘與裝備，不檢查演習次數。'],
  },
  342: {
    shipTypes: [
      { label: '驅逐 / 海防 3 艘', shipTypes: [1, 2], count: 3 },
      { label: '驅逐 / 海防 / 輕巡級 4 艘', shipTypes: [1, 2, 3, 4, 21], count: 4 },
    ],
    notes: ['僅檢查持有艦娘與裝備，不檢查演習次數。'],
  },
  362: {
    ships: [{ label: '第十一驅逐隊 4 艘', group: 'dai11_destroyer_division', count: 4 }],
    notes: ['僅檢查持有艦娘與裝備，不檢查演習次數。'],
  },
  371: {
    positions: {
      flagship: [{ label: '旗艦：春雨', names: ['春雨'] }],
    },
    ships: [{ label: '白露型僚艦 3 艘', group: 'shiratsuyu_class_harusame_team', count: 3 }],
    notes: ['僅檢查持有艦娘與裝備，不檢查演習次數。'],
  },
  638: {
    equipments: [{ label: '對空機銃', type2: [21], count: 6 }],
    notes: ['僅檢查持有裝備，不檢查廢棄進度。'],
  },
  663: {
    equipments: [{ label: '大口徑主砲', type2: [3], count: 10 }],
    notes: ['僅檢查持有裝備，不檢查廢棄進度。'],
  },
  676: {
    equipments: [
      { label: '中口徑主砲', type2: [2], count: 4 },
      { label: '副砲', type2: [4], count: 4 },
      { label: '發煙裝置 / 輸送用鼓桶', type2: [30], count: 4 },
    ],
    notes: ['僅檢查持有裝備，不檢查廢棄進度。'],
  },
  677: {
    equipments: [
      { label: '大口徑主砲', type2: [3], count: 3 },
      { label: '水上偵察機', type2: [10], count: 3 },
      { label: '魚雷', type2: [5], count: 3 },
    ],
    notes: ['僅檢查持有裝備，不檢查廢棄進度。'],
  },
  862: {
    shipTypes: [
      { label: '水上機母艦 1 艘', shipTypes: [16], count: 1 },
      { label: '輕巡 2 艘', shipTypes: [3], count: 2 },
    ],
    notes: ['僅檢查持有艦娘與裝備，不檢查出擊地圖與次數。'],
  },
  873: {
    shipTypes: [{ label: '輕巡 1 艘', shipTypes: [3], count: 1 }],
    notes: ['僅檢查持有艦娘與裝備，不檢查出擊地圖與次數。'],
  },
  888: {
    ships: [
      {
        label: '三川艦隊成員 4 艘',
        group: 'mikawa_fleet',
        count: 4,
      },
    ],
    notes: ['僅檢查持有艦娘與裝備，不檢查出擊地圖與次數。'],
  },
  894: {
    shipTypes: [{ label: '空母系 1 艘', shipTypes: [7, 11, 18], count: 1 }],
    notes: ['僅檢查持有艦娘與裝備，不檢查出擊地圖與次數。'],
  },
  903: {
    positions: {
      flagship: [{ label: '旗艦：夕張改二', names: ['夕張改二'] }],
    },
    ships: [
      { label: '由良改二', names: ['由良改二'], count: 1 },
      { label: '睦月型 2 艘', group: 'mutsuki_class_6th_destroyer_escort', count: 2 },
    ],
    notes: ['僅檢查持有艦娘與裝備，不檢查出擊地圖與次數。'],
  },
  912: {
    positions: {
      flagship: [{ label: '旗艦：明石', names: ['明石'] }],
    },
    shipTypes: [{ label: '驅逐艦 3 艘', shipTypes: [2], count: 3 }],
    notes: ['僅檢查持有艦娘與裝備，不檢查出擊地圖與次數。'],
  },
  944: {
    positions: {
      flagship: [{ label: '旗艦：驅逐艦或重巡', shipTypes: [2, 5] }],
    },
    shipTypes: [{ label: '驅逐 / 海防 3 艘', shipTypes: [1, 2], count: 3 }],
    notes: ['僅檢查持有艦娘與裝備，不檢查出擊地圖與次數。'],
  },
  946: {
    positions: {
      flagship: [{ label: '旗艦：空母系', shipTypes: [7, 11, 18] }],
    },
    shipTypes: [{ label: '重巡 / 航巡 2 艘', shipTypes: [5, 6], count: 2 }],
    notes: ['僅檢查持有艦娘與裝備，不檢查出擊地圖與次數。'],
  },
  875: {
    ships: [
      {
        label: '第三十一驅逐隊 2 艘（改裝後可向下相容）',
        group: 'dai31_destroyer_division',
        count: 2,
        minRemodelRank: 1,
      },
    ],
    notes: ['僅檢查持有艦娘與裝備，不檢查出擊地圖與次數。'],
  },
  975: {
    ships: [
      {
        label: '第十九驅逐隊 4 艘（改二以上）',
        group: 'dai19_destroyer_division',
        count: 4,
        minRemodelRank: 2,
      },
    ],
    notes: ['僅檢查持有艦娘與裝備，不檢查出擊地圖與次數。'],
  },
}
