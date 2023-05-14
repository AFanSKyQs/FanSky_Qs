import {getComplaint} from '../../models/getString.js'
import common from '../../../../lib/common/common.js'

export async function Complaint(e) {
    if ((e.atBot || e.atme) && !(e.original_msg || e.msg) && !e.source) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if (OpenStatus.SmallFunction !== 1) return false
        if (OpenStatus.Crazy !== 1) return false
        await ReplyComplaint(e)
        return true
    } else if (e.msg === '#发病' || e.msg === '#发电' || e.msg === '#发癫' || e.msg === '#发疯') {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if (OpenStatus.SmallFunction !== 1) return false
        if (OpenStatus.Crazy !== 1) return false
        await ReplyComplaint(e)
        return true
    } else {
        return false
    }
}

async function ReplyComplaint(e) {
    let Name = e.sender.nickname || e.sender.card || e.nickname || e.user_id
    let Complaint = await getComplaint()
    let Reply = Complaint.replace(/{target_name}/g, "「 "+Name+" 」")
    // if (Reply.length > 110) {
    //     let MsgList = [`${Reply}`]
    //     let SendResult = await common.makeForwardMsg(e, MsgList, `${Name},嘿嘿嘿,我的${Name}(流口水)~`)
    //     await e.reply(SendResult)
    //     return true
    // } else {
    //     await e.reply(Reply, false, {recallMsg: 30})
    //     return true
    // }
    await e.reply(Reply)
    return true
}
