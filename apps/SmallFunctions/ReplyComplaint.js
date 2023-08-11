import {getComplaint} from '../../models/getString.js'
import common from '../../../../lib/common/common.js'
import {getQQ} from "../../models/getQQ.js";

export async function Complaint(e) {
    if ((e.atBot || e.atme) && !(e.original_msg || e.msg) && !e.source) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if (OpenStatus.SmallFunction !== 1) return false
        if (OpenStatus.Crazy !== 1) return false
        await ReplyComplaint(e)
        return true
    } else {
        let message = ((e.raw_message || e.msg || e.original_msg) + "").trim()
        if (message === '#发病' || message === '#发电' || message === '#发癫' || message === '#发疯') {
            let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
            if (OpenStatus.SmallFunction !== 1) return false
            if (OpenStatus.Crazy !== 1) return false
            await ReplyComplaint(e)
            return true
        }
        if (message.includes('#发病') || message.includes('#发电') || message.includes('#发癫') || message.includes('#发疯')) {
            let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
            if (OpenStatus.SmallFunction !== 1) return false
            if (OpenStatus.Crazy !== 1) return false
            let NickName = "喵喵喵~"
            if (await getQQ(e) !== null) {
                // let QQ = await getQQ(e)
                NickName = e.raw_message.replace(/#发病|#发电|#发癫|#发疯/g, '').trim() || e.at
                NickName = NickName.replace(/@/g, '').trim()
                await ReplyComplaint(e, true, NickName)
                return true
            }
            const match = /^#(发病|发电|发癫|发疯)(.*)$/.exec(message)
            if (!match) {
                return false
            }
            let [_, action, Name] = match;
            await ReplyComplaint(e, true, Name)
            return true
        }
        return false
    }
}

async function ReplyComplaint(e, More = false, NickName = "喵喵喵~") {
    logger.info(logger.magenta(`[FanSky_Qs]发病：${NickName}`));
    let Name
    if (More) {
        Name = NickName
    } else {
        Name = e.sender.card || e.sender.nickname || e.nickname || e.user_id
    }
    let Complaint = await getComplaint()
    let Reply = Complaint.replace(/{target_name}/g, "「 " + Name + " 」")
    if (Reply.length > 55) {
        let ReplyView = Reply.substring(0, 15)
        let MsgList = await QQMsg(Reply, Name)
        if (e.isGroup) {
            let ForwardMsg = await e.group.makeForwardMsg(MsgList)
            try{
                ForwardMsg.data = ForwardMsg.data
                    .replace(/\n/g, '')
                    .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
                    .replace(/___+/, `<title color="#777777" size="26">「${Name}」你知道吗，${ReplyView}</title>`)

            }catch (err){

            }
            // ForwardMsg.data = ForwardMsg.data.replace(/^<\?xml.*version=.*?>/g, '<?xml version="1.0" encoding="utf-8" ?>');
            await e.reply(ForwardMsg)
            try {
                await e.member.poke()
            } catch (err) {
                logger.info(logger.magenta(`[FanSky_Qs]发病：可能为频道，戳一戳失败`));
            }
        } else {
            await e.reply([await e.friend.makeForwardMsg(MsgList)])
        }
        return true
    } else {
        await e.reply(Reply)
        return true
    }
}

async function QQMsg(MsgList, Name) {
    let acgList = []
    let bot = {nickname: `「${Name}」,我喜欢你很久了`, user_id: Bot.uin}
    acgList.push(
        {
            message: [`${MsgList}`],
            ...bot,
        },
    )
    return acgList
}
