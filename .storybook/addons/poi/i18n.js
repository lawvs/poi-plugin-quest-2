// @ts-check
import i18next from 'i18next'
import { useEffect } from 'react'
import { initReactI18next } from 'react-i18next'

// See react-i18next
// https://react.i18next.com/getting-started

/**
 * @param {import('i18next').InitOptions} options Initial options.
 */
const createI18n = (options = {}) => {
  i18next.use(initReactI18next).init({
    lng: 'en-US',
    keySeparator: false,
    interpolation: {
      escapeValue: false,
    },
    ...options,
  })
  return i18next
}

/**
 * @param {{options: import('i18next').InitOptions}} options Initial options.
 */
export const createI18nDecorator = ({ options } = { options: {} }) => {
  const i18n = createI18n(options)
  const withI18n = (Story, context) => {
    const locale = context.globals.locale
    useEffect(() => {
      i18n.changeLanguage(locale)
    }, [locale])
    return <Story {...context} />
  }
  return withI18n
}
