import getCfg from "../../models/getCfg.js";
import fs from "fs";

let JsonPath = process.cwd().replace(/\\/g, '/') + '/plugins/FanSky_Qs/config/config.json'
let yunPath = process.cwd()

export async function OnOFF(e) {
    if (!e.isMaster) {
        return false
    }
    let Msg = e.msg
    if (Msg.includes("开启") || Msg.includes("打开") || Msg.includes("启用") || Msg.includes("open")) {
        logger.info(logger.cyan('[FanSky_Qs]点赞功能已开启 | 关闭[ #关闭fan点赞 ]'))
        const Json = await getCfg(yunPath, 'config')
        Json.thuMUpOFF = "开启"
        await fs.writeFileSync(JsonPath, JSON.stringify(Json))
        await e.reply("[FanSky]点赞功能已开启")
        return true
    } else {
        logger.info(logger.cyan('[FanSky_Qs]点赞功能已关闭 | 开启[ #开启fan点赞 ]'))
        const Json = await getCfg(yunPath, 'config')
        Json.thuMUpOFF = "关闭"
        await fs.writeFileSync(JsonPath, JSON.stringify(Json))
        await e.reply("[FanSky]点赞功能已关闭")
        return true
    }
}
