// @ts-check
import { withPoiTheme, POI_THEMES } from './themes'

let MINIMAL_VIEWPORTS
try {
  MINIMAL_VIEWPORTS = require('@storybook/addon-viewport').MINIMAL_VIEWPORTS
} catch (e) {
  MINIMAL_VIEWPORTS = {}
}

export const parameters = {
  viewport: {
    defaultViewport: 'poiFullHDCanvas100%',
    viewports: {
      ...MINIMAL_VIEWPORTS,
      'poiFullHDCanvas100%': {
        name: 'Poi Full HD, Canvas 100% ',
        styles: {
          width: '700px', // 1920 - 1200
          height: '100%',
        },
      },
    },
  },
  backgrounds: {
    default: 'Poi dark',
    values: Object.entries(POI_THEMES).map(([name, theme]) => ({
      name,
      value: theme.background,
    })),
  },
}

export const globalTypes = {
  locale: {
    name: 'Locale',
    description: 'Internationalization locale',
    defaultValue: 'en-US',
    toolbar: {
      icon: 'globe',
      items: [
        { value: 'zh-CN', right: '🇨🇳', title: '简体中文' },
        { value: 'zh-TW', right: '🇹🇼', title: '正體中文' },
        { value: 'ja-JP', right: '🇯🇵', title: '日本語' },
        { value: 'en-US', right: '🇺🇸', title: 'English' },
        { value: 'ko-KR', right: '🇰🇷', title: '한국어' },
      ],
    },
  },
}

export const decorators = [withPoiTheme()]
