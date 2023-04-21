import {CardList, FirstSignTime, SingleTest} from "./SignIn.js";
import plugin from "../../../../lib/plugins/plugin.js";
import {runGetIdiomEmoji} from "./EmojiToIdiom/EmojiToIdiom.js";
import {ListenAnswer} from "./EmojiToIdiom/ListenAnswer.js";
import {RoundsCard} from "./RoundsCard.js";

export class MagicCrystalIndex extends plugin {
    constructor() {
        super({
            name: '打卡',
            dsc: '打卡，签到',
            event: 'message',
            priority: 3141,
            rule: [
                {
                    reg: /^#?(打卡|冒泡|冒泡泡)$/,
                    fnc: 'MagicCrystalSign',
                },
                {
                    reg: /^🌨️🔥$/,
                    fnc: 'MagicCrystalSign',
                },
                {
                    reg: /^#?(首次|最开始|第一次|第1次|第one次)(打卡|冒泡|签到|冒泡泡)时间?$/,
                    fnc: 'FirstSignTime',
                }
                ,
                {
                    reg: /^#?(打卡|冒泡)(用户|统计|记录|总计)$/,
                    fnc: 'CardList',
                },
                {
                    reg: /^#?emoji猜成语$/,
                    fnc: 'runGetIdiomEmoji',
                },
                {
                    reg: /.*/i,
                    fnc: 'ListenAnswer',
                    log: false
                },
                {
                    reg: /^#?(魔晶|Fan|fan)(抽卡|抽角色|抽奖)$/,
                    fnc: 'RoundsCard',
                }
            ]
        })
    }

    async RoundsCard(e) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if(OpenStatus.MagicCrystal!==1) return false
        let Static = await RoundsCard(e)
        if (!Static || Static === false) {
            return false
        }
    }

    async ListenAnswer(e) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if(OpenStatus.MagicCrystal!==1) return false
        if (await redis.get(`FanSky:MagicCrystal:${e.group_id}:EmojiCD`)) {
            await ListenAnswer(e)
        }
        return false
    }

    async runGetIdiomEmoji(e) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if(OpenStatus.MagicCrystal!==1) return false
        let Static = await runGetIdiomEmoji(e)
        if (!Static || Static === false) {
            return false
        }
    }

    async MagicCrystalSign(e) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if(OpenStatus.MagicCrystal!==1) return false
        let Static = await SingleTest(e)
        if (!Static || Static === false) {
            return false
        }
    }

    async FirstSignTime(e) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if(OpenStatus.MagicCrystal!==1) return false
        let Static = await FirstSignTime(e)
        if (!Static || Static === false) {
            return false
        }
    }

    async CardList(e) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if(OpenStatus.MagicCrystal!==1) return false
        let Static = await CardList(e)
        if (!Static || Static === false) {
            return false
        }
    }
}