import {addTu, getTuNum, sendTu} from "./export.js";

const DioTu_path = `${process.cwd()}/plugins/FanSky_Qs/resources/GitImg/UsersImg/DiaoTu`
let gitPath = `${process.cwd()}/plugins/FanSky_Qs/resources/GitImg/gitDio/DioTu`

export async function sendDioTu(e) {
    await sendTu(e, DioTu_path, '弔', gitPath)
    return true
}

export async function sendDioTuNum(e) {
    await getTuNum(e, DioTu_path, '弔', gitPath)
    return true
}


export async function addDioTuSend(e) {
    await addTu(e, DioTu_path, '弔', gitPath)
    return true
}