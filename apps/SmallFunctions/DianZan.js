import {segment} from "oicq";
import getCfg from "../../models/getCfg.js";
import fs from "fs";
let urls_one = "http://api.andeer.top/API/word_pic1.php"
let yunPath = process.cwd()
let JsonPath = process.cwd().replace( /\\/g, '/' )
export async function thuMUp(e) {
    const Json = await getCfg(yunPath, 'OpenAI')
    if (!Json.thuMUpOFF) {
        Json.thuMUpOFF = "关闭"
        let Path=JsonPath + '/plugins/FanSky_Qs/config/OpenAI.json'
        await fs.writeFileSync(Path, JSON.stringify(Json))
    }
    if (Json.thuMUpOFF === "关闭") {
        logger.info(logger.cyan('[FanSky_Qs]点赞功能已关闭 | 开启[ #开启fan点赞 ]'))
        return false
    }
    if (e.isGroup) {
        await Bot.pickFriend(e.user_id).thumbUp(20);
        let MsgListTwo = [segment.at(e.user_id), "给你点赞了喵~\n没点上加我好友发【打卡】~", '\n', segment.image(urls_one)]
        await e.reply(MsgListTwo)
        return true
    }
    await Bot.sendLike(e.user_id, 20)
    await e.reply("赞了噢喵~,可以..可以回我一下嘛o(*////▽////*)q~,没点上请加我好友再发【打卡】~")
    return true
}

