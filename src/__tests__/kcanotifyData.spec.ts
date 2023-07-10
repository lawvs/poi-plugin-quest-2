import { version, QuestData } from '../../build/kcanotifyGamedata'

test('should Kcanotify Game data version correct', () => {
  expect(version).toMatchInlineSnapshot(`"2023070901"`)
})

test('should Kcanotify Game data keys correct', () => {
  expect(Object.keys(QuestData)).toMatchInlineSnapshot(`
Array [
  "zh-CN",
  "zh-TW",
  "ja-JP",
  "en-US",
  "ko-KR",
]
`)
})

describe('should format correct', () => {
  Object.keys(QuestData).forEach((lang) => {
    test(`${lang} key format`, () => {
      Object.keys(QuestData[lang as keyof typeof QuestData]).forEach((key) => {
        // gameId should not extra space
        expect(key.trim()).toEqual(key)
        // gameId should be number
        expect(String(+key)).toEqual(key)
      })
    })
  })
})
