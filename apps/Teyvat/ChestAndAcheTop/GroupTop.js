import fs from 'node:fs'
import _ from 'lodash'
import puppeteer from '../../../../../lib/puppeteer/puppeteer.js'
import { getVersionInfo } from '../../../models/getVersion.js'
import gsCfg from '../../../../genshin/model/gsCfg.js'

let cwd = process.cwd().replace(/\\/g, '/')
const TYPE = {
  achieve: {
    html: 'Achieve',
    order: 'achievement_number',
    none: setNone(['achievement_number'])
  },
  chest: {
    html: 'ChestGroup',
    order: 'grade',
    none: setNone(['box', 'total_box', 'luxurious', 'precious', 'exquisite', 'common', 'rank'])
  }
}

export async function GroupTop (e, type) {
  let diff = TYPE[type]
  let typeName = _.startCase(type)
  const data = await JSON.parse(fs.readFileSync(`${process.cwd()}/data/FanSky_Qs/Top/${typeName}Top.json`, 'utf-8'))
  let rankedData = _(data[e.group_id])
    .map((v, k) => ({ qq: k, ...v }))
    .orderBy(diff.order, 'desc')
    .slice(0, 15)
    .value()
  rankedData = rankedData.map((v, i) => ({ ...v, rank: i + 1 }))
  let top3 = rankedData.slice(0, 3)
  const Length = 3 - top3.length
  if (top3.length < 3) {
    for (let i = 0; i < Length; i++) {
      top3.push({
        total_index: 999999,
        nick_name: '虚位以待',
        hide_name: 0,
        title: '虚位以待',
        grade: i / 100,
        uid: 100000000 + i,
        nickname: '虚位以待',
        qq: 10000,
        rank: 0,
        ...diff.none
      })
    }
  }
  let ScreenData = await getScreen(e, top3, rankedData, type)
  let img = await puppeteer.screenshot(`FanSkyGroup${typeName}Top`, ScreenData)
  await e.reply(img)
  return true
}

async function getScreen (e, top3, rankedData, type) {
  const BotInfo = await getVersionInfo()
  let data = {
    version: BotInfo.PluginVersion,
    YunzaiName: BotInfo.BotName,
    YunzaiVersion: BotInfo.BotVersion,
    CssPath: `${process.cwd()}/plugins/FanSky_Qs/resources/ChestAchieveTop/`,
    quality: 100,
    Top3: top3,
    rankedData,
    cwd,
    Resources: `${cwd}/plugins/FanSky_Qs/resources/ChestAchieveTop/`,
    saveId: e.user_id,
    tplFile: `${cwd}/plugins/FanSky_Qs/resources/ChestAchieveTop/${TYPE[type].html}Top.html`
  }
  if (type === 'achieve') data.achievement = gsCfg.getdefSet('role', 'index').achievement
  return data
}

function setNone (arr) {
  return _(arr).map(v => [v, 0]).fromPairs()
}
