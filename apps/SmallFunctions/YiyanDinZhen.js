import fs from "fs";
import {segment} from "oicq";
import {QQGuildImg} from "../../models/QQGuildMsg.js";

let DinZhen_Path = `${process.cwd()}/plugins/FanSky_Qs/resources/YiyanDinzhen/img/`

export async function YiyanDinZhen(e) {
    let img = DinZhen_Path + fs.readdirSync(DinZhen_Path)[Math.floor(Math.random() * fs.readdirSync(DinZhen_Path).length)]
    if (e.guild_id) {
        logger.info(logger.cyan("[FanSky_Qs]频道消息[一眼丁真]"))
        await QQGuildImg(e, img)
    } else {
        await e.reply(segment.image(`file:///${img}`), true)
    }
    return true
}
