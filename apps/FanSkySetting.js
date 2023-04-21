import plugin from '../../../lib/plugins/plugin.js'
import common from '../../../lib/common/common.js'

export class FanSkySetting extends plugin {
    constructor() {
        super({
            name: 'FanSky设置',
            dsc: 'FanSky设置',
            event: 'message',
            priority: 9,
            rule: [
                {
                    reg: /^#(fan|fans|fansky)设置(.*)$/,
                    fnc: 'FanSkySetting',
                }
            ]
        })
    }

    async FanSkySetting(e) {
        if (!e.isMaster) {
            e.reply('只有主人只能这样做喵！')
            return true
        }
        let input = e.msg || e.original_msg || e.raw_message || "#fan设置"
        let Result = await this.parseUserInput(input)
        if (Result.Tools) {
            await this.setRedis(Result.Tools, Result.ToolsStatus)
        }
        await this.getRedis(e)
        return true
    }

    async setRedis(FunctionKey, FunctionStatus) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        OpenStatus[FunctionKey] = FunctionStatus
        await redis.set(`FanSky:FunctionOFF`, JSON.stringify(OpenStatus))
    }

    async getRedis(e) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        let MsgList = [
            `指令：#fan设置+系统名+开启/关闭`,
            `如：#fan设置群管系统开启`,
            `群管系统：${OpenStatus.GroupManager === 1 ? '开启' : '关闭'}`+"\n"
            `原神系统：${OpenStatus.Teyvat === 1 ? '开启' : '关闭'}`+"\n"
            `魔晶系统：${OpenStatus.MagicCrystal === 1 ? '开启' : '关闭'}`+"\n"
            `聊天系统：${OpenStatus.OpenAI === 1 ? '开启' : '关闭'}`+"\n"
            `娱乐系统：${OpenStatus.SmallFunction === 1 ? '开启' : '关闭'}`,
        ]
        let Msg = await common.makeForwardMsg(e, MsgList, '[FanSky_Qs]当前设置')
        await e.reply(Msg)
    }

    async parseUserInput(input) {
        let ReturnSet = {};
        const regex = /^#(fan|fans|fansky)设置(.*)$/;
        const match = input.match(regex);
        if (!match) {
            ReturnSet.Setting = true;
            return ReturnSet;
        }

        const command = match[1];
        const args = match[2].trim();


        if (!args) {
            ReturnSet.Setting = true;
        } else {
            const toolsRegex = /^(原神系统|OpenAI系统|聊天系统|群管系统|魔晶系统|娱乐系统)(开启|关闭)$/;
            const toolsMatches = args.match(toolsRegex);

            if (toolsMatches) {
                const functionKeyMap = {
                    '原神系统': 'Teyvat',
                    'OpenAI系统': 'OpenAI',
                    '聊天系统': 'OpenAI',
                    '群管系统': 'GroupManager',
                    '魔晶系统': 'MagicCrystal',
                    '娱乐系统': 'SmallFunction',
                };
                const functionName = functionKeyMap[toolsMatches[1]];
                const functionStatus = toolsMatches[2] === '开启' ? 1 : 0;
                const functionObj = {[functionName]: functionStatus};
                ReturnSet = Object.entries(functionObj).reduce((acc, [key, value]) => {
                    acc.Tools = key;
                    acc.ToolsStatus = value;
                    return acc;
                }, {});
            } else {
                ReturnSet.Setting = true;
            }
        }
        return ReturnSet;
    }
}

