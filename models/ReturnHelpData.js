import { getHelpBg } from './getTuImg.js'
import { getVersionInfo } from './getVersion.js'
import _ from 'lodash'
import YAML from 'yaml'
import fs from 'node:fs'
import fanBase from './fanBase.js'

let cwd = process.cwd().replace(/\\/g, '/')

export default class help extends fanBase {
  constructor (e) {
    super(e)
    this.model = 'help'
  }

  async screenData () {
    let BotInfo = await getVersionInfo()
    let msg = this.e.msg.replace(/Fansky|Fan|fans/, 'fan')
    msg = /^#?fan(.*)?(帮助|help|功能|菜单)$/.exec(msg)[1]

    const helpData = await this.getHelper(msg)

    let headImg = _.sample(['艾尔海森', '八重神子', '迪希雅', '甘雨', '柯莱', '可莉', '流浪者', '纳西妲', '妮露', '赛诺', '提纳里', '夜兰'])
    let acgBg = await getHelpBg()

    return {
      version: BotInfo.PluginVersion,
      YunzaiName: BotInfo.BotName,
      YunzaiVersion: BotInfo.BotVersion,
      acgBg,
      helpData,
      saveId: this.e.user_id,
      cwd,
      tplFile: `${this.plugPath}resources/help/help.html`,
      /** 绝对路径 */
      pluResPath: `${this.plugPath}resources/help/`,
      headStyle: `<style> .head_box { background: url(${this.plugPath}resources/help/img/titleImg/${headImg}.png) #fbe1c0; background-position-x: 42px; background-repeat: no-repeat; background-size: auto 101%; }</style>`
    }
  }

  async getHelper (msg) {
    msg = ['对话', '聊天', 'OpenAI', 'chatgpt'].includes(msg) ? 'OpenAI' : 'Main'
    const helper = YAML.parse(fs.readFileSync(`${this.plugPath}config/default/Help/${msg}.yaml`, 'utf8'))

    let helpData = []
    if (msg === 'Main') {
      const OpenStatus = JSON.parse(await redis.get('FanSky:FunctionOFF'))
      _.each(helper.user, (v, k) => {
        if (OpenStatus[k]) helpData.push(v)
      })
    } else helpData.push(helper.user)

    if (this.e.isMaster) helpData.push(helper.master)

    return helpData
  }
}
