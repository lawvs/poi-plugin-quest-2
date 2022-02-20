/* eslint-disable no-console */
import { existsSync, readFileSync, writeFileSync } from 'fs'
import pangu from 'pangu'
import path from 'path'
import { fetch } from './proxyFetch'
import { prepareDir } from './utils'

// See https://github.com/kcwikizh/kcQuests

const OUTPUT_PATH = path.resolve('build', 'kcQuestsData')
const DATA_FILE_NAME = 'quests-scn.json'
const DATA_URL = `https://kcwikizh.github.io/kcQuests/${DATA_FILE_NAME}`
const NEW_QUEST_FILE_NAME = 'quests-scn-new.json'
const NEW_QUEST_URL = `https://kcwikizh.github.io/kcQuests/${NEW_QUEST_FILE_NAME}`
const VERSION_URL =
  'https://api.github.com/repos/kcwikizh/kcQuests/branches/main'

// maybe need ignore some expired quest
const IGNORE_DATA = [] as const

const getRemoteVersion = async () => {
  const resp = await fetch(VERSION_URL)
  if (!resp.ok) {
    throw new Error(`Fetch Error!\nurl: ${resp.url}\nstatus: ${resp.status}`)
  }
  return (await resp.json()).commit.sha
}

const getLocalVersion = () => {
  const localVersionFile = path.resolve(OUTPUT_PATH, 'DATA_VERSION')
  const version = existsSync(localVersionFile)
    ? readFileSync(localVersionFile).toString()
    : '0'
  return version
}

/**
 * @example
 * ```ts
 * import zh_CN from './quests-scn.json'
 * export default {
 *   'zh-CN': zh_CN,
 * }
 * export const version = '5.1.2.1'
 * ```
 */
const genTS = (version: string) => {
  const importCode = `import zh_CN from './quests-scn.json'`

  const exportCode = [
    'export const KcwikiQuestData = {',
    `  'zh-CN': zh_CN,`,
    '}',
  ].join('\n')

  const versionCode = `export const version = '${version}'`
  return `${importCode}\n\n${exportCode}\n\n${versionCode}\n`
}

const downloadQuestData = async () => {
  const resp = await fetch(DATA_URL)
  if (!resp.ok) {
    console.error(`Fetch Error!\nurl: ${resp.url}\nstatus: ${resp.status}`)
    return
  }
  const text = await resp.text()

  const json = JSON.parse(text) as {
    [gameId: string]: {
      code: string
      name: string
      desc: string
      memo?: string
    }
  }
  for (const gameId in json) {
    const { code, name, desc, memo } = json[gameId]
    json[gameId].code = code.trim()
    json[gameId].name = pangu.spacing(name)
    json[gameId].desc = pangu.spacing(desc)
    if (memo) {
      json[gameId].memo = pangu.spacing(memo)
    }
  }

  IGNORE_DATA.forEach((gameId) => delete json[gameId])
  const data = JSON.stringify(json, undefined, 2)
  writeFileSync(path.resolve(OUTPUT_PATH, DATA_FILE_NAME), data)
}

const downloadNewQuest = async () => {
  const resp = await fetch(NEW_QUEST_URL)
  if (!resp.ok) {
    console.error(`Fetch Error!\nurl: ${resp.url}\nstatus: ${resp.status}`)
    return
  }
  const text = await resp.text()
  const json = Object.keys(JSON.parse(text))
  const data = JSON.stringify(json, undefined, 2)
  writeFileSync(path.resolve(OUTPUT_PATH, NEW_QUEST_FILE_NAME), data)
}

const main = async () => {
  const args = process.argv.slice(2)

  prepareDir(OUTPUT_PATH)
  const remoteVersion = await getRemoteVersion()
  const localVersion = getLocalVersion()
  if (remoteVersion === localVersion) {
    console.log('The local version is up to date. Version:', localVersion)
    if (!args.find((v) => v === '-f' || v === '--force')) {
      return
    }
  } else {
    console.log('New Version Detected. Version:', remoteVersion)
  }

  console.log(`Download kcQuests data...`)
  await Promise.all([downloadQuestData(), downloadNewQuest()])

  const ts = genTS(remoteVersion)
  writeFileSync(`${OUTPUT_PATH}/index.ts`, ts)

  // Finally record the version number
  writeFileSync(`${OUTPUT_PATH}/DATA_VERSION`, remoteVersion)
}

main()

process.on('unhandledRejection', (up) => {
  throw up
})
