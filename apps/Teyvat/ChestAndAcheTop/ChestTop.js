import axios from "axios";
import {axiosRequest, toImgSend, uidGet} from "./export.js";
import {getLocalUserData} from "../../../models/getLocalUserData.js";

async function ChestTop(e) {
    if (await redis.get(`FanSky:SmallFunctions:ChestTop:${e.user_id}`)) {
        let CD = await redis.ttl(`FanSky:SmallFunctions:ChestTop:${e.user_id}`)
        e.reply(`请等待${CD}s后再请求~`, true)
        return false
    }
    let uid = await uidGet(e)
    if (!uid) {
        e.reply('请先绑定uid 或 在指令后面加你要查询的uid')
        return true
    }
    uid = parseInt(uid)
    let url = `https://feixiaoqiu.com/search_box_ajax/?draw=1&columns[0][data]=total_index_div()&columns[0][name]=&columns[0][searchable]=true&columns[0][orderable]=false&columns[0][search][value]=&columns[0][search][regex]=false&columns[1][data]=nick_name_div()&columns[1][name]=&columns[1][searchable]=true&columns[1][orderable]=false&columns[1][search][value]=&columns[1][search][regex]=false&columns[2][data]=title_div()&columns[2][name]=&columns[2][searchable]=true&columns[2][orderable]=false&columns[2][search][value]=&columns[2][search][regex]=false&columns[3][data]=grade_div()&columns[3][name]=&columns[3][searchable]=true&columns[3][orderable]=false&columns[3][search][value]=&columns[3][search][regex]=false&columns[4][data]=box_div()&columns[4][name]=&columns[4][searchable]=true&columns[4][orderable]=false&columns[4][search][value]=&columns[4][search][regex]=false&columns[5][data]=total_box_div()&columns[5][name]=&columns[5][searchable]=true&columns[5][orderable]=false&columns[5][search][value]=&columns[5][search][regex]=false&columns[6][data]=luxurious_div()&columns[6][name]=&columns[6][searchable]=true&columns[6][orderable]=false&columns[6][search][value]=&columns[6][search][regex]=false&columns[7][data]=precious_div()&columns[7][name]=&columns[7][searchable]=true&columns[7][orderable]=false&columns[7][search][value]=&columns[7][search][regex]=false&columns[8][data]=exquisite_div()&columns[8][name]=&columns[8][searchable]=true&columns[8][orderable]=false&columns[8][search][value]=&columns[8][search][regex]=false&columns[9][data]=common_div()&columns[9][name]=&columns[9][searchable]=true&columns[9][orderable]=false&columns[9][search][value]=&columns[9][search][regex]=false&start=0&length=20&search[value]=&search[regex]=false&uid=${uid}&_=1684712560846`
    let Json_Res
    try {
        const response = await axios.get(url)
        Json_Res = response.data
    } catch (error) {
        logger.error('[宝箱排行] 接口请求失败！')
        await e.reply(`宝箱排行接口请求失败~\n尝试读取${uid}本地[ #角色 ]数据`)
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
    Bot.logger.info(JsonRes)
    if (JsonRes.data.length > 0) {
        JsonRes.data[0].title = unescape(JsonRes.data[0].title.replace(/\\u/g, '%u'))
        let {Name, level, signature} = await axiosRequest(uid)
        await toImgSend(e, "Chest", uid, signature, level, Name, JsonRes)
        return true
    } else {
        await e.reply(`uid:${uid}没有匹配的数据，可能是米游社权限未开放或者为国际服uid喵~\n尝试读取${uid}本地[ #角色 ]数据`)
        await ReadLocalData(e, uid)
        return true
    }
}

async function ReadLocalData(e, uid) {
    let LocalChestData = await getLocalUserData(e, uid)
    if (!LocalChestData) {
        await e.reply(`没有找到${uid}的本地数据~`)
        return true
    }
    let Status = LocalChestData.info
    if (Status && Object.keys(Status).length > 0) {
        try {
            let TotalChest = Status.stats.luxuriousChest + Status.stats.preciousChest + Status.stats.exquisiteChest + Status.stats.commonChest
            let CaclBegin = await Q_cacl(Status.stats.luxuriousChest, Status.stats.preciousChest, Status.stats.exquisiteChest, Status.stats.commonChest)
            let Score = calculateY3(CaclBegin)
            let JsonRes = {
                data: [
                    {
                        box: "本地数据",
                        title: "本地数据",
                        total_box: TotalChest,
                        grade: Score,
                        total_index: "本地数据",
                        luxurious: Status.stats.luxuriousChest,
                        precious: Status.stats.preciousChest,
                        exquisite: Status.stats.exquisiteChest,
                        common: Status.stats.commonChest,
                        uid: uid,
                        nickname: LocalChestData.sign
                    }
                ]
            }
            let {Name, level, signature} = {
                Name: LocalChestData.name,
                level: LocalChestData.level,
                signature: LocalChestData.sign
            }
            await toImgSend(e, "Chest", uid, signature, level, Name, JsonRes)
        } catch (err) {
            Bot.logger.info(Status)
        }
    } else {
        Bot.logger.info(Status)
        await e.reply("您的本地[ #角色 ]数据也为空", true)
        return true
    }
}

async function Q_cacl(calcA, calcB, calcC, calcD) {
    let A = 0.9028, B = 0.0683, C = 0.0208, D = 0.0081
    let a = calcA, b = calcB, c = calcC, d = calcD
    let All_a = 185, All_b = 486, All_c = 1596, All_d = 2547
    let Q_sum = a / All_a * A + b / All_b * B + c / All_c * C + d / All_d * D
    return Q_sum
}

function calculateY3(x) {
    const a = 138691.296704388;
    const b = -1339947.56772589;
    const c = 5389544.47894393;
    const d = -11353458.0517414;
    const e = 12115264.4925049;
    const f = -2266146.54178447;
    const g = -10540289.0388717;
    const h = 13994887.1972744;
    const i = -8293415.19130523;
    const j = 2433926.22137088;
    const k = -278957.333386943;

    const X2 = Math.pow(x, 2);
    const X3 = Math.pow(x, 3);
    const X4 = Math.pow(x, 4);
    const X5 = Math.pow(x, 5);
    const X6 = Math.pow(x, 6);
    const X7 = Math.pow(x, 7);
    const X8 = Math.pow(x, 8);
    const X9 = Math.pow(x, 9);
    const X10 = Math.pow(x, 10);

    const Y = a + b * x + c * X2 + d * X3 + e * X4 + f * X5 + g * X6 + h * X7 + i * X8 + j * X9 + k * X10;

    return Y.toFixed(3);
}

export default ChestTop