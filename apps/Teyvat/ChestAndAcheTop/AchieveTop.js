import axios from "axios";
import {axiosRequest, toImgSend, uidGet} from "./export.js";
import {getLocalUserData} from "../../../models/getLocalUserData.js";


export async function AchievementTop(e) {
    if (await redis.get(`FanSky:SmallFunctions:AchieveTop:${e.user_id}`)) {
        let CD = await redis.ttl(`FanSky:SmallFunctions:AchieveTop:${e.user_id}`)
        e.reply(`请等待${CD}s后再请求~`, true)
        return false
    }
    let uid = await uidGet(e)
    if (!uid) {
        e.reply('请先绑定uid 或 在指令后面加你要查询的uid')
        return true
    }
    uid = parseInt(uid)
    let url = `https://feixiaoqiu.com/search_achievement_ajax/?draw=1&columns[0][data]=total_index_div()&columns[0][name]=&columns[0][searchable]=true&columns[0][orderable]=false&columns[0][search][value]=&columns[0][search][regex]=false&columns[1][data]=nick_name_div()&columns[1][name]=&columns[1][searchable]=true&columns[1][orderable]=false&columns[1][search][value]=&columns[1][search][regex]=false&columns[2][data]=title_div()&columns[2][name]=&columns[2][searchable]=true&columns[2][orderable]=false&columns[2][search][value]=&columns[2][search][regex]=false&columns[3][data]=grade_div()&columns[3][name]=&columns[3][searchable]=true&columns[3][orderable]=false&columns[3][search][value]=&columns[3][search][regex]=false&columns[4][data]=achievement_number_div()&columns[4][name]=&columns[4][searchable]=true&columns[4][orderable]=false&columns[4][search][value]=&columns[4][search][regex]=false&start=0&length=20&search[value]=&search[regex]=false&uid=${uid}&_=1774705299791`
    let Json_Res
    try {
        const response = await axios.get(url)
        Json_Res = response.data
    } catch (error) {
        logger.error('[成就排行] 接口请求失败！')
        e.reply('成就排行接口请求失败~\n尝试读取${uid}本地[ #角色 ]数据')
        await ReadLocalData(e, uid)
        return true
    }

    let StringJson = JSON.stringify(Json_Res)
    StringJson = StringJson.replace(/\r/g, '')
    StringJson = StringJson.replace(/\n/g, '')
    StringJson = StringJson.replace(/\t/g, '')
    StringJson = StringJson.replace(/\s/g, '')
    StringJson = StringJson.replace(/\\\"/g, '"')
    StringJson = StringJson.replace(/\\n/g, '')
    StringJson = StringJson.substring(1, StringJson.length - 1)
    let JsonRes = JSON.parse(StringJson)
    console.log(JsonRes)
    if (JsonRes.data.length > 0) {
        JsonRes.data[0].title = unescape(JsonRes.data[0].title.replace(/\\u/g, '%u'))
        let {Name, level, signature} = await axiosRequest(uid)
        let LocalChestData = await getLocalUserData(e, uid)
        if (!LocalChestData) {
        } else {
            if (JsonRes.data[0].achievement_number < LocalChestData.info.stats.achievement) {
                JsonRes.data[0].total_index = JsonRes.data[0].total_index + `(${JsonRes.data[0].achievement_number})`
                JsonRes.data[0].achievement_number = LocalChestData.info.stats.achievement
            }
        }
        await toImgSend(e, "Achieve", uid, signature, level, Name, JsonRes)
        return true
    } else {
        e.reply(`uid:${uid}没有匹配的数据，可能是米游社权限未开放或者为国际服uid喵~\n尝试读取${uid}本地[ #角色 ]数据`)
        await ReadLocalData(e, uid)
        return true
    }
}

async function ReadLocalData(e, uid) {
    let LocalChestData = await getLocalUserData(e, uid)
    if (!LocalChestData) {
        e.reply(`没有找到${uid}的本地数据~`)
        return true
    }
    if (LocalChestData.info && LocalChestData.info.length > 0) {
        let JsonRes = {
            data: [
                {
                    "achievement_number": LocalChestData.info.stats.achievement,
                    "total_index": "本地数据",
                    "nick_name": LocalChestData.info.stats.name,
                    "hide_name": 0,
                    "title": "本地数据",
                    "grade": "本地数据",
                    "uid": uid,
                    "nickname": LocalChestData.info.stats.sign,
                },
            ]
        }
        let {Name, level, signature} = {
            Name: LocalChestData.name,
            level: LocalChestData.level,
            signature: LocalChestData.sign
        }
        await toImgSend(e, "Achieve", uid, signature, level, Name, JsonRes)
    } else {
        e.reply("您的本地[ #角色 ]数据也为空", true)
        return true
    }
}


