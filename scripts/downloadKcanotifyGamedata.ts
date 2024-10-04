/* eslint-disable no-console */
import { existsSync, readFileSync, writeFileSync } from 'fs'
import pangu from 'pangu'
import path from 'path'
import { fetch } from './proxyFetch'
import { prepareDir } from './utils'

// See https://github.com/antest1/kcanotify-gamedata

const OUTPUT_PATH = path.resolve('build', 'kcanotifyGamedata')
const URL_PREFIX =
  'https://raw.githubusercontent.com/antest1/kcanotify-gamedata/master'
const VERSION_URL = `${URL_PREFIX}/KCAINFO`
const DATA_URL = `${URL_PREFIX}/files`
const LANGS = ['scn', 'tcn', 'jp', 'en', 'ko'] as const
const LOCALES = ['zh-CN', 'zh-TW', 'ja-JP', 'en-US', 'ko-KR'] as const

const getRemoteVersion = async () => {
  const resp = await fetch(VERSION_URL)
  if (!resp.ok) {
    throw new Error(`Fetch Error!\nurl: ${resp.url}\nstatus: ${resp.status}`)
  }
  const KCAINFO: {
    version: string
    data_version: string
    kcadata_version: number
    kc_maintenance: string[]
  } = (await resp.json()) as any

  return String(KCAINFO.kcadata_version)
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
  const importCode = LOCALES.map(
    (locale, idx) =>
      `import ${locale.replace('-', '_')} from './quests-${LANGS[idx]}.json'`,
  ).join('\n')

  const exportCode =
    'export const QuestData = {\n' +
    LOCALES.map((locale) => `  '${locale}': ${locale.replace('-', '_')},`).join(
      '\n',
    ) +
    '\n}'

  const versionCode = `export const version = '${version}'`
  return `${importCode}\n\n${exportCode}\n\n${versionCode}\n`
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

  await Promise.all(
    LANGS.map(async (lang) => {
      const filename = `quests-${lang}.json`
      const fileURL = `${DATA_URL}/${filename}`

      console.log(`Download ${filename}...`)
      const resp = await fetch(fileURL)
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
          rewards?: string
        }
      }

      for (const gameId in json) {
        const { name, desc, rewards } = json[gameId]
        json[gameId].name = pangu.spacing(name)
        json[gameId].desc = pangu.spacing(desc)
        if (rewards) {
          json[gameId].rewards = pangu.spacing(rewards)
        }
      }

      const data = JSON.stringify(json, undefined, 2)
      writeFileSync(`${OUTPUT_PATH}/${filename}`, data)
    }),
  )

  const ts = genTS(remoteVersion)
  writeFileSync(`${OUTPUT_PATH}/index.ts`, ts)

  // Finally record the version number
  writeFileSync(`${OUTPUT_PATH}/DATA_VERSION`, remoteVersion)
}

main()

process.on('unhandledRejection', (up) => {
  throw up
})
