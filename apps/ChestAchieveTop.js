/* eslint-disable camelcase */
import puppeteer from "../../../lib/puppeteer/puppeteer.js"
import plugin from '../../../lib/plugins/plugin.js'
import axios from "axios";
import {getChestAndAchieve} from "../models/getTuImg.js";

let Achievement = []
let Chest = []

export class ChestAchieveTop extends plugin {
    constructor() {
        super({
            name: '宝箱成就排行',
            dsc: '宝箱成就排行',
            event: 'message',
            priority: 1,
            rule: [
                {
                    reg: '^#?(查|look|看)?成就(排行|排名|查询|统计)?(.*)$',
                    fnc: 'AchievementTop'
                }, {
                    reg: '^#?(查|look|看)?宝箱(排行|排名|查询|统计)?(.*)$',
                    fnc: 'ChestTop'
                },
                {
                    reg: '^#宝箱(.*)$',
                    fnc: 'ChestTop'
                }
            ]
        })
    }

    async axiosRequest(uid) {
        let Name = '出厂设置'
        let level = 'NaN..?'
        let signature = "w太懒了！没有签名喵~"
        let ServerError = "该服接口正在维护"
        try {
            await axios({
                method: 'get',
                url: `http://enka.network/api/uid/${uid}?info`,
                headers: {
                    'Content-Type': 'application/json',
                    // Accept: 'application/json',
                },
                timeout: 10000
            }).then(async function (response) {
                // console.log(response)
                // console.log(response.data)
                if (!(response.status === 200)) {
                    console.log(response)
                    return
                }
                if (!response.data.playerInfo) {
                    console.log(response)
                    return
                }
                Name = response.data.playerInfo.nickname
                level = response.data.playerInfo.level
                if (response.data.playerInfo.signature) {
                    signature = response.data.playerInfo.signature
                }
            }).catch(function (error) {
                if (error.toString().includes("status code 424")) {
                    console.log("该服接口正在维护")
                    Name = ServerError
                    level = ServerError
                    signature = ServerError
                    return
                }
                if (error.toString().includes("timeout")) {
                    console.log("请求超时惹")
                    Name = "超时惹·"
                    level = "超时惹~"
                    signature = "超时惹~"
                }
            })
        } catch (err) {
            console.log("请求出错惹")
            console.log(err)
            Name = "Error惹·"
            level = "Error惹~"
            signature = "Error惹~"
        }
        return {Name, level, signature}
    }

