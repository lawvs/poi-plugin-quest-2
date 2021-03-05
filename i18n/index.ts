import { name as PACKAGE_NAME } from '../package.json'
import zh_CN from './zh-CN.json'
import zh_TW from './zh-TW.json'
import ja_JP from './ja-JP.json'
import en_US from './en-US.json'
import ko_KR from './ko-KR.json'

export const i18nResources = {
  'zh-CN': { [PACKAGE_NAME]: zh_CN },
  'zh-TW': { [PACKAGE_NAME]: zh_TW },
  'ja-JP': { [PACKAGE_NAME]: ja_JP },
  'en-US': { [PACKAGE_NAME]: en_US },
  'ko-KR': { [PACKAGE_NAME]: ko_KR },
}
