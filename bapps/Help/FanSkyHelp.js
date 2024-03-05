import plugin from "../../../../lib/plugins/plugin.js";
import {MainFanSkyHelp} from "./MainHelp.js";


export class FanSkyHelp extends plugin {
    constructor() {
        super({
            name: 'FanSky_Qs插件帮助',
            dsc: 'FanSky_Qs插件帮助',
            event: 'message',
            priority: 3141,
            rule: [
                {
                    reg: /^#?(fan|Fansky|Fan|fans).*?(帮助|菜单|help|功能)$/,
                    fnc: 'MainFanSkyHelp',
                },
            ]
        })
    }
    async MainFanSkyHelp(e) {
        await MainFanSkyHelp(e)
        return true
    }
}

