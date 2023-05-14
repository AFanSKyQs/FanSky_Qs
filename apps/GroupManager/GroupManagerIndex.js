import {RecallBatch} from "./Recall.js";
import {PullBlack,AddWhiteGroup} from "./PullBlackQQ.js";
export class GroupManagerIndex extends plugin {
    constructor() {
        super({
            name: 'FanSkyGroupManager',
            dsc: 'FanSky群管模块',
            event: 'message',
            priority: 3141,
            rule: [
                {
                    reg: /^#批量撤回(.*)$/,
                    fnc: 'BatchRecall',
                },{
                    reg: /^#(拉黑|解黑|取消拉黑)(QQ|Q群|QQ群|群)?(.*)/u,
                    fnc: 'PullBlack',
                },{
                    reg: /^#(加白|加白群|添加白名单|添加白名单群)(Q群|QQ群|群)?(.*)/u,
                    fnc: 'AddWhiteGroup',
                },
            ]
        })
    }
    async AddWhiteGroup(e){
        if(!e.isMaster){
            e.reply("你干嘛！喵!> x <")
            return false
        }
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if(OpenStatus.GroupManager!==1) return false
        return await AddWhiteGroup(e);
    }
    async PullBlack(e) {
        if(!e.isMaster){
            e.reply("你干嘛！喵!> x <")
            return false
        }
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if(OpenStatus.GroupManager!==1) return false
        return await PullBlack(e);
    }
    async BatchRecall(e) {
        if(!e.isGroup){
            e.reply("这是群聊功能喵~")
            return false
        }
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if(OpenStatus.GroupManager!==1) return false
        return await RecallBatch(e);
    }
}