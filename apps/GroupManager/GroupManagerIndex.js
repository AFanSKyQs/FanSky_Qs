import {RecallBatch} from "./Recall.js";

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
        return await RecallBatch(e);
    }
}