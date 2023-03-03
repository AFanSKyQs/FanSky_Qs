import plugin from "../../../lib/plugins/plugin.js";

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
    async AFanSKyQsHelp(e){
        let HelpList=[
            "艾特+消息即可与OpenAI对话\n语言模型列表 | 更换语言模型x\n猫眼票房 | 一眼丁真 \n打卡、冒泡、签到\n首次打卡时间\n点赞、赞我\n更多正在赶工中~"
        ]
        e.reply(HelpList)
        return true
    }
}