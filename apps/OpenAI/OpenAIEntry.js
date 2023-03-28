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
    OnOFF, OpenGroupAI, SetMaxToMakeMsg,
    SetOpenAIKey,
    SetPersona
} from "./ChangeAIModel.js";
import {OpenAIQuota} from "./OpenAIQuota.js";
import {getOpenAIConfig} from "../../models/getCfg.js";

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
                },
                {
                    reg: /.*/i,
                    fnc: 'UseModel',
                    log:false
                }, {
                    reg: /#?(对话|语言)?模型列表/,
                    fnc: 'OpenAPModelList'
                },
                // {
                //     reg: /#?(早|早上|上午|午|中午|下午|晚|晚上|午夜|半夜|凌晨|深夜)(好！|好!|好呀!|好呀！|好|安|安好梦|好呀|愉快|好喵！|好喵!|好喵)(.*)/,
                //     fnc: 'SayHelloToAI'
                // },
                // {
                //     reg: "^早$",
                //     fnc: 'SayHelloToAI'
                // },
                {
                    reg: /#?(更换|切换|换|换一下)语言模型(.*)/, // (.*)里面接收的是数字，如1或者2等..
                    fnc: 'ChangeAIModel'
                }, {
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
                    reg: /#(设置|更改|修改|添加|更换)(OpenAI|模型|语言模型|OpenAI模型)key(.*)/,
                    fnc: 'SetOpenAIKey'
                }, {
                    reg: /#?(设置|更改|修改)(OpenAI|AI|模型|对话)(开启|打开|启用|关闭|不启用)$/,
                    fnc: 'OnOFF'
                }, {
                    reg: /#(OpenAI|模型|语言模型|OpenAI模型|key)(额度|余额|剩余|使用)(查询|查看|查找)/,
                    fnc: 'OpenAIQuota'
                },{
                    reg: /#设置(OpenAI|模型|语言模型|OpenAI模型)转合并(\d+)/,
                    fnc: 'SetMaxToMakeMsg'
                },
                {
                    reg: /#(开启|打开|open|关闭|禁用|关机)群(模型|AI|OpenAI|ai|聊天)(\d+)/,
                    fnc: 'OpenGroupAI'
                },
                // {
                //     reg: /#对话列表|#聊天列表|#会话列表/,
                //     fnc: 'Axios_list'
                // },
            ]
        })
    };
    async OpenGroupAI(e) {
        let Static = await OpenGroupAI(e)
        if (!Static || Static === false) return false
    }
    async SetMaxToMakeMsg(e) {
        let Static = await SetMaxToMakeMsg(e)
        if (!Static || Static === false) return false
    }
    async OpenAIQuota(e) {
        let OpenAIConfig = await getOpenAIConfig()
        let Static = await OpenAIQuota(e, OpenAIConfig)
        if (!Static || Static === false) return false
    }

    async OpenAPModelList(e) {
        let Static = await OpenAPModelList(e)
        if (!Static || Static === false) return false
    }

    async UseModel(e) {
        let Static = await UseModel(e)
        if (!Static || Static === false) return false
    }

    async DelAll(e) {
        let Static = await DelAllConversation(e)
        if (!Static || Static === false) return false
    }

    async Reset(e) {
        let Static = await ResetConversation(e)
        if (!Static || Static === false) return false
    }

    async SayHelloToAI(e) {
        let Static = await SayHelloToAI(e)
        if (!Static || Static === false) return false
    }

    async OnOFF(e) {
        let Static = await OnOFF(e)
        if (!Static || Static === false) return false
    }

    async SetOpenAIKey(e) {
        let Static = await SetOpenAIKey(e)
        if (!Static || Static === false) return false
    }

    async ChangeAISignMode(e) {
        let Static = await ChangeAISignMode(e)
        if (!Static || Static === false) return false
    }

    async ChangeAIModelMode(e) {
        let Static = await ChangeAIModelMode(e)
        if (!Static || Static === false) return false
    }

    async addBlackList(e) {
        let Static = await addBlackList(e)
        if (!Static || Static === false) return false
    }

    async SetPersona(e) {
        let Static = await SetPersona(e)
        if (!Static || Static === false) return false
    }

    async ChangeAIModel(e) {
        let Static = await ChangeAIModel(e)
        if (!Static || Static === false) return false
    }
}