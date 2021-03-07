import React, { StrictMode } from 'react'
import { Text } from '@blueprintjs/core'
import { version as PACKAGE_VERSION } from '../package.json'
import { version as DATA_VERSION } from '../build/kcanotifyGamedata'

export const Settings = () => (
  <StrictMode>
    <Text>Version: {PACKAGE_VERSION}</Text>
    <Text>Data Version: {DATA_VERSION}</Text>
  </StrictMode>
)
