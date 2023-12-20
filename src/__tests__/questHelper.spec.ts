import {
  calcQuestMap,
  getCompletedQuest,
  getLockedQuest,
  getPostQuestIds,
  getPreQuestIds,
  getQuestCodeByGameId,
} from '../questHelper'

describe('questHelper', () => {
  test('should getQuestCodeByGameId correct', () => {
    expect(getQuestCodeByGameId(0)).toEqual(null)
    expect(getQuestCodeByGameId(101)).toEqual('A1')
  })

  test('should getPreQuestIds correct', () => {
    expect(getPreQuestIds(101)).toEqual([])
    expect(getPreQuestIds(102)).toEqual([101])
    expect(getPreQuestIds(236)).toEqual([235, 273])
  })

  test('should getPostQuestIds correct', () => {
    expect(getPostQuestIds(101)).toEqual([102])
    expect(getPostQuestIds(105)).toEqual([106, 108, 174, 254, 401, 612])
    expect(getPostQuestIds(140)).toEqual([])
  })

  test('should 101 no completed quest', () => {
    expect(getCompletedQuest([101])).toEqual({})
  })

  test('should getCompletedQuest quest match snapshot', () => {
    expect(calcQuestMap([817], getPreQuestIds)).toMatchSnapshot()
  })

  test('should 236 getCompletedQuest correct', () => {
    expect(calcQuestMap([236], getPreQuestIds)).toMatchSnapshot()
  })

  test('should 101 locked quests match snapshot', () => {
    expect(getLockedQuest([101])).toMatchSnapshot()
  })

  test('should 196 getLockedQuest correct', () => {
    expect(getLockedQuest([196])).toMatchSnapshot()
  })
})
