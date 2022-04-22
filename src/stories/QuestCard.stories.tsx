import type { Meta, Story } from '@storybook/react'
import React from 'react'
import styled from 'styled-components'
import { QuestCard } from '../components/QuestCard'
import { MinimalQuestCard } from '../components/QuestCard/MinimalQuestCard'
import { QUEST_STATUS } from '../questHelper'

export default {
  title: 'QuestCard',
  component: QuestCard,
  argTypes: {},
} as Meta

const Spacing = styled.div`
  * + * {
    margin-top: 8px;
  }
`

const Template: Story<Parameters<typeof QuestCard>[0]> = (args) => (
  <Spacing>
    <MinimalQuestCard {...args} />
    <QuestCard {...args} />
  </Spacing>
)

export const Composition = Template
Composition.args = {
  gameId: 101,
  code: 'A1',
  name: 'はじめての「編成」！',
  desc: '2隻以上の艦で編成される「艦隊」を編成せよ！',
}

export const Sortie = Template.bind({})
Sortie.args = {
  code: 'B1',
  name: 'はじめての「出撃」！',
  desc: '艦隊を出撃させ、敵艦隊と交戦せよ！',
  status: QUEST_STATUS.LOCKED,
}

export const Other = Template.bind({})
Other.args = {
  code: 'WF01',
  name: '式の準備！(その壱)',
  desc: '式の準備をします！「工廠」で装備アイテムを2回「廃棄」して身の回りの整理を！',
  status: QUEST_STATUS.IN_PROGRESS,
}

export const OverflowTest = Template.bind({})
OverflowTest.args = {
  code: 'A0',
  name: 'はじめての「編成」！はじめての「編成」！はじめての「編成」！はじめての「編成」！',
  desc: 'TBF を秘書艦一番スロットに搭載、「13 号対空電探」x2「22 号対水上電探」x2 廃棄、開発資材 x40、改修資材 x10、弾薬 5,000、ボーキサイト 8,000、「新型航空兵装資材」x1、「熟練搭乗員」を用意せよ！',
  status: QUEST_STATUS.COMPLETED,
}

export const ComplexCard = Template.bind({})
ComplexCard.args = {
  gameId: 290,
  code: 'B128',
  desc: '「比叡」在南方海域的出击任务：使用旗舰为高速战舰「比叡」的强有力舰队，出击南方海域萨部岛近海海域与沙门海域。与该作战海域的敌方舰队交战，消灭她们！',
  tip: '奖励:“比叡” 挂轴以下奖励三选一：战斗详报 ×196 式 150cm 探照灯 ×1 勋章 ×1',
  tip2: '非限时任务使用以比叡作为旗舰的舰队取得以下海域 S 胜：5-3、5-4 背景相关：比叡于 1942 年 11 月 13 日沉没于所罗门海域，2019 年 2 月 6 日舰体被发现。',
  name: '「比叡」的出击',
}

export const PreQuestCard = Template.bind({})
PreQuestCard.args = {
  gameId: 202,
  code: 'B1',
  name: 'はじめての「出撃」！',
  desc: '艦隊を出撃させ、敵艦隊と交戦せよ！',
}
