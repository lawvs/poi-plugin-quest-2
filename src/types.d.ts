export type KcanotifyQuest = {
  code: string
  name: string
  desc: string
  memo?: string
  unlock?: number[]
  tracking?: number[][]
}

export type KcanotifyQuestWithGameId = KcanotifyQuest & { gameId: string }
