import fs from "fs";
import {segment} from "oicq";
import {QQGuildImg} from "../../models/QQGuildMsg.js";

let CxkEmo = `${process.cwd()}/plugins/FanSky_Qs/resources/SmallFunction/AT_Xiaozuo7_CxkEmo/CxkImg/`

export async function AT_Xiaozuo7_CxkEmo(e) {
    let img = CxkEmo + fs.readdirSync(CxkEmo)[Math.floor(Math.random() * fs.readdirSync(CxkEmo).length)]
    if (e.guild_id) {
        logger.info(logger.cyan("[FanSky_Qs]频道消息[小黑子]"))
        await QQGuildImg(e, img)
    } else {
        await e.reply(segment.image(`file:///${img}`), true)
    }
    return true
}