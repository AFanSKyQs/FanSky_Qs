import {k} from "./Recall.js";

export class GroupManagerIndex extends plugin {
    constructor() {
        super({
            name: 'FanSkyGroupManager',
            dsc: 'FanSky群管模块',
            event: 'message.group',
            priority: 3141,
            rule: [
                {
                    reg: /^#批量撤回(.*)$/,
                    fnc: 'BatchRecall',
                },
            ]
        })
    }
    async BatchRecall(e) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if(OpenStatus.GroupManager!==1) return false
        return await k(e);
    }
}