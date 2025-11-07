/* eslint-disable camelcase */
import plugin from '../../../../lib/plugins/plugin.js'
import {OpenAPModelList} from "./OpenAIModelList.js";
import {UseModel} from "./UseModel.js";
import {DelAllConversation, ResetConversation} from "./ResetConversation.js";
import {SayHelloToAI} from "./SayHelloToAI.js";
import {
    addBlackList,
    ChangeAIModel,
    ChangeAIModelMode,
    ChangeAISignMode,
    OnOFF, OpenGroupAI, setAllPerson, SetMaxToMakeMsg,
    SetOpenAIKey,
    SetPersona
} from "./ChangeAIModel.js";
import {getOpenAIConfig} from "../../models/getCfg.js";
import {PersonList, UsePerson} from "./UseDefaultPerson.js";
import {setOpenAIProxy} from "./setOpenAIProxy.js";
import {OpenAIQuota} from "./OpenAIQuota.js";
import fs from "fs";

export class OpenAIEntry extends plugin {
    constructor() {
        super({
            name: 'OpenAI功能Index',
            dsc: 'OpenAI功能Index',
            event: 'message',
            priority: 3141,
            rule: [
                {
                    reg: /^#清空所有|#清空全部|#清除所有|#清除全部$/i,
                    fnc: 'DelAll'
                },
                {
                    reg: /^#重置(对话|聊天|记忆)$/i,
                    fnc: 'Reset'
                }, {
                    reg: /^#dd(.*)/u,
                    fnc: 'PrefixAI',
                    log: false
                },
                {
                    reg: /.*/i,
                    fnc: 'UseModel',
                    log: false
                }
                // , {
                //     reg: /#?(对话|语言|OpenAI|chatgpt)模型列表/,
                //     fnc: 'OpenAPModelList'
                // }
                ,
                // {
                //     reg: /#?(早|早上|上午|午|中午|下午|晚|晚上|午夜|半夜|凌晨|深夜)(好！|好!|好呀!|好呀！|好|安|安好梦|好呀|愉快|好喵！|好喵!|好喵)(.*)/,
                //     fnc: 'SayHelloToAI'
                // },
                // {
                //     reg: "^早$",
                //     fnc: 'SayHelloToAI'
                // },
                // {
                //     reg: /#?(更换|切换|换|换一下)语言模型(.*)/, // (.*)里面接收的是数字，如1或者2等..
                //     fnc: 'ChangeAIModel'
                // },
                {
                    reg: /#?(拉黑|加黑|禁止|禁用)模型使用(.*)/, // (.*)里面接收的是qq号，即要拉黑的人的qq号
                    fnc: 'addBlackList'
                }, {
                    reg: /#?(设置|更改|修改)模型人设(.*)/,
                    fnc: 'SetPersona'
                }, {
                    reg: /#?(设置|更改|修改)模型模式(.*)/,
                    fnc: 'ChangeAIModelMode'
                }, {
                    reg: /#?(设置|更改|修改)模型打卡(开启|打开|启用|关闭|不启用)/,
                    fnc: 'ChangeAISignMode'
                }, {
                    reg: /#(设置|更改|修改|添加|更换|查看)(OpenAI|模型|语言模型|OpenAI模型)key(.*)/,
                    fnc: 'SetOpenAIKey'
                }, {
                    reg: /#?(设置|更改|修改)(OpenAI|AI|模型|对话)(开启|打开|启用|关闭|不启用)$/,
                    fnc: 'OnOFF'
                }, {
                    reg: /#(OpenAI|模型|语言模型|OpenAI模型|key)(额度|余额|剩余|使用)(查询|查看|查找)/,
                    fnc: 'OpenAIQuota'
                }, {
                    reg: /#设置(OpenAI|模型|语言模型|OpenAI模型)转合并(\d+)/,
                    fnc: 'SetMaxToMakeMsg'
                },
                {
                    reg: /#(开启|打开|open|关闭|禁用|关机)群(模型|AI|OpenAI|ai|聊天)(\d+)/,
                    fnc: 'OpenGroupAI'
                }, {
                    reg: /#(use|USE|使用)(OpenAI|AI|模型|对话|语言)(人设|设定|预设)(\d+)/,
                    fnc: 'UsePerson'
                }, {
                    reg: /#(OpenAI|AI|模型|对话|语言)(人设|设定|预设)(列表|表单|表|集合)/,
                    fnc: 'PersonList'
                }, {
                    reg: /#(设置|删除)全局人设(.*)/,
                    fnc: 'setAllPerson'
                },
                {
                    reg: /#(设置|更改)模型代理地址(.*)/,
                    fnc: 'setOpenAIProxy'
                },
                {
                    reg: /#查询模型密钥(.*)/,
                    fnc: 'SearchGPTKEY'
                },
                {
                    reg: /#(设置|删除)fan代理(.*)/,
                    fnc: 'setAFanSKyQs'
                }
                // {
                //     reg: /#对话列表|#聊天列表|#会话列表/,
                //     fnc: 'Axios_list'
                // },
            ]
        })
    };

