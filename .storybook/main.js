// @ts-check

export default {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    /**
     * See https://github.com/momocow/poi-plugin-tabex/blob/master/.storybook/addons/story-addon-poooi/preset.js
     * Credit to @momocow
     */
    './addons/poi/preset',
  ],
}
