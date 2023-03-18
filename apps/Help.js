import plugin from "../../../lib/plugins/plugin.js";
import common from '../../../lib/common/common.js'
import fs from "fs";
let _path = `${process.cwd()}/resources/FanSky`
let path = `${process.cwd()}/resources/FanSky/SignIn.json`
let path_SignTop = `${process.cwd()}/resources/FanSky/SignTop.json`

export class UpdatePlugin extends plugin {
    constructor() {
        super({
            name: 'FanSky_Qs插件帮助',
            dsc: 'FanSky_Qs插件帮助',
            event: 'message',
            priority: 3141,
            rule: [
                {
                    reg: /^#?(fan|Fansky|Fan|fans)(帮助|菜单|help|功能)$/,
                    fnc: 'AFanSKyQsHelp',
                },
            ]
        })
    }

    async AFanSKyQsHelp(e) {
        if (!fs.existsSync(_path)) {fs.mkdirSync(_path);}
        if (!fs.existsSync(path)) {fs.writeFileSync(path, '{}');}
        if (!fs.existsSync(path_SignTop)) {fs.writeFileSync(path_SignTop, '{}');}
        let SignDay = JSON.parse(fs.readFileSync(path));
        let SignTop = JSON.parse(fs.readFileSync(path_SignTop));
        let HelpList = [
            "单功能⭐️︎:\n |*一眼丁真|\n |*电影票房|*点赞|\n |*#成就排行|*#宝箱排行|\n |*发病(或艾特机器人不加任何消息)😍|", "OpenAI🤖：\n" +
            "|*模型列表 |★@机器人+消息 |\n" +
            "|*#设置模型key sk-xxxxxx |\n" +
            "|*设置模型人设你是xx,... |\n" +
            "|*拉黑模型使用 [QQ]|\n" +
            "|*更换语言模型 [1、2]|\n" +
            "|*设置OpenAI [开启、关闭]|\n" +
            "|*设置模型打卡 [开启、关闭]|", "打卡系统🍀(小游戏开发)：\n" +
            "|*打卡、冒泡|*打卡总计|\n" +
            "|*首次打卡时间|"
        ]
        if(SignDay[e.user_id]){HelpList.push(`|QQ：${e.user_id}|魔晶：${SignDay[e.user_id].rough}|\n|已打卡：${SignDay[e.user_id].day}天|连续：${SignDay[e.user_id].continuous}天| ${SignDay[e.user_id].count}次|\n|首次打卡时间：${(new Date(SignDay[e.user_id].FirstSignTime)).toLocaleString()}|`)}else{HelpList.push(`|QQ：${e.user_id}|魔晶：0|\n|已打卡：0天|连续：0天| 0次\n|首次打卡时间：未打卡|\n可发送【打卡】或【冒泡】打卡`)}
        let SendList=await common.makeForwardMsg(e, HelpList, `FanSky_Qs菜单 | ${(new Date(Date.now())).toLocaleString()}`)
        await e.reply(SendList)
        return true
    }
}