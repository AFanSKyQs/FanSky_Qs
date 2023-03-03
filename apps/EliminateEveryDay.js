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
                    reg: /^#(重置|清除)每日?打卡(状态)?$/,
                    fnc: 'Eliminate',
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
        for (let group in data) {
            for (let user in data[group]) {
                data[group][user].today = false;
            }
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
}

