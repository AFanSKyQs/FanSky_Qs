/* eslint-disable camelcase */
import puppeteer from '../../../../lib/puppeteer/puppeteer.js'
import {getUrlJson} from '../../models/getUrlJson.js'
import {isFileExist} from '../../models/isFileExist.js'
import plugin from '../../../../lib/plugins/plugin.js'
import fs from 'fs'
import cfg from '../../../../lib/config/config.js'
import {getTeam} from './TeyvatTotalEntry.js'
import _ from 'lodash'
import gsCfg from '../../../genshin/model/gsCfg.js'
import {getHelpBg} from "../../models/getTuImg.js";

let cwd = process.cwd().replace(/\\/g, '/')
let ONE_PATH = `${process.cwd()}/plugins/FanSky_Qs/config/TeyvatConfig`
let DATA_PATH = `${process.cwd()}/plugins/FanSky_Qs/config/TeyvatConfig/TeyvatUrlJson.json`
let CachePath = `${process.cwd()}/plugins/FanSky_Qs/resources/cache`

if (!fs.existsSync(ONE_PATH)) {
    Bot.logger.info('>>>已创建TeyvatConfig文件夹')
    fs.mkdirSync(ONE_PATH)
}
if (!await isFileExist(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, '{}')
    logger.info(logger.magenta('>>>已创建TeyvatUrlJson.json配置文件'))
    logger.info(logger.magenta('>>>将在15s后初次写入必须JSON配置项'))
}
setTimeout(async () => {
    await FirstUpdataJSON()
}, 15000)

async function FirstUpdataJSON() {
    let PATH = DATA_PATH.replace(/\\/g, '/')
    let DATA_JSON = JSON.parse(fs.readFileSync(PATH))
    if (!DATA_JSON.CHAR_DATA || !DATA_JSON.HASH_TRANS || !DATA_JSON.CALC_RULES || !DATA_JSON.RELIC_APPEND) {
        const teyvatEntry = new BotEntry()
        let E = await teyvatEntry.getE()
        try {
            let WriteCHAR_DATAJson = await getUrlJson('https://cdn.monsterx.cn/bot/gspanel/char-data.json', E)
            let WriteHASH_TRANSJson = await getUrlJson('https://cdn.monsterx.cn/bot/gspanel/hash-trans.json', E)
            let WriteCALC_RULESJson = await getUrlJson('https://cdn.monsterx.cn/bot/gspanel/calc-rule.json', E)
            let WriteRELIC_APPENDJson = await getUrlJson('https://cdn.monsterx.cn/bot/gspanel/relic-append.json', E)
            DATA_JSON.CHAR_DATA = WriteCHAR_DATAJson
            DATA_JSON.HASH_TRANS = WriteHASH_TRANSJson
            DATA_JSON.CALC_RULES = WriteCALC_RULESJson
            DATA_JSON.RELIC_APPEND = WriteRELIC_APPENDJson
            fs.writeFileSync(PATH, JSON.stringify(DATA_JSON))
            logger.info(logger.magenta('>>>已写入CHAR_DATA、HASH_TRANS、CALC_RULES、RELIC_APPEND配置项 '))
            let list = cfg.masterQQ
            for (let userId of list) {
                await Bot.pickFriend(userId).sendMsg('>>>FanSky_Qs已写入提瓦特小助手JSON,若为空或失效请发送【#更新小助手配置】！')
            }
        } catch (err) {
            let list = cfg.masterQQ
            for (let userId of list) {
                await Bot.pickFriend(userId).sendMsg('>>>FanSky_Qs写入配置项失败，请检查错误信息！')
            }
            logger.info(logger.red('FanSky_Qs写入配置项失败，请检查错误信息！'))
            console.log(err)
        }
    }
}

export class BotEntry extends plugin {
    constructor() {
        super({
            name: '提瓦特小助手',
            dsc: '提瓦特小助手',
            event: 'message',
            priority: 3141,
            rule: [
                {
                    reg: /^#队伍伤害(详情|过程|全图)?(\d+)?(.*)$/,
                    fnc: 'TeyvatEnTry'
                },
                {
                    reg: /^#单人评级(\d+)?(.*)$/,
                    fnc: 'TeyvatEnTry'
                }, {
                    reg: /#更新小助手配置/,
                    fnc: 'UpdataJSON'
                }, {
                    reg: /^#队伍(面板|缓存|已有|数据|cache)(\d+)?$/,
                    fnc: 'TeamCache'
                },
            ]
        })
    }

