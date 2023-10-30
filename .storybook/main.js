// @ts-check

module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],

  addons: [
    {
      name: '@storybook/addon-essentials',
      options:
        process.env.NODE_ENV !== 'development'
          ? {
              measure: false,
              outline: false,
              docs: false,
            }
          : undefined,
    },
    '@storybook/addon-links',
    /**
     * See https://github.com/momocow/poi-plugin-tabex/blob/master/.storybook/addons/story-addon-poooi/preset.js
     * Credit to @momocow
     */
    './addons/poi/preset',
  ],

  framework: {
    name: '@storybook/react-webpack5',
    options: {}
  }
}
