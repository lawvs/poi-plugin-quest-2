import type { Story, Meta } from '@storybook/react'
import { Settings } from '../Settings'

export default {
  title: 'Settings',
  component: Settings,
  argTypes: {},
} as Meta

const Template: Story = () => <Settings />

export const Main = Template.bind({})
