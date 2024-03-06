import fs from 'fs'
import path from 'path'
import cfg from '../../../lib/config/config.js'
import fetch from 'node-fetch'

let FanSkyGroup = 755794036
let cwd = process.cwd().replace(/\\/g, '/')
let GithubStatic = `${cwd}/plugins/FanSky_Qs/resources/Github/GithubStatic.json`

export class PushUpdates extends plugin {
  constructor () {
    super({
      name: 'Fan仓库状态',
      dsc: '监控github仓库状态及更新',
      event: 'message',
      priority: 1,
      rule: [
        {
          reg: '^#?检测(仓库|github|fan)更新$',
          fnc: 'Monitor'
        }, {
          reg: '^#(fan|Fansky|Fan|fans)(强制)?更新$',
          fnc: 'updateFanSKYPlugin',
          permission: 'master'
        }
      ]
    })
    this.task = {
      name: 'FanSky_Qs仓库更新检测',
      cron: '0 0/4 * * * ? ',
      fnc: () => this.MonitorTask()
    }
  }

  async Monitor () {
    const data = await this.fetchGit()
    if (!data) return

    await this.e.reply(this.makePushMsg(data, true))
    return true
  }

  async MonitorTask () {
    const OpenStatus = JSON.parse(await redis.get('FanSky:FunctionOFF'))
    if (OpenStatus.GitHubPush !== 1) return

    const key = 'FanSky:Github:PushStatus'
    if (await redis.get(key)) return
    else await redis.setEx(key, 60 * 4 - 5, JSON.stringify({ PushStatus: 1 }))

    const dirPath = path.dirname(GithubStatic)
    fs.mkdirSync(dirPath, { recursive: true })
    if (!fs.existsSync(GithubStatic)) fs.writeFileSync(GithubStatic, '{}')

    const GithubStaticJson = JSON.parse(fs.readFileSync(GithubStatic, 'utf8'))
    const data = await this.fetchGit()
    if (!data || GithubStaticJson.sha === data.sha) return
    fs.writeFileSync(GithubStatic, JSON.stringify(data, '', '\t'))

    if (data.commit.message.includes('[不推送]') || !data.commit.message) {
      logger.info(logger.magenta('[FanSky_Qs]>>>检测到[不推送]标签，已跳过本次推送'))
      return
    }

    const acgList = [{
      message: [this.makePushMsg(data)],
      nickname: 'FanSky_Qs更新',
      user_id: Bot.uin
    }]

    let ForMsg = await Bot.makeForwardMsg(acgList)
    try {
      ForMsg.data = ForMsg.data
        .replace(/\n/g, '')
        .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
        .replace(/___+/, '<title color="#777777" size="26">FanSky_Qs插件更新</title>')
    } catch (err) { }

    let MainGroup = Array.from(Bot.getGroupList().keys()).includes(FanSkyGroup)
    if (MainGroup) await Bot.pickGroup(FanSkyGroup).sendMsg(ForMsg)

    // 推送策略：只推一个人,从第一个人开始，但是如果第一个人的QQ号长度大于11，说明是频道号，那就推第二个人，以此类推，当成功推送一次后，就不再推送
    for (const qq of cfg.masterQQ) {
      if (String(qq).length > 11) continue
      logger.info(logger.magenta(`Master:${qq}`))
      try {
        // 推送消息给当前主人
        await Bot.pickFriend(Number(qq)).sendMsg(ForMsg)
        break // 推送成功后跳出循环
      } catch (error) {
        logger.info(`QQ号${qq}推送失败，已往下走~`)
      }
    }
    return true
  }

  async updateFanSKYPlugin () {
    this.e.msg = this.e.msg.includes('强制') ? '#强制更新FanSky_Qs' : '#更新FanSky_Qs'
    return false
  }

  async fetchGit () {
    const res = await fetch('https://api.github.com/repos/AFanSKyQs/FanSky_Qs/commits')
    return res.ok ? await res.json()[0] : false
  }

  makePushMsg (data, manual = false) {
    logger.info(logger.magenta(`>>>${manual ? '手动检测FanSky_Qs仓库最新代码' : '已更新GithubStatic.json'}`))
    const UTC_Date = data.commit.committer.date
    const cnTime = new Date(UTC_Date).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })
    return [
      `[FanSky_Qs${manual ? '最近更新' : '插件更新自动推送'}]`,
      `Contributors：${data.commit.committer.name}`,
      `Date:${cnTime}`,
      `Message:${data.commit.message}`,
      `Url:${data.html_url}`
    ].join('\n')
  }
}
