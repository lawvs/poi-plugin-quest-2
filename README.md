# plugin-quest-2

![build](https://github.com/lawvs/poi-plugin-quest-2/workflows/Build/badge.svg)
[![npm](https://img.shields.io/npm/v/poi-plugin-quest-info-2)](https://www.npmjs.com/package/poi-plugin-quest-info-2)

A [poi](https://github.com/poooi/poi) plugin that helps you view quest info. Data maintained by [kcanotify-gamedata](https://github.com/antest1/kcanotify-gamedata) & [kc3-translations](https://github.com/KC3Kai/kc3-translations) & [kcQuests](https://github.com/kcwikizh/kcQuests).

![image](https://user-images.githubusercontent.com/18554747/143771661-00965277-5c45-454d-b4f0-57083ec3065d.png)

## Installation

![image](https://user-images.githubusercontent.com/18554747/161830757-0a4e500c-f246-4dbd-820d-0b9a9c5a34a4.png)

## Features

- Translated quest info.(English/Simplified Chinese/Traditional Chinese/Korean)
- Task panel translation.
- Quest search and filter.
- Sync with game quest data.
- Auto switch to quest tab when enter quest views.

## Development

```sh
# Install dependencies
npm install

# Download game data from github and convert assets to base64
# try set `http_proxy` or `https_proxy` as environment when download fail
npm run build

# Run the plugin in web environment
npm run storybook
```

## Thanks

- [poi](https://github.com/poooi/poi)
- [plugin-quest](https://github.com/poooi/plugin-quest)
- [kcanotify-gamedata](https://github.com/antest1/kcanotify-gamedata)
- [kcQuests](https://github.com/kcwikizh/kcQuests)
- [舰娘百科](https://zh.kcwiki.cn/wiki/%E8%88%B0%E5%A8%98%E7%99%BE%E7%A7%91)
- [poi-plugin-tabex](https://github.com/momocow/poi-plugin-tabex)

## License

MIT
