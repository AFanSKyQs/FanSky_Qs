import {RecallBatch} from "./Recall.js";
import {PullBlack,AddWhiteGroup} from "./PullBlackQQ.js";
import {RecallGroup} from "./RecallGroup.js";
export class GroupManagerIndex extends plugin {
    constructor() {
        super({
            name: 'FanSkyGroupManager',
            dsc: 'FanSky群管模块',
            event: 'message',
            priority: 3141,
            rule: [
                {
                    reg: /^#(清|清理|清除|清空)(屏|屏幕|记录|历史)(.*)/u,
                    fnc: 'RecallGroup',
                },
                {
                    reg: /^#(批量撤回|大量撤回)(.*)/u,
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
    async RecallGroup(e){
        if(!e.isGroup){
            e.reply("清屏是群聊功能喵~")
            return false
        }
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if(OpenStatus.GroupManager!==1) return false
        return await RecallGroup(e);
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