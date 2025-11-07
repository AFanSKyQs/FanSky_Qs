/* eslint-disable camelcase */
import fs from 'fs'
import getCfg from '../../models/getCfg.js'
import {ModelGPT3Turbo} from "./ModelGPT3Turbo.js";

let yunPath = process.cwd().replace(/\\/g, "/")
let _path = `${process.cwd()}/resources/FanSky`
let path = `${process.cwd()}/resources/FanSky/SignIn.json`
let path_SignTop = `${process.cwd()}/resources/FanSky/SignTop.json`
let OpenAIConfig = yunPath + '/plugins/FanSky_Qs/config/config.json'

export async function UseModel(e, Prefix = false) {
    // if (e.message[0].type !== "at") {
    //     return false
    // }
    // if (e.message[1].type !== "text") {
    //     return false
    // }

    if (!e.isGroup && !e.isMaster) {
        return false
    }
    if ((e.msg + "").startsWith('#dd')) {
        // 处理以 #dd 开头的消息，不论是否艾特机器人
        // ...

    } else if ((e.msg + "").startsWith('#')) {
        // 以 # 开头但不是以 #dd 开头的消息不处理
        return false;
    } else if (e.atBot || e.atme) {
        // 艾特机器人的消息处理
        // ...
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if (OpenStatus.AtTalk !== 1) return false
    } else {
        return false; // 其他消息不处理
    }
    if (!e.msg || (e.msg + "").trim() === "") {
        return false
    }
    const Json = await getCfg(yunPath, 'config')
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
        await fs.writeFileSync(`${yunPath}/plugins/FanSky_Qs/config/config.json`, JSON.stringify(Json))
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
        // e.reply('伱被禁止与我聊天了呜呜（；へ：）~')
        console.log('\nAI对话黑名单：' + e.user_id)
        return false
    }

    if (await redis.get(`FanSky:OpenAI:Status:${e.user_id}`)) {
        await e.reply('AI正在处理柠上一个请求噢~\n请耐心等待喵QWQ~', true)
        return {wait: true}
    }

    let GetResult = '不限'
    if (Json.SignMode === '开启') {
        GetResult = await SingIn(e)
        console.log('GetResult:' + GetResult)
        if (!GetResult || GetResult === true || GetResult === 'true') {
            return false
        }
    }
    if (Json.Model === 1) {
        await ModelGPT3Turbo(e, OpenAI_Key, Json, GetResult)
    } else if (Json.Model === 2) {
        e.reply("其他模型已被移除，目前仅【1】模型可用：gpt-3.5")
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
