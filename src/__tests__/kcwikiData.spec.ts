import { KcwikiQuestData } from '../../build/kcQuestsData'

test('should KcwikiQuestData Game data keys correct', () => {
  expect(Object.keys(KcwikiQuestData)).toMatchInlineSnapshot(`
Array [
  "zh-CN",
]
`)
})
