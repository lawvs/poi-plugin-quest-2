// @ts-check

module.exports.config = (entry = []) => {
  return [...entry, require.resolve('./preview')]
}
