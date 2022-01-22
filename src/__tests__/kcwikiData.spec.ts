import { version, KcwikiQuestData } from '../../build/kcQuestsData'

test('should KcwikiQuestData Game data version correct', () => {
  expect(version).toMatchInlineSnapshot(
    `"4a879abd57262c9a0e9acfce90b69be049a71266"`
  )
})

test('should KcwikiQuestData Game data keys correct', () => {
  expect(Object.keys(KcwikiQuestData)).toMatchInlineSnapshot(`
    Array [
      "zh-CN",
    ]
  `)
})
