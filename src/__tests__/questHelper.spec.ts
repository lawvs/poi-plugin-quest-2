import {
  getCompletedQuest,
  getLockedQuest,
  getPostQuestIds,
  getPreQuestIds,
} from '../questHelper'

describe('questHelper', () => {
  test('should getPreQuestIds correct', () => {
    expect(getPreQuestIds(101)).toEqual([])
    expect(getPreQuestIds(102)).toEqual([101])
    expect(getPreQuestIds(236)).toEqual([235, 273])
  })

  test('should getPostQuestIds correct', () => {
    expect(getPostQuestIds(101)).toEqual([102])
    expect(getPostQuestIds(105)).toEqual([106, 108, 254, 401, 612, 816])
    expect(getPostQuestIds(140)).toEqual([])
  })

  test('should 101 no completed quest', () => {
    expect(getCompletedQuest([101])).toEqual({})
  })

  test('should getCompletedQuest quest match snapshot', () => {
    expect(getCompletedQuest([817])).toMatchSnapshot()
  })

  test('should 236 getCompletedQuest correct', () => {
    expect(getCompletedQuest([236])).toMatchSnapshot()
  })

  test('should 101 locked quests match snapshot', () => {
    expect(getLockedQuest([101])).toMatchSnapshot()
  })

  test('should 196 getLockedQuest correct', () => {
    expect(getLockedQuest([196])).toMatchSnapshot()
  })
})
