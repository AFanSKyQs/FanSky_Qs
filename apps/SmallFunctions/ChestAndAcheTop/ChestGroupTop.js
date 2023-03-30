import fs from "fs"
import _ from "lodash"
import puppeteer from "../../../../../lib/puppeteer/puppeteer.js"

let cwd = process.cwd().replace(/\\/g, '/')
const achieveTopPath = `${process.cwd()}/data/FanSky_Qs/Top/ChestTop.json`;

export async function ChestGroupTop(e) {
    const data = await JSON.parse(fs.readFileSync(achieveTopPath, 'utf-8'));
    // 转换为数组并按照grade排序
    const sortedData = _(data[e.group_id])
        .map((value, key) => ({qq: key, ...value}))
        .orderBy('grade', 'desc')
        .value();
// 将排名添加到数据中
    const rankedData = sortedData.map((value, index) => ({...value, rank: index + 1}));
    let ScreenData = await getScreen(e, rankedData)
    let img = await puppeteer.screenshot('FanSkyGroupChestTop', ScreenData)
    await e.reply(img)
    return true
}

async function getScreen(e, rankedData) {
    return {
        quality: 100,
        rankedData: rankedData,
        cwd: cwd,
        Resources: `${cwd}/plugins/FanSky_Qs/resources/ChestAchieveTop/`,
        saveId: e.user_id,
        tplFile: `${cwd}/plugins/FanSky_Qs/resources/ChestAchieveTop/ChestGroupTop.html`,
    }
}


