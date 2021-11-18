import { version, KcwikiQuestData } from '../../build/kcQuestsData'

test('should KcwikiQuestData Game data version correct', () => {
  expect(version).toMatchInlineSnapshot(
    `"b76d2cf527be9266715ae5ccdd864f006a27443f"`
  )
})

test('should KcwikiQuestData Game data keys correct', () => {
  expect(Object.keys(KcwikiQuestData)).toMatchInlineSnapshot(`
    Array [
      "zh-CN",
    ]
  `)
})
