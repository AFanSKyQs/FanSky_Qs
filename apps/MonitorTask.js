/* eslint-disable camelcase */
import plugin from '../../../lib/plugins/plugin.js'
import fs from 'fs'
import cfg from '../../../lib/config/config.js'
import common from '../../../lib/common/common.js'
let GithubFolder = `${process.cwd()}/plugins/FanSky_Qs/resources/Github`
let GithubStatic = `${process.cwd()}/plugins/FanSky_Qs/resources/Github/GithubStatic.json`
export class MonitorTask extends plugin {
  constructor () {
    super({
      name: '监控github仓库状态',
      dsc: '监控github仓库状态',
      event: 'message',
      priority: 8,
      rule: [
        {
          reg: /^#?检测(仓库|github|fan)更新$/,
          fnc: 'MonitorTask'
        }
      ]
    })
    this.task = {
      /** 任务名称 */
      name: '清除打卡状态',
      cron: '0 0/2 * * * ? ',
      fnc: () => {
        this.MonitorTask()
      }
    }
  }

  async MonitorTask () {
    if (!fs.existsSync(GithubFolder)) {
      console.log('已创建Github文件夹')
      fs.mkdirSync(GithubFolder)
    }
    if (!fs.existsSync(GithubStatic)) {
      fs.writeFileSync(GithubStatic, '{}')
      console.log('已创建GithubStatic.json文件')
    }
    let GithubStaticJson = JSON.parse(fs.readFileSync(GithubStatic))
    fetch('https://api.github.com/repos/AFanSKyQs/FanSky_Qs/commits').then(res => res.json()).then(async res => {
      if (!res[0]) return
      let Json = res[0]
      // 将res[0]存入GithubStatic.json
      if (GithubStaticJson.sha !== Json.sha) {
        GithubStaticJson = Json
        fs.writeFileSync(GithubStatic, JSON.stringify(GithubStaticJson))
        console.log('已更新GithubStatic.json')
        let UTC_Date = Json.commit.committer.date
        const cnTime = new Date(UTC_Date).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })
        if (Bot.uin === 2374221304) {
          await Bot.pickGroup(Number(755794036)).sendMsg(`[FanSky_Qs插件更新自动推送]\nContributors：${Json.commit.committer.name}\nDate:${cnTime}\nMessage:${Json.commit.message}\nUrl:${Json.html_url}`)
        }
        let list = cfg.masterQQ
        for (let userId of list) {
          await Bot.pickFriend(userId).sendMsg(`FanSky_Qs插件已更新:\nContributors：${Json.commit.committer.name}\nDate:${cnTime}\nMessage:${Json.commit.message}\nUrl:${Json.html_url}`)
          await common.sleep(3000)
        }
      }
    })
    return true
  }
}
