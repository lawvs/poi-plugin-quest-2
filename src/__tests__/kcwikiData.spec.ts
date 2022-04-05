import { version, KcwikiQuestData } from '../../build/kcQuestsData'

describe('should version correct', () => {
  test('should KcwikiQuestData Game data version correct', () => {
    expect(version).toMatchInlineSnapshot(
      `"0333ac2f07ac4d4831cbe1896472004fe456ac79"`
    )
  })

  test('should KcwikiQuestData Game data keys correct', () => {
    expect(Object.keys(KcwikiQuestData)).toMatchInlineSnapshot(`
          Array [
            "zh-CN",
          ]
      `)
  })
})

describe('should format correct', () => {
  test('key format', () => {
    Object.keys(KcwikiQuestData['zh-CN']).forEach((key) => {
      // gameId should not extra space
      expect(key.trim()).toEqual(key)
      // gameId should be number
      expect(String(+key)).toEqual(key)
    })
  })
})
