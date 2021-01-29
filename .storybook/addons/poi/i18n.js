// @ts-check
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// See react-i18next
// https://react.i18next.com/getting-started

const resources = {
  'en-US': {
    translation: {},
  },
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'en-US',

  keySeparator: false,

  interpolation: {
    escapeValue: false,
  },
})

export default i18n
