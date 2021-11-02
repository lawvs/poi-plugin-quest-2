/* eslint-disable no-console */
import path from 'path'
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs'
import pangu from 'pangu'
import { fetch } from './proxyFetch'

// See https://github.com/kcwikizh/kcQuests

const OUTPUT_PATH = path.resolve('build', 'kcQuestsData')
const FILE_NAME = 'quests-scn.json'
const URL = `https://kcwikizh.github.io/kcQuests/${FILE_NAME}`
const VERSION_URL =
  'https://api.github.com/repos/kcwikizh/kcQuests/branches/main'

const prepare = () => {
  if (!existsSync(OUTPUT_PATH)) {
    mkdirSync(OUTPUT_PATH, { recursive: true })
  }
}

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

const main = async () => {
  const args = process.argv.slice(2)

  prepare()
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
  const resp = await fetch(URL)
  if (!resp.ok) {
    console.error(`Fetch Error!\nurl: ${resp.url}\nstatus: ${resp.status}`)
    return
  }
  let text = await resp.text()
  text = text.trim()

  const json = JSON.parse(text) as {
    [gameId: string]: { code: string; name: string; desc: string }
  }
  for (const gameId in json) {
    const { name, desc } = json[gameId]
    json[gameId].name = pangu.spacing(name)
    json[gameId].desc = pangu.spacing(desc)
  }

  const data = JSON.stringify(json, undefined, 2)
  writeFileSync(`${OUTPUT_PATH}/${FILE_NAME}`, data)

  const ts = genTS(remoteVersion)
  writeFileSync(`${OUTPUT_PATH}/index.ts`, ts)

  // Finally record the version number
  writeFileSync(`${OUTPUT_PATH}/DATA_VERSION`, remoteVersion)
}

main()

process.on('unhandledRejection', (up) => {
  throw up
})
