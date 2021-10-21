import { KcwikiQuestData } from '../../build/kcQuestsData'
import { useStore } from '.'

const usePreferKcwiki = () => {
  const {
    store: { preferKcwikiData },
  } = useStore()
  return preferKcwikiData
}

const useIsKcwikiSupportedLanguages = (
  lang: string
): lang is keyof typeof KcwikiQuestData => lang in KcwikiQuestData

export const useKcwikiData = (lang: string) => {
  const preferKcwiki = usePreferKcwiki()
  const supported = useIsKcwikiSupportedLanguages(lang)

  if (!preferKcwiki) {
    return null
  }
  if (!supported) {
    return null
  }
  return KcwikiQuestData[lang]
}
