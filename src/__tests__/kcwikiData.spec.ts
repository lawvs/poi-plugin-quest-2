import { version, KcwikiQuestData } from '../../build/kcQuestsData'

test('should KcwikiQuestData Game data version correct', () => {
  expect(version).toMatchInlineSnapshot(
    `"004638c4fa18cf4d37e45f3a8704bffe7cdaa49e"`
  )
})

test('should KcwikiQuestData Game data keys correct', () => {
  expect(Object.keys(KcwikiQuestData)).toMatchInlineSnapshot(`
    Array [
      "zh-CN",
    ]
  `)
})
