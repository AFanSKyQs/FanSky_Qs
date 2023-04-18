import fs from "fs"
import _ from "lodash"
import puppeteer from "../../../../../lib/puppeteer/puppeteer.js"
import {getVersionInfo} from "../../../models/getVersion.js";

let cwd = process.cwd().replace(/\\/g, '/')
const ChestTopPath = `${process.cwd()}/data/FanSky_Qs/Top/ChestTop.json`;
let CssPath = `${process.cwd()}/plugins/FanSky_Qs/resources/ChestAchieveTop/`

export async function ChestGroupTop(e) {
    const data = await JSON.parse(fs.readFileSync(ChestTopPath, 'utf-8'));
    const sortedData = _(data[e.group_id])
        .map((value, key) => ({qq: key, ...value}))
        .orderBy('grade', 'desc')
        .slice(0, 15)
        .value();
    const rankedData = sortedData.map((value, index) => ({...value, rank: index + 1}));
    let top3 = rankedData.slice(0, 3);
    let Length=3-top3.length
    if (top3.length < 3) {
        for (let i = 0; i < 3 - Length; i++) {
            top3.push({
                "box": 0,
                "total_index": 999999,
                "nick_name": "100000000",
                "hide_name": 0,
                "title": "虚位以待",
                "total_box": 0,
                "grade": i / 100,
                "luxurious": 0,
                "precious": 0,
                "exquisite": 0,
                "common": 0,
                "uid": 100000000 + i,
                "nickname": "虚位以待",
                "qq":10000,
                "rank": 0
            })
        }
    }
    let ScreenData = await getScreen(e, top3, rankedData)
    let img = await puppeteer.screenshot('FanSkyGroupChestTop', ScreenData)
    await e.reply(img)
    return true
}

async function getScreen(e, top3, rankedData) {
    let BotInfo = await getVersionInfo()
    return {
        version: BotInfo.PluginVersion,
        YunzaiName: BotInfo.BotName,
        YunzaiVersion: BotInfo.BotVersion,

        CssPath: CssPath,
        quality: 100,
        Top3: top3,
        rankedData: rankedData,
        cwd: cwd,
        Resources: `${cwd}/plugins/FanSky_Qs/resources/ChestAchieveTop/`,
        saveId: e.user_id,
        tplFile: `${cwd}/plugins/FanSky_Qs/resources/ChestAchieveTop/ChestGroupTop.html`,
    }
}


