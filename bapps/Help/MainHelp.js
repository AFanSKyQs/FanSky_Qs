import puppeteer from '../../../../lib/puppeteer/puppeteer.js'
import {screenData} from "./ReturnHelpData.js";

export async function MainFanSkyHelp(e) {
    let ScreenData = await screenData(e)
    let img = await puppeteer.screenshot('FanSkyHelp', ScreenData)
    await e.reply(img)
    return true
}