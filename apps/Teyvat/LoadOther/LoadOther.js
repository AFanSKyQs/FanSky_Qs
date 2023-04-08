import fs from 'fs'
import {isFileExist} from '../../../models/isFileExist.js'
import axios from "axios";
import cfg from '../../../../../lib/config/config.js'

// 本地测试用
// let DATA_PATH = 'G:/GitHub/GithubTest/Miao-Yunzai/plugins/FanSky_Qs/config/TeyvatConfig/TeyvatUrlJson.json'
// let ONE_PATH = 'G:/GitHub/GithubTest/Miao-Yunzai/plugins/FanSky_Qs/config/TeyvatConfig'

let DATA_PATH = `${process.cwd()}/plugins/FanSky_Qs/config/TeyvatConfig/TeyvatUrlJson.json`
let ONE_PATH = `${process.cwd()}/plugins/FanSky_Qs/config/TeyvatConfig`

async function ReturnConfig() {
    console.log(DATA_PATH)
    let PATH = DATA_PATH.replace(/\\/g, '/')
    if (!fs.existsSync(ONE_PATH)) {
        // Bot.logger.info('>>>已创建TeyvatConfig文件夹')
        console.log('>>>已创建TeyvatConfig文件夹')
        fs.mkdirSync(ONE_PATH)
    }
    if (!await isFileExist(DATA_PATH)) {
        fs.writeFileSync(DATA_PATH, '{}')
        // logger.info(logger.magenta('>>>已创建TeyvatUrlJson.json配置文件'))
    }
    let DATA_JSON = JSON.parse(fs.readFileSync(PATH))
    if (!DATA_JSON.CHAR_DATA || !DATA_JSON.HASH_TRANS || !DATA_JSON.CALC_RULES || !DATA_JSON.RELIC_APPEND) {
        // logger.info(logger.magenta('>>>开始写入配置项'))
        await GetJson(PATH)
        // logger.info(logger.magenta('>>>写入配置项完成'))
    }
    // logger.info(logger.magenta('>>>检查配置项完成'))
    console.log('>>>检查配置项完成')
    return await JSON.parse(fs.readFileSync(PATH))
}

async function GetJson(PATH) {
    let DATA_JSON = JSON.parse(fs.readFileSync(PATH))
    let Error = null
    let CHAR_DATA = await LocalUpdateJson('https://cdn.monsterx.cn/bot/gspanel/char-data.json')
    if (!CHAR_DATA) {
        console.log('CHAR_DATA请求失败')
        Error += `CHAR_DATA、`
    } else {
        DATA_JSON.CHAR_DATA = CHAR_DATA
    }
    // console.info(`>>>已写入CHAR_DATA配置项 `);
    let HASH_TRANS = await LocalUpdateJson('https://cdn.monsterx.cn/bot/gspanel/hash-trans.json')
    if (!HASH_TRANS) {
        Error += `HASH_TRANS、`
        console.log('HASH_TRANS请求失败')
    } else {
        DATA_JSON.HASH_TRANS = HASH_TRANS
    }
    // console.info(`>>>已写入HASH_TRANS配置项 `);
    let CALC_RULES = await LocalUpdateJson('https://cdn.monsterx.cn/bot/gspanel/calc-rule.json')
    if (!CALC_RULES) {
        console.log('CALC_RULES请求失败')
    } else {
        DATA_JSON.CALC_RULES = CALC_RULES
    }
    // console.info(`>>>已写入CALC_RULES配置项 `);
    let RELIC_APPEND = await LocalUpdateJson('https://cdn.monsterx.cn/bot/gspanel/relic-append.json')
    if (!RELIC_APPEND) {
        Error += `RELIC_APPEND、`
        console.log('RELIC_APPEND请求失败')
    } else {
        DATA_JSON.RELIC_APPEND = RELIC_APPEND
    }
    if (Error) {
        await Bot.pickFriend(cfg.masterQQ[0]).sendMsg(`[FanSky_Qs]：队伍伤害${Error}请求失败，您的网络似乎有点问题?\n可能原因：pm2后台运行自动设置了什么代理，导致请求失败\n\n理论可解决：先前台使用node app?启动获取配置文件,然后再转后台即可`)
    }
    fs.writeFileSync(PATH, JSON.stringify(DATA_JSON))
}

//node-fetch请求方式（node版本小于18不能用）
// async function LocalUpdateJson (URL) {
//   let res = await fetch(URL).catch((err) => logger.error(err))
//   if (!res) {
//     console.log(`${URL}请求失败...`)
//   }
//   return await res.json()
// }

async function LocalUpdateJson(URL) {
    try {
        const res = await axios.get(URL)
        return res.data
    } catch (error) {
        console.log(`${URL}请求失败...`)
        console.error(error)
        return null
    }
}

export default ReturnConfig
