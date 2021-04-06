import { version } from '../../build/kcanotifyGamedata'

test('should Kcanotify Game data version correct', () => {
  expect(version).toMatchInlineSnapshot(`"5.1.5.3"`)
})
