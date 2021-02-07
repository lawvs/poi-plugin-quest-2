// @ts-check
import { createI18nDecorator } from './addons/poi/i18n'
import { i18nResources } from '../i18n'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  options: {
    showPanel: false,
    theme: {
      brandUrl: 'https://github.com/poooi/poi',
      brandImage:
        'https://raw.githubusercontent.com/poooi/poi/master/assets/img/logo.png',
    },
  },
}

export const decorators = [
  createI18nDecorator({
    options: {
      debug: true,
      resources: i18nResources,
    },
  }),
]
