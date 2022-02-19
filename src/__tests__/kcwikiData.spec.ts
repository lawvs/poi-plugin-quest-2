import { version, KcwikiQuestData } from '../../build/kcQuestsData'

test('should KcwikiQuestData Game data version correct', () => {
  expect(version).toMatchInlineSnapshot(
    `"be5db381c0cca84ede0166eb8c582d19afe0aec1"`
  )
})

test('should KcwikiQuestData Game data keys correct', () => {
  expect(Object.keys(KcwikiQuestData)).toMatchInlineSnapshot(`
    Array [
      "zh-CN",
    ]
  `)
})
