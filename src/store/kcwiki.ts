import { useStore } from '.'
import { getKcwikiQuestData } from '../questHelper'

export const usePreferKcwiki = () => {
  const {
    store: { preferKcwikiData },
    updateStore,
  } = useStore()
  const setPreferKcwikiData = (val: boolean) =>
    updateStore({ preferKcwikiData: val })
  return [preferKcwikiData, setPreferKcwikiData] as const
}

export const checkIsKcwikiSupportedLanguages = (
  lang: string
): lang is keyof typeof kcwikiQuestData => {
  const kcwikiQuestData = getKcwikiQuestData()
  return lang in kcwikiQuestData
}

export const useKcwikiData = (lang: string) => {
  const [preferKcwiki] = usePreferKcwiki()
  const supported = checkIsKcwikiSupportedLanguages(lang)

  if (!preferKcwiki) {
    return null
  }
  if (!supported) {
    return null
  }
  const kcwikiQuestData = getKcwikiQuestData()
  return kcwikiQuestData[lang]
}
