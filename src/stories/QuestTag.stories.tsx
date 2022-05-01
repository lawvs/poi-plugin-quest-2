import type { Meta, Story } from '@storybook/react'
import React from 'react'
import styled from 'styled-components'
import { QuestTag } from '../components/QuestTag'

export default {
  title: 'QuestTag',
  component: QuestTag,
  argTypes: {},
} as Meta

const Spacing = styled.div`
  * + * {
    margin-top: 8px;
  }
`

const Template: Story<{ list: Parameters<typeof QuestTag>[0][] }> = (args) => (
  <Spacing>
    {args.list.map((tag) => (
      <QuestTag key={tag.code} {...tag} />
    ))}
  </Spacing>
)

export const Main = Template
Main.args = {
  list: [
    {
      code: 'A1',
    },
    {
      code: 'A2',
    },
    {
      code: 'B1',
    },
    {
      code: 'B2',
    },
    {
      code: 'A0', // Unknown quest
    },
  ],
}
