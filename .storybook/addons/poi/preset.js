// @ts-check

export const config = (entry = []) => {
  return [...entry, require.resolve('./preview')]
}
