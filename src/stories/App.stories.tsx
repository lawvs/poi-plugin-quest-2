import type { Story, Meta } from '@storybook/react'
import { App } from '../App'

export default {
  title: 'App',
  component: App,
  argTypes: {},
} as Meta

const Template: Story = () => <App />

export const Primary = Template.bind({})
