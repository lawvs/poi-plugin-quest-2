import {
  hasInventoryDependenciesChanged,
  normalizeInventory,
} from '../poi/inventory'

describe('normalizeInventory', () => {
  test('maps poi state to owned ships and equipments without merging remodels', () => {
    const inventory = normalizeInventory({
      info: {
        ships: {
          '100': { api_ship_id: 1 },
          '101': { api_ship_id: 2 },
        },
        equips: {
          '200': { api_slotitem_id: 10 },
          '201': { api_slotitem_id: 11 },
        },
      },
      const: {
        $ships: {
          '1': { api_name: '綾波', api_stype: 2, api_ctype: 1, api_aftershipid: 2 },
          '2': { api_name: '綾波改二', api_stype: 2, api_ctype: 1 },
        },
        $equips: {
          '10': { api_name: '25mm単装機銃', api_type: [0, 0, 21] },
          '11': { api_name: '12.7cm連装砲', api_type: [0, 0, 1] },
        },
      },
    })

    expect(inventory.ships).toEqual([
      {
        id: '100',
        shipId: 1,
        name: '綾波',
        shipType: 2,
        shipClass: 1,
        compatibleNames: ['綾波'],
        remodelRank: 0,
      },
      {
        id: '101',
        shipId: 2,
        name: '綾波改二',
        shipType: 2,
        shipClass: 1,
        compatibleNames: ['綾波改二', '綾波'],
        remodelRank: 1,
      },
    ])
    expect(inventory.equipments).toEqual([
      { id: '200', equipmentId: 10, name: '25mm単装機銃', type2: 21 },
      { id: '201', equipmentId: 11, name: '12.7cm連装砲', type2: 1 },
    ])
  })
})

describe('hasInventoryDependenciesChanged', () => {
  test('returns false when ship and equipment references are unchanged', () => {
    const refs = {
      ships: { '100': { api_ship_id: 1 } },
      equips: { '200': { api_slotitem_id: 10 } },
      shipMasters: { '1': { api_name: '綾波' } },
      equipmentMasters: { '10': { api_name: '25mm単装機銃' } },
    }

    expect(hasInventoryDependenciesChanged(refs, refs)).toBe(false)
  })

  test('returns true when ship inventory references change', () => {
    const previous = {
      ships: { '100': { api_ship_id: 1 } },
      equips: { '200': { api_slotitem_id: 10 } },
      shipMasters: { '1': { api_name: '綾波' } },
      equipmentMasters: { '10': { api_name: '25mm単装機銃' } },
    }
    const next = {
      ...previous,
      ships: { '101': { api_ship_id: 2 } },
    }

    expect(hasInventoryDependenciesChanged(previous, next)).toBe(true)
  })
})
