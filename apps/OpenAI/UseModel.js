/* eslint-disable camelcase */
import fs from 'fs'
import getCfg from '../../models/getCfg.js'
import {ModelGPT3Turbo} from "./ModelGPT3Turbo.js";

let yunPath = process.cwd().replace(/\\/g, "/")
let _path = `${process.cwd()}/resources/FanSky`
let path = `${process.cwd()}/resources/FanSky/SignIn.json`
let path_SignTop = `${process.cwd()}/resources/FanSky/SignTop.json`
let OpenAIConfig = yunPath + '/plugins/FanSky_Qs/config/OpenAI.json'
let MoudelStatus = []

export async function UseModel(e) {
    // if (e.message[0].type !== "at") {
    //     return false
    // }
    // if (e.message[1].type !== "text") {
    //     return false
    // }

    if (!e.isGroup && !e.isMaster) {
        return false
    }
    if (/^#/.test(e.msg)) {
        // e.reply("如果是想与AI对话\n请不要在开头输入#\n【这一般是指令】\n\n如果是指令请不要艾特机器人\n【艾特一般是与机器人对话】", true)
        return false
    }
    if (!e.atBot && !e.atme) return false
    if (!e.msg) {
        return false
    }
    const Json = await getCfg(yunPath, 'OpenAI')
    if (!e.isPrivate) {
        let GroupIndex = Json.OpenAIGroup.indexOf((e.group_id).toString())
        console.log(GroupIndex)
        if (GroupIndex !== -1) {
        } else if (Json.OpenAIGroup.length === 0) {
        } else {
            return false
        }
    }
    if (!Json.OnOff) {
        Json.OnOff = "开启"
        await fs.writeFileSync(`${yunPath}/plugins/FanSky_Qs/config/OpenAI.json`, JSON.stringify(Json))
    }
    if (Json.OnOff === "关闭") {
        return false
    }
    const OpenAI_Key = Json.OpenAI_Key
    if (OpenAI_Key === '这里填入你的OpenAI密钥即可' || !OpenAI_Key || OpenAI_Key === '') {
        logger.info(logger.cyan('没有OpenAI密钥喵，可发送#设置模型key sk-xxxxxxx来设置密钥喵~'))
        // e.reply("要与OpenAI聊天吗喵qwq,请先在FanSky_Qs/config/OpenAI中填写你的OpenAI_Key")
        return false
    }
    const BlackList = Json.BlackList // [123, 456] 黑名单列表
    if (BlackList.includes(e.user_id)) {
        e.reply('伱被禁止与我聊天了呜呜（；へ：）~', true)
        console.log('\nAI对话黑名单：' + e.user_id)
        return true
    }
    if (MoudelStatus[e.user_id]) {
        e.reply('AI正在处理柠上一个请求噢~', true)
        return true
    }
    let GetResult = '不限'
    if (Json.SignMode === '开启') {
        GetResult = await SingIn(e)
        console.log('GetResult:' + GetResult)
        if (!GetResult || GetResult === true || GetResult === 'true') {
            return true
        }
    }
    if (Json.Model === 1) {
        await ModelGPT3Turbo(e, OpenAI_Key, Json, GetResult)
        // delete MoudelStatus[e.user_id]
    } else if (Json.Model === 2) {
        e.reply("其他模型已被移除，目前仅【1】模型可用：gpt-3.5")
        // delete MoudelStatus[e.user_id]
    }
    return true
}

async function SingIn(e) {
    if (!fs.existsSync(_path)) {
        console.log('已创建FanSky文件夹')
        fs.mkdirSync(_path)
    }
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, '{}')
        console.log('已创建SignIn.json文件')
    }
    if (!fs.existsSync(path_SignTop)) {
        fs.writeFileSync(path_SignTop, '{}')
        console.log('已创建SignTop.json文件')
    }
    let SignDay = JSON.parse(fs.readFileSync(path))
    if (!SignDay[e.user_id]) {
        e.reply('没有您的打卡记录\n请发送[打卡/冒泡]来打卡\n获取魔晶以进行对话')
        return true
    }
    if (SignDay[e.user_id].rough < 8 && !e.isMaster) {
        e.reply(`您的[魔晶]：${SignDay[e.user_id].rough}\n少于8，已无法进行对话\n攒攒魔晶吧喵~`)
        return true
    }
    if (!e.isMaster) {
        SignDay[e.user_id].rough -= 8
    }
    fs.writeFileSync(path, JSON.stringify(SignDay))
    return SignDay[e.user_id].rough
}
