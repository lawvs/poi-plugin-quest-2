import { KcwikiQuestData } from '../../build/kcQuestsData'
import { useStore } from '.'

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
): lang is keyof typeof KcwikiQuestData => lang in KcwikiQuestData

export const useKcwikiData = (lang: string) => {
  const [preferKcwiki] = usePreferKcwiki()
  const supported = checkIsKcwikiSupportedLanguages(lang)

  if (!preferKcwiki) {
    return null
  }
  if (!supported) {
    return null
  }
  return KcwikiQuestData[lang]
}