    async AchievementTop(e) {
        if (Achievement[e.user_id] && !e.isMaster) {
            e.reply("成就排行CD：80s/一次喵~")
            return true
        }
        Achievement[e.user_id] = true
        let uid = await this.uidGet(e)
        if (!uid) {
            e.reply('请先绑定uid 或 在指令后面加你要查询的uid')
            return true
        }
        uid = parseInt(uid)
        let url = `https://feixiaoqiu.com/search_achievement_ajax/?draw=1&columns[0][data]=total_index_div()&columns[0][name]=&columns[0][searchable]=true&columns[0][orderable]=false&columns[0][search][value]=&columns[0][search][regex]=false&columns[1][data]=nick_name_div()&columns[1][name]=&columns[1][searchable]=true&columns[1][orderable]=false&columns[1][search][value]=&columns[1][search][regex]=false&columns[2][data]=title_div()&columns[2][name]=&columns[2][searchable]=true&columns[2][orderable]=false&columns[2][search][value]=&columns[2][search][regex]=false&columns[3][data]=grade_div()&columns[3][name]=&columns[3][searchable]=true&columns[3][orderable]=false&columns[3][search][value]=&columns[3][search][regex]=false&columns[4][data]=achievement_number_div()&columns[4][name]=&columns[4][searchable]=true&columns[4][orderable]=false&columns[4][search][value]=&columns[4][search][regex]=false&start=0&length=20&search[value]=&search[regex]=false&uid=${uid}&_=1774705299791`

        // node-fetch
        // let res = await fetch(url).catch((err) => logger.error(err))
        // if (!res) {
        //     logger.error('[成就排行] 接口请求失败！')
        //     return e.reply('成就排行接口请求失败~')
        // }
        // let Json_Res = await res.json()

        let Json_Res
        try {
            const response = await axios.get(url)
            Json_Res = response.data
        } catch (error) {
            logger.error('[成就排行] 接口请求失败！')
            e.reply('成就排行接口请求失败~')
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
        setTimeout(async () => {
            delete Achievement[e.user_id]
        }, 80000)
        console.log(JsonRes)
        if (JsonRes.data.length > 0) {
            JsonRes.data[0].title = unescape(JsonRes.data[0].title.replace(/\\u/g, '%u'))
            let {Name, level, signature} = await this.axiosRequest(uid)

            // let Msg = [`UID：${uid}\n`, `个性签名：${signature}\n`, `冒险等级：${level}\n`, `游戏昵称：${Name} \n`, `达成成就:【${JsonRes.data[0].achievement_number}】/892个\n`, `官哔排行：第${JsonRes.data[0].total_index}名\n`, `排名分数：${JsonRes.data[0].grade}\n图像渲染正在施工中~`]
            // e.reply(Msg)

            await this.toImgSend(e,"Achieve", uid, signature, level, Name, JsonRes)
            return true
        } else {
            e.reply(`uid:${uid}没有匹配的数据，可能是米游社权限未开放或者为国际服uid喵~`)
            return true
        }
    }

    async ChestTop(e) {
        if (Chest[e.user_id]) {
            e.reply("宝箱排行CD：80s/一次喵~")
            return true
        }
        Chest[e.user_id] = true
        let uid = await this.uidGet(e)
        if (!uid) {
            e.reply('请先绑定uid 或 在指令后面加你要查询的uid')
            return true
        }
        uid = parseInt(uid)
        let url = `https://feixiaoqiu.com/search_box_ajax/?draw=1&columns[0][data]=total_index_div()&columns[0][name]=&columns[0][searchable]=true&columns[0][orderable]=false&columns[0][search][value]=&columns[0][search][regex]=false&columns[1][data]=nick_name_div()&columns[1][name]=&columns[1][searchable]=true&columns[1][orderable]=false&columns[1][search][value]=&columns[1][search][regex]=false&columns[2][data]=title_div()&columns[2][name]=&columns[2][searchable]=true&columns[2][orderable]=false&columns[2][search][value]=&columns[2][search][regex]=false&columns[3][data]=grade_div()&columns[3][name]=&columns[3][searchable]=true&columns[3][orderable]=false&columns[3][search][value]=&columns[3][search][regex]=false&columns[4][data]=box_div()&columns[4][name]=&columns[4][searchable]=true&columns[4][orderable]=false&columns[4][search][value]=&columns[4][search][regex]=false&columns[5][data]=total_box_div()&columns[5][name]=&columns[5][searchable]=true&columns[5][orderable]=false&columns[5][search][value]=&columns[5][search][regex]=false&columns[6][data]=luxurious_div()&columns[6][name]=&columns[6][searchable]=true&columns[6][orderable]=false&columns[6][search][value]=&columns[6][search][regex]=false&columns[7][data]=precious_div()&columns[7][name]=&columns[7][searchable]=true&columns[7][orderable]=false&columns[7][search][value]=&columns[7][search][regex]=false&columns[8][data]=exquisite_div()&columns[8][name]=&columns[8][searchable]=true&columns[8][orderable]=false&columns[8][search][value]=&columns[8][search][regex]=false&columns[9][data]=common_div()&columns[9][name]=&columns[9][searchable]=true&columns[9][orderable]=false&columns[9][search][value]=&columns[9][search][regex]=false&start=0&length=20&search[value]=&search[regex]=false&uid=${uid}&_=1684712560846`

        //node-fetch
        // let res = await fetch(url).catch((err) => logger.error(err))
        // if (!res) {
        //     logger.error('[宝箱排行] 接口请求失败！')
        //     return e.reply('宝箱排行接口请求失败~')
        // }
        // let Json_Res = await res.json()

        let Json_Res
        try {
            const response = await axios.get(url)
            Json_Res = response.data
        } catch (error) {
            logger.error('[成就排行] 接口请求失败！')
            e.reply('成就排行接口请求失败~')
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
        setTimeout(async () => {
            delete Chest[e.user_id]
        }, 80000)
        if (JsonRes.data.length > 0) {
            JsonRes.data[0].title = unescape(JsonRes.data[0].title.replace(/\\u/g, '%u'))
            let {Name, level, signature} = await this.axiosRequest(uid)


            // let Msg = [`UID：${uid}\n`, `个性签名：${signature}\n`, `冒险等级：${level}\n`, `游戏昵称：${Name} \n`, `宝箱总计:【${JsonRes.data[0].total_box}】个\n`, `官哔排行：第${JsonRes.data[0].total_index}名\n`, `排名分数：${JsonRes.data[0].grade}\n`, `华丽/珍贵/精致/普通：\n${JsonRes.data[0].luxurious}/${JsonRes.data[0].precious}/${JsonRes.data[0].exquisite}/${JsonRes.data[0].common}\n图像渲染正在施工中~`]
            // e.reply(Msg)

            await this.toImgSend(e, "Chest", uid, signature, level, Name, JsonRes)
            return true
        } else {
            e.reply(`uid:${uid}没有匹配的数据，可能是米游社权限未开放或者为国际服uid喵~`)
            return true
        }
    }

    async toImgSend(e, type, uid, signature, level, Name, JsonRes) {
        let toImg
        let CssPath = `${process.cwd()}/plugins/FanSky_Qs/resources/ChestAchieveTop/`
        let AchieveHtmlPath = `${process.cwd()}/plugins/FanSky_Qs/resources/ChestAchieveTop/achieve.html`
        let ChestHtmlPath = `${process.cwd()}/plugins/FanSky_Qs/resources/ChestAchieveTop/chest.html`
        let bg=await getChestAndAchieve()
        if (type === "Chest") {
            let ChestHtml = {
                uid: uid,
                name: Name,
                nickname: signature,
                allchest: JsonRes.data[0].total_box,
                top: JsonRes.data[0].total_index,
                Achest: JsonRes.data[0].luxurious,
                Bchest: JsonRes.data[0].precious,
                Cchest: JsonRes.data[0].exquisite,
                Dchest: JsonRes.data[0].common,
                title: JsonRes.data[0].title,
                score: JsonRes.data[0].grade,
                user_img: `https://q1.qlogo.cn/g?b=qq&nk=${e.user_id}&s=160`,
                AcgBg: bg
            }
            toImg = await puppeteer.screenshot("ChestTop", {tplFile: ChestHtmlPath, quality: 100, CssPath, ChestHtml});
        }
        if (type === "Achieve") {
            let AchieveHtml = {
                uid: uid,
                name: Name,
                nickname: signature,
                allAc: JsonRes.data[0].achievement_number,
                top: JsonRes.data[0].total_index,
                title: JsonRes.data[0].title,
                score: JsonRes.data[0].grade,
                user_img: `https://q1.qlogo.cn/g?b=qq&nk=${e.user_id}&s=160`,
                AcgBg: bg
            }
            toImg = await puppeteer.screenshot("AchieveTop", {
                tplFile: AchieveHtmlPath,
                quality: 100,
                CssPath,
                AchieveHtml
            });
        }
        await e.reply(toImg)
        return true
    }

    async uidGet(e) {
        // 使用require引入其他文件的方法
        let msg = e.original_msg || e.msg
        if (!msg) {
            return false
        }
        let uidRet = /[0-9]{9}/.exec(msg)
        let UID
        if (uidRet) {
            UID = uidRet[0]
            console.log('输入的uid为：' + UID)
            // msg = msg.replace(uidRet[0], '')
        }
        let NoteUser = e.user
        let NoteUid = NoteUser._regUid
        return UID || NoteUid
    }
}
