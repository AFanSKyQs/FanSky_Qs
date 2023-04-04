import fs from "fs"
import _ from "lodash"
import puppeteer from "../../../../../lib/puppeteer/puppeteer.js"
import {getVersionInfo} from "../../../models/getVersion.js";

let cwd = process.cwd().replace(/\\/g, '/')
const achieveTopPath = `${process.cwd()}/data/FanSky_Qs/Top/ChestTop.json`;
let CssPath = `${process.cwd()}/plugins/FanSky_Qs/resources/ChestAchieveTop/`

export async function ChestGroupTop(e) {
    const data = await JSON.parse(fs.readFileSync(achieveTopPath, 'utf-8'));
    const sortedData = _(data[e.group_id])
        .map((value, key) => ({qq: key, ...value}))
        .orderBy('grade', 'desc')
        .value();
    const rankedData = sortedData.map((value, index) => ({...value, rank: index + 1}));
    let ScreenData = await getScreen(e, rankedData)
    let img = await puppeteer.screenshot('FanSkyGroupChestTop', ScreenData)
    await e.reply(img)
    return true
}

async function getScreen(e, rankedData) {
    let BotInfo = await getVersionInfo()
    return {
        version: BotInfo.PluginVersion,
        YunzaiName: BotInfo.BotName,
        YunzaiVersion: BotInfo.BotVersion,

        CssPath:CssPath,
        quality: 100,
        rankedData: rankedData,
        cwd: cwd,
        Resources: `${cwd}/plugins/FanSky_Qs/resources/ChestAchieveTop/`,
        saveId: e.user_id,
        tplFile: `${cwd}/plugins/FanSky_Qs/resources/ChestAchieveTop/ChestGroupTop.html`,
    }
}


