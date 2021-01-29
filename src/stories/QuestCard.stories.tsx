import type { Story, Meta } from '@storybook/react'

import { QuestCard } from '../components/QuestCard'

export default {
  title: 'QuestCard',
  component: QuestCard,
  argTypes: {},
} as Meta

const Template: Story<Parameters<typeof QuestCard>[0]> = (args) => (
  <QuestCard {...args} />
)

export const Composition = Template
Composition.args = {
  code: 'A1',
  name: 'はじめての「編成」！',
  desc: '2隻以上の艦で編成される「艦隊」を編成せよ！',
}

export const Sortie = Template.bind({})
Sortie.args = {
  code: 'B1',
  name: 'はじめての「出撃」！',
  desc: '艦隊を出撃させ、敵艦隊と交戦せよ！',
}

export const Other = Template.bind({})
Other.args = {
  code: 'WF01',
  name: '式の準備！(その壱)',
  desc:
    '式の準備をします！「工廠」で装備アイテムを2回「廃棄」して身の回りの整理を！',
}