    async TeamCache(e) {
        let Regx = /^#队伍(面板|缓存|已有|数据|cache)(\d+)?$/
        let matchTeam = e.msg.match(Regx);
        let uid = matchTeam[2] ? matchTeam[2] : await this.GetNowUid(e);
        if (uid.length !== 9) {
            e.reply('>>>[FanSky_Qs]请输入正确的uid')
            return true
        }
        let UidRolesDataAvatars = await this.getCache(e, uid, 'rolesData')
        if (!UidRolesDataAvatars) return true
        let LastUpdateTime = UidRolesDataAvatars.next - 80 * 1000
        let date = new Date(LastUpdateTime).toLocaleString()
        let Package = `${cwd}/plugins/FanSky_Qs/package.json`
        let YunzaiPath = `${cwd}/package.json`
        let PluginVersion = JSON.parse(fs.readFileSync(Package));
        let BotInfo = JSON.parse(fs.readFileSync(YunzaiPath));
        let ScreenData = await this.getRolesScreenData(BotInfo, PluginVersion.version, UidRolesDataAvatars, uid, e, date)
        let img = await puppeteer.screenshot('FanSkyTeyvatTeamScreen', ScreenData)
        await e.reply(img)
        return true
    }

    async getRolesScreenData(BotInfo, PluginVersion, UidRolesDataAvatars, uid, e, LastUpdateTime) {
        let Card = e.sender.nickname || e.sender.card
        let BotName = BotInfo.name.replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
        let AcgPath = await getHelpBg()
        return {
            acgBg: AcgPath,
            uid: uid,
            BotVersion: BotInfo.version,
            BotName: BotName,
            saveId: e.user_id,
            PluginVersion: PluginVersion,
            RolesInfo: UidRolesDataAvatars.avatars,
            cwd: `${cwd}`,
            // tplFile: `E:/Bot_V3/yunzai/Yunzai-Bot/plugins/AFanSKyQs-TeyvatPlugin/resources/Teyvat/TeamCache/TeamRoles.html`,
            // pluResPath: `E:/Bot_V3/yunzai/Yunzai-Bot/plugins/AFanSKyQs-TeyvatPlugin/resources/Teyvat/`,
            tplFile: `${cwd}/plugins/FanSky_Qs/resources/Teyvat/TeamCache/TeamRoles.html`,
            pluResPath: `${cwd}/plugins//FanSky_Qs/resources/Teyvat/`,
            user_img: `https://q1.qlogo.cn/g?b=qq&nk=${e.user_id}&s=160`,
            NickName: `${Card}`,
            LastUpdateTime: `${LastUpdateTime}`,
        }
    }

    async getCache(e, uid, type) {
        let key = `FanSky:Teyvet:${uid}:${type}`
        if (await redis.exists(key)) {
            return JSON.parse(await redis.get(key))
        } else {
            e.reply(`>>[队伍伤害]没有${uid}的角色缓存..`)
            return true
        }
    }

    async getE() {
        return this.e
    }

    async GetNowUid(e) {
        let NoteUser = e.user
        return NoteUser._regUid
    }

    async TeyvatEnTry(e) {
        let at = e.at;
        const regexTeam = /^#队伍伤害(详情|过程|全图)?(\d+)?(.*)$/;
        const regexALevel = /^#单人评级(\d+)?(.*)$/;
        let uid, roleList, detail;
        if (e.msg.includes("#队伍伤害")) {
            const matchTeam = e.msg.match(regexTeam);
            uid = matchTeam[2] ? matchTeam[2] : await this.GetNowUid(e);
            if (!uid && at) {
                uid = await redis.get(`Yz:genshin:mys:qq-uid:${at}`);
            }
            roleList = matchTeam[3];
            detail = !!matchTeam[1];
        } else if (e.msg.includes("#单人评级")) {
            const matchALevel = e.msg.match(regexALevel);
            uid = matchALevel[1] ? matchALevel[1] : await this.GetNowUid(e);
            roleList = matchALevel[2];
        } else {
            console.log("用户指令：" + e.msg)
            return false
        }
        if (!uid) {
            e.reply("尚未绑定uid~，请【绑定uid】\n或输入其他uid，如：#队伍伤害117556563钟离，阿贝多，可莉");
            return true
        }
        if (!roleList) {
            e.reply("尚未检测到角色，默认计算展柜前四位角色...\n具体队伍请输入对应角色名，如：\n#队伍伤害钟离，阿贝多，可莉\n#队伍伤害117556563钟离，阿贝多，可莉");
        }
        let res = await this.TeamDamage(e, uid, roleList);
        if (!res) {
            e.reply("获取失败:" + uid)
            return true
        }
        if (res.error) {
            e.reply(res.error);
            return true;
        }
        try {
            if (res.includes("未发现")) {
                logger.info(logger.cyan(`==>[FanSky_Qs][UID:${uid}]小助手:${res}`))
                e.reply(res)
                return true
            }
        } catch (err) {
            let cachePath = CachePath + "/" + uid + '.json'
            if (!fs.existsSync(CachePath)) {
                fs.mkdirSync(CachePath);
            }
            if (!fs.existsSync(cachePath)) {
                fs.writeFileSync(cachePath, '{}')
            }
            await fs.writeFileSync(cachePath, JSON.stringify(res))
            logger.info(logger.cyan("==>[FanSky_Qs]小助手 请求完成!"))
            let ScreenData = await this.screenData(e, res, detail)
            let img = await puppeteer.screenshot('FanSkyTeyvat', ScreenData)
            await e.reply(img)
            return true
        }
    }

