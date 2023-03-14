import fs from "fs";
import {isFileExist} from "../../models/isFileExist.js";
import fetch from "node-fetch";

async function ReturnConfig(DATA_PATH) {
    console.log(DATA_PATH)
    let PATH = DATA_PATH.replace(/\\/g, "/");
    if (!await isFileExist(DATA_PATH)) {
        fs.writeFileSync(DATA_PATH, '{}');
        logger.info(logger.magenta(">>>已创建TeyvatUrlJson.json配置文件"));
    }
    let DATA_JSON = JSON.parse(fs.readFileSync(PATH));
    if (!DATA_JSON["CHAR_DATA"] || !DATA_JSON["HASH_TRANS"] || !DATA_JSON["CALC_RULES"] || !DATA_JSON["RELIC_APPEND"]) {
        logger.info(logger.magenta(">>>开始写入配置项"));
        await GetJson(PATH);
        logger.info(logger.magenta(">>>写入配置项完成"));
    }
    logger.info(logger.magenta(">>>检查配置项完成"));
    return await JSON.parse(fs.readFileSync(PATH));
}
async function GetJson(PATH) {
    let DATA_JSON = JSON.parse(fs.readFileSync(PATH));
    let CHAR_DATA = await LocalUpdateJson("https://cdn.monsterx.cn/bot/gspanel/char-data.json");
    // console.info(`>>>已写入CHAR_DATA配置项 `);
    let HASH_TRANS = await LocalUpdateJson("https://cdn.monsterx.cn/bot/gspanel/hash-trans.json");
    // console.info(`>>>已写入HASH_TRANS配置项 `);
    let CALC_RULES = await LocalUpdateJson("https://cdn.monsterx.cn/bot/gspanel/calc-rule.json");
    // console.info(`>>>已写入CALC_RULES配置项 `);
    let RELIC_APPEND = await LocalUpdateJson("https://cdn.monsterx.cn/bot/gspanel/relic-append.json");
    // console.info(`>>>已写入RELIC_APPEND配置项 `);
    DATA_JSON["CHAR_DATA"] = CHAR_DATA;
    DATA_JSON["HASH_TRANS"] = HASH_TRANS;
    DATA_JSON["CALC_RULES"] = CALC_RULES;
    DATA_JSON["RELIC_APPEND"] = RELIC_APPEND;
    fs.writeFileSync(PATH, JSON.stringify(DATA_JSON));
}
async function LocalUpdateJson(URL) {
    let res = await fetch(URL).catch((err) => logger.error(err))
    if (!res) {
        console.log(`${URL}请求失败...`)
    }
    return await res.json()
}
export default ReturnConfig