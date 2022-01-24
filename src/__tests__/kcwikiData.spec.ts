import { version, KcwikiQuestData } from '../../build/kcQuestsData'

test('should KcwikiQuestData Game data version correct', () => {
  expect(version).toMatchInlineSnapshot(
    `"1ad9f7a5373ab65fc6abea972b571dc6c44d5492"`
  )
})

test('should KcwikiQuestData Game data keys correct', () => {
  expect(Object.keys(KcwikiQuestData)).toMatchInlineSnapshot(`
    Array [
      "zh-CN",
    ]
  `)
})
