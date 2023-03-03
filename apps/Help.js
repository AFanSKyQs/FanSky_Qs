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
            " 猫眼票房 | 一眼丁真 \n 打卡、冒泡、签到\n 首次打卡时间"
        ]
        e.reply(HelpList)
        return true
    }
}