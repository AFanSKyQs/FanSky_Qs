import puppeteer from '../../../../lib/puppeteer/puppeteer.js'
import Help from '../models/ReturnHelpData.js'

export class FanSkyHelp extends plugin {
  constructor () {
    super({
      name: 'FanSky_Qs插件帮助',
      dsc: 'FanSky_Qs插件帮助',
      event: 'message',
      priority: 3141,
      rule: [
        {
          reg: '^#?(fan|Fansky|Fan|fans)(.*)?(帮助|菜单|help|功能)$',
          fnc: 'MainFanSkyHelp'
        }
      ]
    })
  }

  async MainFanSkyHelp () {
    const screenData = await new Help(this.e).screenData()
    let img = await puppeteer.screenshot('FanSkyHelp', screenData)
    await this.e.reply(img)
    return true
  }
}
