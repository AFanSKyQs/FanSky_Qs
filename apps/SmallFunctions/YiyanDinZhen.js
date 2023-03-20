import fs from "fs";
import {segment} from "oicq";
let DinZhen_Path = `${process.cwd()}/plugins/FanSky_Qs/resources/YiyanDinzhen/img/`
export async function YiyanDinZhen(e) {
    let img = DinZhen_Path + fs.readdirSync(DinZhen_Path)[Math.floor(Math.random() * fs.readdirSync(DinZhen_Path).length)]
    await e.reply(segment.image(`file:///${img}`), true)
    return true
}
