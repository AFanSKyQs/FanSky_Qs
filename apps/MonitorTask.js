/* eslint-disable camelcase */
import plugin from '../../../lib/plugins/plugin.js'
import fs from 'fs'
import path from 'path'
import cfg from '../../../lib/config/config.js'
import axios from "axios";

let cwd = process.cwd().replace(/\\/g, "/")
let GithubStatic = `${cwd}/plugins/FanSky_Qs/resources/Github/GithubStatic.json`

export class MonitorTask extends plugin {
    constructor() {
        super({
            name: '监控github仓库状态',
            dsc: '监控github仓库状态',
            event: 'message',
            priority: 1,
            rule: [
                {
                    reg: /^#?检测(仓库|github|fan)更新$/,
                    fnc: 'MonitorTask'
                }, {
                    reg: /^#fan(设置|更改|改变)(github|Github|GITHUB)(开启|打开|open|关闭|shutdown)$/,
                    fnc: 'setGithubPushStatus'
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

    async setGithubPushStatus(e) {
        if (!e.isMaster) {
            e.reply("你干嘛！喵!> x <")
            return true
        }
        let Msg = e.original_msg || e.msg
        if (!Msg) {
            e.reply("没有获取到指令喵~\n如：#fan设置github开启")
            return true
        }
        if (Msg.includes("开启") || Msg.includes("打开") || Msg.includes("open")) {
            await redis.set('FanSky:Github:Push', JSON.stringify({PushStatus: 1}));
            e.reply("[FanSky仓库更新检测]已开启\n当更新包含[不推送]标签时是不会向您推送的喵~\n以尽量推送比较重要的更新")
        } else {
            await redis.set('FanSky:Github:Push', JSON.stringify({PushStatus: 0}));
            e.reply("[FanSky仓库更新检测]已关闭\n以后将不会向您推送任何更新喵~")
        }
        return true
    }

    async MonitorTask() {
        const redisValue = await redis.get('FanSky:Github:Push');
        if (!redisValue) {
            await redis.set('FanSky:Github:Push', JSON.stringify({PushStatus: 1}));
        } else {
            const parsedValue = JSON.parse(redisValue);
            if (parsedValue.PushStatus !== 1) {
                return true
            }
        }
        if (await redis.get(`FanSky:Github:PushStatus`)) {
            return true
        }
        const dirPath = path.dirname(GithubStatic);
        fs.mkdirSync(dirPath, {recursive: true});
        if (!fs.existsSync(GithubStatic)) fs.writeFileSync(GithubStatic, '{}');
        let GithubStaticJson = JSON.parse(fs.readFileSync(GithubStatic))
        try {
            const res = await axios.get('https://api.github.com/repos/AFanSKyQs/FanSky_Qs/commits')
            const data = res.data
            if (!data[0]) return
            let Json = data[0]
            if (GithubStaticJson.sha !== Json.sha) {
                GithubStaticJson = Json
                fs.writeFileSync(GithubStatic, JSON.stringify(GithubStaticJson))
                logger.info(logger.magenta('>>>已更新GithubStatic.json'))
                let UTC_Date = Json.commit.committer.date
                const cnTime = new Date(UTC_Date).toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai', hour12: false})
                if (Bot.uin === 2374221304) {
                    await Bot.pickGroup(Number(755794036)).sendMsg(`[FanSky_Qs插件更新自动推送]\nContributors：${Json.commit.committer.name}\nDate:${cnTime}\nMessage:${Json.commit.message}\nUrl:${Json.html_url}`)
                }
                let list = cfg.masterQQ
                if (Json.commit.message.includes("[不推送]") || !Json.commit.message) {
                    logger.info(logger.magenta('[FanSky_Qs]>>>检测到[不推送]标签，已跳过本次推送'))
                    return true
                }
                let MasterNum = list.length
                // 推送策略：只推一个人,从第一个人开始，但是如果第一个人的QQ号长度大于11，说明是频道号，那就推第二个人，以此类推，当成功推送一次后，就不再推送
                for (let i = 0; i < MasterNum; i++) {
                    if ((list[i].toString()).length <= 11) {
                        logger.info(logger.magenta(`Master:${list[i]}`))
                        try {
                            // 推送消息给当前主人
                            await Bot.pickFriend(Number(list[i])).sendMsg(`[FanSky_Qs插件更新]:\nContributors：${Json.commit.committer.name}\nDate:${cnTime}\nMessage:${Json.commit.message}\nUrl:${Json.html_url}`)
                            await redis.set(`FanSky:Github:PushStatus`, JSON.stringify({PushStatus: 1}));
                            await redis.expire(`FanSky:Github:PushStatus`, 60 * 4 - 5);
                            break // 推送成功后跳出循环
                        } catch (err) {
                            logger.info(`QQ号${list[i]}推送失败，已往下走~`)
                        }
                    }
                }
            }
        } catch (error) {
            return true
        }
        return true
    }
}
