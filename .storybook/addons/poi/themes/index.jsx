const { Card } = require('@blueprintjs/core')
const { makeDecorator } = require('@storybook/addons')
const styled = require('styled-components').default
const { useAddonState } = require('@storybook/client-api')

// See https://github.com/poooi/poi/blob/da75b507e8f67615a39dc4fdb466e34ff5b5bdcf/views/env-parts/theme.es
// See https://github.com/poooi/poi-asset-themes

require('poi-asset-themes/dist/blueprint/blueprint-normal.css')
require('./poi-global.css')

const PoiPluginContainer = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`

const PoiPluginCard = styled(Card)`
  padding: 4px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
`

const POI_THEMES = {
  'Poi dark': {
    background: 'rgb(47, 52, 60)',
    container: ({ children }) => (
      <PoiPluginContainer className="bp4-dark">
        <PoiPluginCard>{children}</PoiPluginCard>
      </PoiPluginContainer>
    ),
  },
}

const withPoiTheme = makeDecorator({
  name: 'withPoiTheme',
  parameterName: 'poooi',
  wrapper: (Story, context) => {
    const [state] = useAddonState('backgrounds', { name: 'Poi dark' })
    const PoiContainer = POI_THEMES[state.name].container
    return <PoiContainer>{Story(context)}</PoiContainer>
  },
})

module.exports = {
  POI_THEMES,
  withPoiTheme,
}
