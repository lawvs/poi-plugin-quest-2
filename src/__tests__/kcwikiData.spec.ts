import { kcwikiGameData, version } from '../../build/kcQuestsData'
import newQuestData from '../../build/kcQuestsData/quests-scn-new.json'

describe('should version correct', () => {
  test('should KcwikiQuestData Game data version correct', () => {
    expect(version).toMatchInlineSnapshot(
      `"b2329a53cf22f71d3d8302f8dc1984a67297342e"`,
    )
  })
})

describe('should format correct', () => {
  test('key format', () => {
    Object.keys(kcwikiGameData.res).forEach((key) => {
      // gameId should not extra space
      expect(key).toEqual(key.trim())
      // gameId should be number
      expect(key).toEqual(String(+key))
    })
  })

  test('new quest key format', () => {
    Object.keys(newQuestData).forEach((gameId) => {
      // gameId should not extra space
      expect(gameId).toEqual(gameId.trim())
      // gameId should be number
      expect(gameId).toEqual(String(gameId))
    })
  })
})
