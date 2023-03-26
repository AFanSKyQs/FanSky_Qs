import fs from "fs";
import {segment} from "oicq";

let CxkEmo = `${process.cwd()}/plugins/FanSky_Qs/resources/SmallFunction/AT_Xiaozuo7_CxkEmo/CxkImg/`

export async function AT_Xiaozuo7_CxkEmo(e) {
    let img = CxkEmo + fs.readdirSync(CxkEmo)[Math.floor(Math.random() * fs.readdirSync(CxkEmo).length)]
    await e.reply(segment.image(`file:///${img}`), true)
    return true
}