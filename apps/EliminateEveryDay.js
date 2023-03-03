/** 定时任务 */
import fs from "fs";
import cfg from "../../../lib/config/config.js";
import plugin from "../../../lib/plugins/plugin.js";

let path = `${process.cwd()}/resources/FanSky/SignIn.json`

export class EliminateEveryDay extends plugin {
    constructor() {
        super({
            name: '重置每日打卡状态',
            dsc: '重置每日打卡状态',
            event: 'message',
            priority: 8,
            rule: [
                {
                    reg: /^#?(重置打卡|清除打卡)$/,
                    fnc: 'ClearSign',
                },
            ]
        })
        this.task = {
            /** 任务名称 */
            name: '清除打卡状态',
            cron: '0 0 0 * * *',
            fnc: () => this.Eliminate(),
        }
    }

    async Eliminate() {
        let data = JSON.parse(fs.readFileSync(path));
        let Num = 0;
        for (let user in data) {
            data[user].today = false;
            Num++;
        }
        fs.writeFileSync(path, JSON.stringify(data));
        //将消息发送给机器人的主人
        let list = cfg.masterQQ;
        let msg = [
            "已清除今日打卡状态",
            "当前时间: " + new Date().toLocaleString()
        ];
        for (let userId of list) {
            await Bot.pickFriend(userId).sendMsg(msg)
        }
    }
    async ClearSign(e) {
        if (!e.isMaster) {
            e.reply("你在干什么baka!~")
            return true
        }
        let data = JSON.parse(fs.readFileSync(path));
        let Num = 0;
        for (let user in data) {
            data[user].today = false;
            Num++;
        }
        fs.writeFileSync(path, JSON.stringify(data));
        e.reply(`总计${Num}用户，已重置今日打卡状态为false喵~`)
        return true
    }
}

