import { kcanotifyGameData, version } from '../../build/kcanotifyGamedata'

test('should Kcanotify Game data version correct', () => {
  expect(version).toMatchInlineSnapshot(`"2025020401"`)
})

describe('should format correct', () => {
  kcanotifyGameData.forEach((data) => {
    test(`${data.key} key format`, () => {
      Object.keys(data.res).forEach((key) => {
        // gameId should not extra space
        expect(key.trim()).toEqual(key)
        // gameId should be number
        expect(String(+key)).toEqual(key)
      })
    })
  })
})
