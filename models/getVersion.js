import fs from 'fs'

let cwd = process.cwd().replace(/\\/g, '/')
let Package = `${cwd}/plugins/FanSky_Qs/package.json`
let YunzaiPath = `${cwd}/package.json`

export async function getVersionInfo () {
  let PluginInfo = JSON.parse(await fs.readFileSync(Package))
  let BotInfo = JSON.parse(await fs.readFileSync(YunzaiPath))
  BotInfo.name = BotInfo.name.replace(/(\w)/, (v) => v.toUpperCase())
  return {
    BotName: BotInfo.name,
    BotVersion: BotInfo.version,
    PluginVersion: PluginInfo.version
  }
}
