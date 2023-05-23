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
        let message = ((e.raw_message||e.msg || e.original_msg) + "").trim()
        if (message === '#发病' || message === '#发电' || message === '#发癫' || message === '#发疯') {
            let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
            if (OpenStatus.SmallFunction !== 1) return false
            if (OpenStatus.Crazy !== 1) return false
            await ReplyComplaint(e)
            return true
        }
        if (message.indexOf('#发病') !== -1 || message.indexOf('#发电') !== -1 || message.indexOf('#发癫') !== -1 || message.indexOf('#发疯') !== -1) {
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
    let Name
    if (More) {
        Name = NickName
    } else {
        Name = e.sender.card || e.sender.nickname || e.nickname || e.user_id
    }
    let Complaint = await getComplaint()
    let Reply = Complaint.replace(/{target_name}/g, "「 " + Name + " 」")
    if (Reply.length > 55) {
        let MsgList = await QQMsg(Reply, Name)
        if (e.isGroup) {
            await e.group.sendMsg([await e.group.makeForwardMsg(MsgList)])
            await e.member.poke()
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
    let bot = {nickname: `我喜欢你很久了「${Name}」,你知道吗`, user_id: Bot.uin}
    acgList.push(
        {
            message: [`${MsgList}`],
            ...bot,
        },
    )
    return acgList
}
