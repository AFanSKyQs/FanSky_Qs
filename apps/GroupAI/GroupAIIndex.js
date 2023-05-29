import plugin from '../../../../lib/plugins/plugin.js'
import {GroupAI} from "./OpenAIGroupAI.js";
export class GroupAIIndex extends plugin {
    constructor() {
        super({
            name: '[FanSky]OpenAI群AI',
            dsc: 'OpenAI群AI',
            event: 'message.group',
            priority: 1299,
            rule: [
                {
                    reg: /.*/i,
                    fnc: 'OpenAIGroup',
                    log: false
                }
            ]
        });
    }

    async OpenAIGroup(e){
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if (OpenStatus.GroupOpenAI !== 1) return false
        let Static = await GroupAI(e)
        if (!Static || Static === false) return false
        return true
    }
}