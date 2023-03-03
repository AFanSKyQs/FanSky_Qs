import fs from "fs";

let yunPath = process.cwd()
import getCfg from "../models/getCfg.js"

export class ChangeAIModel extends plugin {
    constructor() {
        super({
            name: '更换AI语言模型',
            dsc: '更换AI语言模型',
            event: 'message',
            // 优先级(数值越小优先度越高)
            priority: 3141,
            // 消息匹配规则
            rule: [
                {
                    reg: /#?(更换|切换|换|换一下)语言模型(.*)/, //(.*)里面接收的是数字，如1或者2等..
                    fnc: 'ChangeAIModel'
                }, {
                    reg: /#?(拉黑|加黑|禁止|禁用)语言模型(.*)/, //(.*)里面接收的是qq号，即要拉黑的人的qq号
                    fnc: 'addBlackList'
                }, {
                    reg: /#?(设置|更改|修改)模型人设(.*)/,
                    fnc: 'SetPersona'
                }
            ]
        })
    };

    async addBlackList(e) {
        if (!e.isMaster) {
            e.reply("打咩，你在赣神魔！∑(ΦдΦlll~")
            return true
        }
        let path = `${process.cwd()}/plugins/FanSky_Qs/config/OpenAI.json`
        path = path.replace(/\\/g, "/");
        let msg = e.msg
        let QQ = Number(msg.match(/\d+/)[0])
        let OpenAIJson = JSON.parse(fs.readFileSync(path))
        if (OpenAIJson.BlackList.indexOf(QQ) === -1) {
            OpenAIJson.BlackList.push(QQ)
            await fs.writeFileSync(path, JSON.stringify(OpenAIJson));
            e.reply(`已将${QQ}加入黑名单`)
        } else {
            e.reply(`${QQ}已经在黑名单中了`)
        }
        return true
    }

    async SetPersona(e) {
        if (!e.isMaster) {
            e.reply("不行哇，你不能这么做！〣 ( ºΔº ) 〣")
            return true
        }
        let path = `${process.cwd()}/plugins/FanSky_Qs/config/OpenAI.json`
        path = path.replace(/\\/g, "/");
        let Persona = e.msg.match(/#?(设置|更改|修改)模型人设(.*)/)[2]
        if (Persona.length <= 6) {
            e.reply("好短，我不同意这个设定，再想一个更好的嘛！(∩ﾟдﾟ)")
            return true
        }
        let OpenAIJson = JSON.parse(fs.readFileSync(path))
        OpenAIJson.Persona = Persona
        await fs.writeFileSync(path, JSON.stringify(OpenAIJson));
        e.reply(`已将模型人设更改为：\n${Persona}`)
        return true
    }

    async ChangeAIModel(e) {
        if (!e.isMaster) {
            e.reply("打咩，你还不可以控制这个噢(Ｔ▽Ｔ)~")
            return true
        }
        let path = `${process.cwd()}/plugins/FanSky_Qs/config/OpenAI.json`
        path = path.replace(/\\/g, "/");
        let msg = e.msg
        let model = Number(msg.match(/\d+/)[0])
        if (model === 1 || model === 2) {
            let OpenAIJson = JSON.parse(fs.readFileSync(path))
            OpenAIJson.Model = model
            await fs.writeFileSync(path, JSON.stringify(OpenAIJson));
            let Model_list = (await getCfg(yunPath, "OpenAI")).Model_list
            e.reply(`已切换为${model}号模型: ${Model_list[model - 1]}`)
        } else {
            e.reply(`您选择了${model}号模型,暂时仅支持1号和2号模型~`)
        }
        return true
    }
}