    async PrefixAI(e) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if (OpenStatus.OpenAI !== 1) return false
        let Static = await UseModel(e, true)
        if (Static.wait) return false
        if (!Static || Static === false) return false
    }

    async setAFanSKyQs(e) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if (OpenStatus.OpenAI !== 1) return false
        let msg = (e.original_msg || e.msg) + ""
        if (msg.includes("删除")) {
            await redis.del(`FanSky:OpenAI:AFanSKyQsProxy`)
            await e.reply(`已删除Fan反代，将采用您设置的或系统默认代理地址...`)
            return true
        }
        await setOpenAIProxy(e, "fan")
    }

    async SearchGPTKEY(e) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if (OpenStatus.OpenAI !== 1) return false
        let OpenAIKey = (e.original_msg || e.msg).replace(/#查询模型密钥/i, '').trim()
        let OpenAIConfig = {OpenAI_Key: OpenAIKey}
        let Static = await l(e, OpenAIConfig)
        if (!Static || Static === false) return false
    }

    async setOpenAIProxy(e) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if (OpenStatus.OpenAI !== 1) return false
        await setOpenAIProxy(e, "default")
    }

    async setAllPerson(e) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if (OpenStatus.OpenAI !== 1) return false
        let Static = await setAllPerson(e)
        if (!Static || Static === false) return false
    }

    async PersonList(e) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if (OpenStatus.OpenAI !== 1) return false
        let Static = await PersonList(e)
        if (!Static || Static === false) return false
    }

    async UsePerson(e) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if (OpenStatus.OpenAI !== 1) return false
        let Static = await UsePerson(e)
        if (!Static || Static === false) return false
    }

    async OpenGroupAI(e) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if (OpenStatus.OpenAI !== 1) return false
        let Static = await OpenGroupAI(e)
        if (!Static || Static === false) return false
    }

    async SetMaxToMakeMsg(e) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if (OpenStatus.OpenAI !== 1) return false
        let Static = await SetMaxToMakeMsg(e)
        if (!Static || Static === false) return false
    }

    async OpenAIQuota(e) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if (OpenStatus.OpenAI !== 1) return false
        let OpenAIConfig = await getOpenAIConfig()
        let Static = await OpenAIQuota(e, OpenAIConfig)
        if (!Static || Static === false) return false
    }

    async OpenAPModelList(e) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if (OpenStatus.OpenAI !== 1) return false
        let Static = await OpenAPModelList(e)
        if (!Static || Static === false) return false
    }

    async UseModel(e) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if (OpenStatus.OpenAI !== 1) return false
        let Static = await UseModel(e)
        if (Static.wait) return false
        if (!Static || Static === false) return false
    }

    async DelAll(e) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if (OpenStatus.OpenAI !== 1) return false
        let Static = await DelAllConversation(e)
        if (!Static || Static === false) return false
    }

    async Reset(e) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if (OpenStatus.OpenAI !== 1) return false
        let Static = await ResetConversation(e)
        if (!Static || Static === false) return false
    }

    async SayHelloToAI(e) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if (OpenStatus.OpenAI !== 1) return false
        let Static = await SayHelloToAI(e)
        if (!Static || Static === false) return false
    }

    async OnOFF(e) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if (OpenStatus.OpenAI !== 1) return false
        let Static = await OnOFF(e)
        if (!Static || Static === false) return false
    }

    async SetOpenAIKey(e) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if (OpenStatus.OpenAI !== 1) return false
        if ((e.msg + "").includes("查看")) {
            if (e.isMaster) {
                if (e.isGroup) {
                    await e.reply("主人，我们能不能私底下看鸭(˃ ⌑ ˂ഃ )")
                } else {
                    let path = `${process.cwd()}/plugins/FanSky_Qs/config/config.json`
                    path = path.replace(/\\/g, '/')
                    let OpenAIJson = JSON.parse(fs.readFileSync(path))
                    await e.reply(`主人，我的OpenAI密钥是：${OpenAIJson.OpenAI_Key}`)
                }
                return true
            } else {
                await e.reply("大坏蛋大坏蛋！那个...你不能看！(˃ ⌑ ˂ഃ )")
                return true
            }
        }
        let Static = await SetOpenAIKey(e)
        if (!Static || Static === false) return false
    }

    async ChangeAISignMode(e) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if (OpenStatus.OpenAI !== 1) return false
        let Static = await ChangeAISignMode(e)
        if (!Static || Static === false) return false
    }

    async ChangeAIModelMode(e) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if (OpenStatus.OpenAI !== 1) return false
        let Static = await ChangeAIModelMode(e)
        if (!Static || Static === false) return false
    }

    async addBlackList(e) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if (OpenStatus.OpenAI !== 1) return false
        let Static = await addBlackList(e)
        if (!Static || Static === false) return false
    }

    async SetPersona(e) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if (OpenStatus.OpenAI !== 1) return false
        let Static = await SetPersona(e)
        if (!Static || Static === false) return false
    }

    async ChangeAIModel(e) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if (OpenStatus.OpenAI !== 1) return false
        let Static = await ChangeAIModel(e)
        if (!Static || Static === false) return false
    }
}
