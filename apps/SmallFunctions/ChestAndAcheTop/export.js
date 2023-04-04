import {getChestAndAchieve} from "../../../models/getTuImg.js";
import axios from "axios";
import puppeteer from "../../../../../lib/puppeteer/puppeteer.js"
import path from "path"
import fs from "fs"

let chestTopPath = `${process.cwd()}/data/FanSky_Qs/Top/ChestTop.json`
const achieveTopPath = `${process.cwd()}/data/FanSky_Qs/Top/ChestTop.json`;

export async function uidGet(e) {
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

export async function toImgSend(e, type, uid, signature, level, Name, JsonRes) {
    let toImg
    let CssPath = `${process.cwd()}/plugins/FanSky_Qs/resources/ChestAchieveTop/`
    let AchieveHtmlPath = `${process.cwd()}/plugins/FanSky_Qs/resources/ChestAchieveTop/achieve.html`
    let ChestHtmlPath = `${process.cwd()}/plugins/FanSky_Qs/resources/ChestAchieveTop/chest.html`
    let bg = await getChestAndAchieve()
    if (type === "Chest") {
        console.log("bg:" + bg)
        if (e.isGroup) {
            const dirPath = path.dirname(achieveTopPath);
            fs.mkdirSync(dirPath, {recursive: true});
            if (!fs.existsSync(achieveTopPath)) fs.writeFileSync(achieveTopPath, '{}');
            let Json = JSON.parse(fs.readFileSync(achieveTopPath, 'utf-8'));
            if (!Json[e.group_id]) {
                Json[e.group_id] = {}
            }
            if (!Json[e.group_id][e.user_id]) Json[e.group_id][e.user_id] = JsonRes.data[0]
            Json[e.group_id][e.user_id].uid = uid
            Json[e.group_id][e.user_id].nickname = signature
            await fs.writeFileSync(achieveTopPath, JSON.stringify(Json))
            e.reply("你可以通过【#宝箱排行榜】查看群内数据了(已更新的)", true)
        }
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
        await redis.set(`FanSky:SmallFunctions:ChestTop:${e.user_id}`, 1)
        await redis.expire(`FanSky:SmallFunctions:ChestTop:${e.user_id}`, 80)
    }
    if (type === "Achieve") {
        console.log("bg:" + bg)
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
        await redis.set(`FanSky:SmallFunctions:AchieveTop:${e.user_id}`, 1)
        await redis.expire(`FanSky:SmallFunctions:AchieveTop:${e.user_id}`, 80)
    }
    await e.reply(toImg)
    await new Promise(resolve => setTimeout(resolve, 5000));
    return true
}

export async function axiosRequest(uid) {
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