// @ts-check
import { createI18nDecorator } from './addons/poi/i18n'
import { i18nResources } from '../i18n'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
}

export const decorators = [
  createI18nDecorator({
    options: {
      debug: true,
      resources: i18nResources,
    },
  }),
]
