import { create } from '@storybook/theming'
import { addons } from '@storybook/addons'

addons.setConfig({
  theme: create({
    base: 'light',
    brandUrl: 'https://github.com/poooi/poi',
    brandImage:
      'https://raw.githubusercontent.com/poooi/poi/master/assets/img/logo.png',
  }),
})
