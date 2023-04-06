/* eslint-disable camelcase */
import plugin from '../../../lib/plugins/plugin.js'
import fs from 'fs'
import path from 'path'
import cfg from '../../../lib/config/config.js'
import common from '../../../lib/common/common.js'
import axios from "axios";

let cwd = process.cwd().replace(/\\/g, "/")
let GithubStatic = `${cwd}/plugins/FanSky_Qs/resources/Github/GithubStatic.json`
let BotNumStatic = `${cwd}/plugins/FanSky_Qs/resources/Github/GithubBotNumStatic.json`

export class MonitorTask extends plugin {
    constructor() {
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
            name: 'FanSky_Qs仓库更新检测',
            cron: '0 0/4 * * * ? ',
            fnc: () => {
                this.MonitorTask()
            }
        }
    }

    async MonitorTask() {
        const dirPath = path.dirname(BotNumStatic);
        fs.mkdirSync(dirPath, {recursive: true});
        if (!fs.existsSync(BotNumStatic)) fs.writeFileSync(BotNumStatic, '{}');
        if (!fs.existsSync(GithubStatic)) fs.writeFileSync(GithubStatic, '{}');
        let BotNumStaticJson = JSON.parse(fs.readFileSync(BotNumStatic))
        let TimeTmp = new Date().getTime()
        if (!BotNumStaticJson["TimeTmp"]) {
            BotNumStaticJson["TimeTmp"] = TimeTmp
            fs.writeFileSync(BotNumStatic, JSON.stringify(BotNumStaticJson));
        } else if (TimeTmp - BotNumStaticJson["TimeTmp"] > 180000) {
            BotNumStaticJson["TimeTmp"] = TimeTmp
            fs.writeFileSync(BotNumStatic, JSON.stringify(BotNumStaticJson));
        } else {
            return true
        }
        if (Bot.uin !== 2374221304) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        let GithubStaticJson = JSON.parse(fs.readFileSync(GithubStatic))
        try {
            const res = await axios.get('https://api.github.com/repos/AFanSKyQs/FanSky_Qs/commits')
            const data = res.data
            if (!data[0]) return
            let Json = data[0]
            if (GithubStaticJson.sha !== Json.sha) {
                let Str = atob("MTU2NTI0NTc5Ng==")
                GithubStaticJson = Json
                fs.writeFileSync(GithubStatic, JSON.stringify(GithubStaticJson))
                logger.info(logger.magenta('>>>已更新GithubStatic.json'))
                let UTC_Date = Json.commit.committer.date
                const cnTime = new Date(UTC_Date).toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai', hour12: false})
                if (Bot.uin === 2374221304) {
                    await Bot.pickGroup(Number(755794036)).sendMsg(`[FanSky_Qs插件更新自动推送]\nContributors：${Json.commit.committer.name}\nDate:${cnTime}\nMessage:${Json.commit.message}\nUrl:${Json.html_url}`)
                }
                let list = cfg.masterQQ
                let SendNum = 0
                for (let userId of list) {
                    if ((userId === Number(Str)) || (userId === Str)) {
                        return true
                    }
                }
                if (Json.commit.message.includes("[不推送]") || !Json.commit.message) {
                    logger.info(logger.magenta('[FanSky_Qs]>>>检测到[不推送]标签，已跳过本次推送'))
                    return true
                }
                for (let userId of list) {
                    if (SendNum >= 2) {
                        break;
                    }
                    if (userId.length > 11) continue
                    await Bot.pickFriend(userId).sendMsg(`[FanSky_Qs插件更新]:\nContributors：${Json.commit.committer.name}\nDate:${cnTime}\nMessage:${Json.commit.message}\nUrl:${Json.html_url}`)
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    await common.sleep(3000)
                    SendNum++
                }
            }
        } catch (error) {
            return true
        }
        // fetch('https://api.github.com/repos/AFanSKyQs/FanSky_Qs/commits').then(res => res.json()).then(async res => {
        //   if (!res[0]) return
        //   let Json = res[0]
        //   // 将res[0]存入GithubStatic.json
        //   if (GithubStaticJson.sha !== Json.sha) {
        //     GithubStaticJson = Json
        //     fs.writeFileSync(GithubStatic, JSON.stringify(GithubStaticJson))
        //     console.log('已更新GithubStatic.json')
        //     let UTC_Date = Json.commit.committer.date
        //     const cnTime = new Date(UTC_Date).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })
        //     if (Bot.uin === 2374221304) {
        //       await Bot.pickGroup(Number(755794036)).sendMsg(`[FanSky_Qs插件更新自动推送]\nContributors：${Json.commit.committer.name}\nDate:${cnTime}\nMessage:${Json.commit.message}\nUrl:${Json.html_url}`)
        //     }
        //     let list = cfg.masterQQ
        //     for (let userId of list) {
        //       await Bot.pickFriend(userId).sendMsg(`FanSky_Qs插件已更新:\nContributors：${Json.commit.committer.name}\nDate:${cnTime}\nMessage:${Json.commit.message}\nUrl:${Json.html_url}`)
        //       await common.sleep(3000)
        //     }
        //   }
        // })
        return true
    }
}
