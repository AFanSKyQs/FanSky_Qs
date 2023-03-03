import {segment} from "oicq";
import plugin from "../../../lib/plugins/plugin.js";
let urls_one="http://api.andeer.top/API/word_pic1.php"
export class DianZan extends plugin {
    constructor() {
        super({
            name: '点赞',
            dsc: '点赞',
            event: 'message',
            priority: 8,
            rule: [
                {
                    reg: /^#?(点赞|赞我|点zan)$/,
                    fnc: 'thuMUp',
                }
            ]
        })
    }
    async thuMUp(e){
        if(e.isGroup){
            await Bot.pickFriend(e.user_id).thumbUp(20);
            let MsgListTwo=[segment.at(e.user_id),"给你点赞了喵~\n没点上加我好友发【点赞】~",'\n',segment.image(urls_one)]
            await e.reply(MsgListTwo)
            return true
        }
        await Bot.sendLike(e.user_id,20)
        await e.reply("赞了噢喵~,可以..可以回我一下嘛o(*////▽////*)q~,没点上请加我好友再发【点赞】~")
        return true
    }
}
