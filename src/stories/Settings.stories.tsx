import type { Meta, Story } from '@storybook/react'
import React from 'react'
import { Settings } from '../Settings'

export default {
  title: 'Settings',
  component: Settings,
  argTypes: {},
} as Meta

const Template: Story = () => <Settings />

export const Main = Template.bind({})
