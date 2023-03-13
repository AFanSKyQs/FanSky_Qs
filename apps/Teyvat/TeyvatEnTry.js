import {getUrlJson} from "../../models/getUrlJson.js";
import {isFileExist} from "../../models/isFileExist.js";
import plugin from "../../../../lib/plugins/plugin.js";
import fs from "fs";
import cfg from "../../../../lib/config/config.js";

let ONE_PATH = `${process.cwd()}/plugins/FanSky_Qs/config/TeyvatConfig`
let DATA_PATH = `${process.cwd()}/plugins/FanSky_Qs/config/TeyvatConfig/TeyvatUrlJson.json`
if (!fs.existsSync(ONE_PATH)) {
    Bot.logger.info(">>>已创建TeyvatConfig文件夹");
    fs.mkdirSync(ONE_PATH);
}
if (!await isFileExist(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, '{}');
    Bot.logger.info(">>>已创建TeyvatUrlJson.json配置文件");
    Bot.logger.info(">>>将在15s后初次写入必须JSON配置项");
}
setTimeout(async () => {
    await FirstUpdataJSON();
}, 15000);

async function FirstUpdataJSON() {
    let PATH = DATA_PATH.replace(/\\/g, "/");
    let DATA_JSON = JSON.parse(fs.readFileSync(PATH));
    if (!DATA_JSON["CHAR_DATA"] || !DATA_JSON["HASH_TRANS"] || !DATA_JSON["CALC_RULES"] || !DATA_JSON["RELIC_APPEND"]) {
        const teyvatEntry = new TeyvatEnTry();
        let E = await teyvatEntry.getE()
        try {
            let WriteCHAR_DATAJson = await getUrlJson("https://cdn.monsterx.cn/bot/gspanel/char-data.json", E);
            let WriteHASH_TRANSJson = await getUrlJson("https://cdn.monsterx.cn/bot/gspanel/hash-trans.json", E);
            let WriteCALC_RULESJson = await getUrlJson("https://cdn.monsterx.cn/bot/gspanel/calc-rule.json", E);
            let WriteRELIC_APPENDJson = await getUrlJson("https://cdn.monsterx.cn/bot/gspanel/relic-append.json", E);
            DATA_JSON["CHAR_DATA"] = WriteCHAR_DATAJson;
            DATA_JSON["HASH_TRANS"] = WriteHASH_TRANSJson;
            DATA_JSON["CALC_RULES"] = WriteCALC_RULESJson;
            DATA_JSON["RELIC_APPEND"] = WriteRELIC_APPENDJson;
            fs.writeFileSync(PATH, JSON.stringify(DATA_JSON));
            Bot.logger.info(`>>>已写入CHAR_DATA配置项 `);
            Bot.logger.info(`>>>已写入HASH_TRANS配置项 `);
            Bot.logger.info(`>>>已写入CALC_RULES配置项 `);
            Bot.logger.info(`>>>已写入RELIC_APPEND配置项 `);
            let list = cfg.masterQQ;
            for (let userId of list) {
                await Bot.pickFriend(userId).sendMsg(">>>FanSky_Qs已写入JSON配置项,若JSON配置项为空，请发送【#更新小助手配置】！")
            }
        } catch (err) {
            let list = cfg.masterQQ;
            for (let userId of list) {
                await Bot.pickFriend(userId).sendMsg(">>>FanSky_Qs写入配置项失败，请检查错误信息！")
            }
            Bot.logger.info("FanSky_Qs写入配置项失败，请检查错误信息！");
            console.log(err)
        }
    }
}

export class TeyvatEnTry extends plugin {
    constructor() {
        super({
            name: '提瓦特小助手',
            dsc: '提瓦特小助手',
            event: 'message',
            priority: 3141,
            rule: [
                {
                    reg: /#提瓦特小助手/,
                    fnc: 'TeyvatEnTry'
                }, {
                    reg: /#更新小助手配置/,
                    fnc: 'UpdataJSON'
                },
            ]
        })
    };

    async getE() {
        return this.e
    }

    async TeyvatEnTry(e) {
        if(e.is_owner)
        e.reply(">>>FanSky_Qs正在施工中");
        // let PATH = DATA_PATH.replace(/\\/g, "/");
        // let DATA_JSON = JSON.parse(fs.readFileSync(PATH));
        // console.log(DATA_JSON)
        return true;
    }

    async UpdataJSON(e) {
        e.reply(">>>[FanSky_Qs]正在直接更新JSON配置项...");
        await this.UPJSON(e);
        return true;
    }

    async UPJSON(e) {
        let PATH = DATA_PATH.replace(/\\/g, "/");
        let DATA_JSON = JSON.parse(fs.readFileSync(PATH));
        let CHAR_DATA = await getUrlJson("https://cdn.monsterx.cn/bot/gspanel/char-data.json", e);
        let HASH_TRANS = await getUrlJson("https://cdn.monsterx.cn/bot/gspanel/hash-trans.json", e);
        let CALC_RULES = await getUrlJson("https://cdn.monsterx.cn/bot/gspanel/calc-rule.json", e);
        let RELIC_APPEND = await getUrlJson("https://cdn.monsterx.cn/bot/gspanel/relic-append.json", e);
        DATA_JSON["CHAR_DATA"] = CHAR_DATA;
        DATA_JSON["HASH_TRANS"] = HASH_TRANS;
        DATA_JSON["CALC_RULES"] = CALC_RULES;
        DATA_JSON["RELIC_APPEND"] = RELIC_APPEND;
        fs.writeFileSync(PATH, JSON.stringify(DATA_JSON));
        Bot.logger.info(`>>>已写入CHAR_DATA配置项 `);
        Bot.logger.info(`>>>已写入HASH_TRANS配置项 `);
        Bot.logger.info(`>>>已写入CALC_RULES配置项 `);
        Bot.logger.info(`>>>已写入RELIC_APPEND配置项 `);
        e.reply(">>>[FanSky_Qs]已写入JSON配置项");
    }
}

export default FirstUpdataJSON