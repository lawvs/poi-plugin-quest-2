const { withPoiTheme, POI_THEMES } = require('./themes')

let MINIMAL_VIEWPORTS
try {
  MINIMAL_VIEWPORTS = require('@storybook/addon-viewport').MINIMAL_VIEWPORTS
} catch (e) {
  MINIMAL_VIEWPORTS = {}
}

module.exports.parameters = {
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

module.exports.decorators = [withPoiTheme()]