    async screenData(e, data, detail) {
        let Package = `${cwd}/plugins/FanSky_Qs/package.json`
        let YunzaiPath = `${cwd}/package.json`
        let Version = JSON.parse(fs.readFileSync(Package));
        let Yunzai = JSON.parse(fs.readFileSync(YunzaiPath));
        const RoleData = await JSON.parse(data["pie_data"]);
        const DamageMap = await RoleData.map((item) => item.damage);
        const total = await DamageMap.reduce((prev, cur) => prev + cur);
        const percent = await DamageMap.map((item) => (item / total).toFixed(2));
        const RoleColor = await JSON.parse(data["pie_color"]);
        const NameChar = await RoleData.map((item) => item.char);
        const Result = {percent, RoleColor, NameChar};
        let AcgBg=await getHelpBg()
        return {
            AcgBg:AcgBg,
            Bing: Result,
            detail: detail,
            YunzaiName: Yunzai.name,
            YunzaiVersion: Yunzai.version,
            data: data,
            cwd: cwd,
            version: `${Version.version}`,
            saveId: e.user_id,
            miaoRes: `${cwd}/plugins/miao-plugin/resources/`,
            tplFile: `${cwd}/plugins/FanSky_Qs/resources/Teyvat/html.html`,
            /** 绝对路径 */
            pluResPath: `${cwd}/plugins//FanSky_Qs/resources/Teyvat/`,
        }
    }

    async TeamDamage(e, uid, roleList) {
        let chars = roleList.split(/ |,|，|、|。|-/g) || [];
        chars = _.compact(chars);
        if (!_.isEmpty(chars)) {
            let err_chars = _.filter(chars, v => !gsCfg.getRole(v));
            if (!_.isEmpty(err_chars)) return {error: `无法识别${err_chars.join(',')}，请检查输入是否有误`};
            chars = _.map(chars, char => gsCfg.getRole(char).name);
        }
        logger.info(logger.cyan(`==>[FanSky_Qs]小助手 uid：${uid}  | 角色列表：`))
        logger.info(logger.cyan(chars))
        e.reply(`正在获取UID:[${uid}][${chars}]队伍伤害，请稍等...`)
        return await getTeam(uid, chars, true, e);
    }

    async UpdataJSON(e) {
        e.reply('>>>[FanSky_Qs]正在更新提瓦特小助手JSON...')
        await this.UPJSON(e)
        return true
    }

    async UPJSON(e) {
        let PATH = DATA_PATH.replace(/\\/g, '/')
        let DATA_JSON = JSON.parse(fs.readFileSync(PATH))
        let CHAR_DATA = await getUrlJson('https://cdn.monsterx.cn/bot/gspanel/char-data.json', e)
        let HASH_TRANS = await getUrlJson('https://cdn.monsterx.cn/bot/gspanel/hash-trans.json', e)
        let CALC_RULES = await getUrlJson('https://cdn.monsterx.cn/bot/gspanel/calc-rule.json', e)
        let RELIC_APPEND = await getUrlJson('https://cdn.monsterx.cn/bot/gspanel/relic-append.json', e)
        DATA_JSON.CHAR_DATA = CHAR_DATA
        DATA_JSON.HASH_TRANS = HASH_TRANS
        DATA_JSON.CALC_RULES = CALC_RULES
        DATA_JSON.RELIC_APPEND = RELIC_APPEND
        fs.writeFileSync(PATH, JSON.stringify(DATA_JSON))
        logger.info(logger.magenta('>>>已写入CHAR_DATA配置项 '))
        logger.info(logger.magenta('>>>已写入HASH_TRANS配置项 '))
        logger.info(logger.magenta('>>>已写入CALC_RULES配置项 '))
        logger.info(logger.magenta('>>>已写入RELIC_APPEND配置项 '))
        e.reply('>>>[FanSky_Qs]提瓦特小助手JSON更新完成！')
    }
}
