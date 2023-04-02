import {addTu, getTuNum, sendTu} from "./export.js";

const LongTu_path = `${process.cwd()}/plugins/FanSky_Qs/resources/GitImg/UsersImg/LongTu`
let gitPath = `${process.cwd()}/plugins/FanSky_Qs/resources/GitImg/gitLong/LongTu`

export async function sendLongTuNum(e) {
    await getTuNum(e, LongTu_path, '龙', gitPath)
    return true
}

export async function sendLongTu(e) {
    await sendTu(e, LongTu_path, '龙', gitPath)
    return true
}

export async function addLongTuSend(e) {
    await addTu(e, LongTu_path, '龙', gitPath)
    return true
}