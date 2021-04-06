import type { Story, Meta } from '@storybook/react'

import { QuestCard } from '../components/QuestCard'
import { QUEST_STATUS } from '../questHelper'

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
  status: QUEST_STATUS.Locked,
}

export const Other = Template.bind({})
Other.args = {
  code: 'WF01',
  name: '式の準備！(その壱)',
  desc:
    '式の準備をします！「工廠」で装備アイテムを2回「廃棄」して身の回りの整理を！',
  status: QUEST_STATUS.InProgress,
}

export const OverflowTest = Template.bind({})
OverflowTest.args = {
  code: 'A0',
  name:
    'はじめての「編成」！はじめての「編成」！はじめての「編成」！はじめての「編成」！',
  desc:
    'TBF を秘書艦一番スロットに搭載、「13 号対空電探」x2「22 号対水上電探」x2 廃棄、開発資材 x40、改修資材 x10、弾薬 5,000、ボーキサイト 8,000、「新型航空兵装資材」x1、「熟練搭乗員」を用意せよ！',
  status: QUEST_STATUS.Completed,
}
