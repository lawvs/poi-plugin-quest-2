import { version, QuestData } from '../../build/kcanotifyGamedata'

test('should Kcanotify Game data version correct', () => {
  expect(version).toMatchInlineSnapshot(`"5.3.3.1"`)
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
