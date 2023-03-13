import fs from "fs";
import FirstUpdataJSON from "./TeyvatEnTry.js";

let DATA_PATH = `${process.cwd()}/plugins/FanSky_Qs/config/TeyvatConfig/TeyvatUrlJson.json`


/**
 * 读取需要的数组
 * @returns {Promise<any>}
 * @constructor
 */
async function ReturnConfig() {

    let PATH = DATA_PATH.replace(/\\/g, "/");
    let DATA_JSON = JSON.parse(fs.readFileSync(PATH));
    if (!DATA_JSON["CHAR_DATA"] || !DATA_JSON["HASH_TRANS"] || !DATA_JSON["CALC_RULES"] || !DATA_JSON["RELIC_APPEND"]) {
        await FirstUpdataJSON()
    }
    return await JSON.parse(fs.readFileSync(PATH))

}
export default ReturnConfig