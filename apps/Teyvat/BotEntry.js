/* eslint-disable camelcase */
import puppeteer from '../../../../lib/puppeteer/puppeteer.js'
import {getUrlJson} from '../../models/getUrlJson.js'
import plugin from '../../../../lib/plugins/plugin.js'
import fs from 'fs'
import {getTeam} from './TeyvatTotalEntry.js'
import _ from 'lodash'
import gsCfg from '../../../genshin/model/gsCfg.js'
import {getHelpBg} from "../../models/getTuImg.js";
import {getVersionInfo} from "../../models/getVersion.js";

import {AchievementTop} from "./ChestAndAcheTop/AchieveTop.js";
import ChestTop from "./ChestAndAcheTop/ChestTop.js";
import {ChestGroupTop} from "./ChestAndAcheTop/ChestGroupTop.js";
import {AchieveGroupTop} from "./ChestAndAcheTop/AchieveGroupTop.js";
import {team} from "./getTeam.js";
import {getQQ} from "../../models/getQQ.js";
import MysApi from "./GetATUID.js";

let cwd = process.cwd().replace(/\\/g, '/')
let DATA_PATH = `${process.cwd()}/plugins/FanSky_Qs/config/TeyvatConfig/TeyvatUrlJson.json`
let CachePath = `${process.cwd()}/plugins/FanSky_Qs/resources/cache`

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
                },
                {
                    reg: /#更新小助手配置/,
                    fnc: 'UpdataJSON'
                },
                // {
                //     reg: /^#队伍(面板|缓存|已有|数据|cache)(\d+)?$/,
                //     fnc: 'TeamCache'
                // },
                {
                    reg: '^#成就(排行|排名|查询|统计)(.*)$',
                    fnc: 'achieveTop'
                }, {
                    reg: '^#宝箱(排行|排名|查询|统计)(.*)$',
                    fnc: 'ChestGroupTop'
                }, {
                    reg: /^#历史队伍伤害(DPS|Dps|dps|总伤害|总伤)?(\d+)?(.*)$/,
                    fnc: 'HistoryTeam'
                },
            ]
        })
    }

    async HistoryTeam(e) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if (OpenStatus.Teyvat !== 1) return false
        await e.reply("正在开发中~\n每次每个人的队伍数据请求都已经写入了数据库，正在完成最后的渲染设计")
    }

    async achieveTop(e) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if (OpenStatus.Teyvat !== 1) return false
        let msg = e.original_msg || e.msg
        if (!msg) {
            return false
        }
        if (msg.includes("排行榜")) {
            let Static = await AchieveGroupTop(e)
            if (!Static || Static === false) {
                return false
            }
        } else {
            let Static = await AchievementTop(e)
            if (!Static || Static === false) {
                return false
            }
        }
        return true
    }

    async ChestGroupTop(e) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if (OpenStatus.Teyvat !== 1) return false
        let msg = e.original_msg || e.msg
        if (!msg) {
            return false
        }
        if (msg.includes("排行榜")) {
            let Static = await ChestGroupTop(e)
            if (!Static || Static === false) {
                return false
            }
        } else {
            let Static = await ChestTop(e)
            if (!Static || Static === false) {
                return false
            }
        }
        return true
    }

    async TeamCache(e) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if (OpenStatus.Teyvat !== 1) return false

        if (e.msg) {
            e.msg = "#面板"
            e.raw_message = "#面板"
            e.original_msg = "#面板"
            return false
        }

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
        let ScreenData = await this.getRolesScreenData(UidRolesDataAvatars, uid, e, date)
        let img = await puppeteer.screenshot('FanSkyTeyvatTeamScreen', ScreenData)
        await e.reply(img)
        return true
    }

    async getRolesScreenData(UidRolesDataAvatars, uid, e, LastUpdateTime) {
        let BotInfo = await getVersionInfo()
        let Card = e.sender.card || e.sender.nickname
        let AcgPath = await getHelpBg()
        return {
            acgBg: AcgPath,
            uid: uid,
            BotVersion: BotInfo.BotVersion,
            BotName: BotInfo.BotName,
            saveId: e.user_id,
            PluginVersion: BotInfo.PluginVersion,
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

    async GetNowUid(e) {
        let NoteUser = e.user
        let Uid = NoteUser._regUid || NoteUser.uid
        if (!Uid) Uid = e.user.getUid('gs')
        return Uid
    }

    async TeyvatEnTry(e) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if (OpenStatus.Teyvat !== 1) return false
        let at = e.at;
        const regexTeam = /^#队伍伤害(详情|过程|全图)?(\d+)?(.*)$/;
        const regexALevel = /^#单人评级(\d+)?(.*)$/;
        let uid, roleList, detail;
        if (e.msg.includes("#队伍伤害")) {
            const matchTeam = e.msg.match(regexTeam);
            uid = matchTeam[2] ? matchTeam[2] : await this.GetNowUid(e);
            if (at) {
                if (at) {
                    let AT_UID=await MysApi.getAT_UID(e,'all')
                    if(!AT_UID){
                        AT_UID = await redis.get(`genshin:id-uid:${at}`) || await redis.get(`Yz:genshin:mys:qq-uid:${at}`)
                    }
                    if (AT_UID) {
                        uid = AT_UID
                    }else{
                        e.reply(`QQ:${at}尚未绑定uid~\n请该用户先【#绑定uid】`);
                        return true
                    }
                }
            }
            roleList = matchTeam[3];
            detail = !!matchTeam[1];
            logger.info(e.msg)
        } else if (e.msg.includes("#单人评级")) {
            const matchALevel = e.msg.match(regexALevel);
            uid = matchALevel[1] ? matchALevel[1] : await this.GetNowUid(e);
            roleList = matchALevel[2];
        } else {
            logger.info("用户指令：" + e.msg)
            return false
        }
        if (!uid) {
            e.reply("尚未绑定uid，请先【#绑定xxx】\n直接指定查询：#队伍伤害100000000钟离，阿贝多，可莉,魈");
            return true
        }
        if (!roleList) {
            e.reply("指令错误，使用例子：\n#队伍伤害(@张三)钟离，阿贝多，可莉，魈\n#队伍伤害100000000钟离，阿贝多，可莉，魈", true, {recallMsg: 30});
            return true
        }
        await this.RequestSelect("Local", e, uid, roleList, detail)
        return true
    }

    async RequestSelect(Type, e, uid, roleList, detail) {
        if (Type === "Local") {
            let splitter = ['\\s', ',', '，', '、', '。', '-', '\\|']
            let roleAfterList = roleList.trim().split(new RegExp(splitter.join('|'))) || []
            await team(e, _.compact(roleAfterList), uid, detail)
            return true
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

            for (const avatar in res.avatars) {
                res.avatars[avatar].weaponType = res.avatars[avatar].weapon.imgPath.split('/')[0];
            }

            let ScreenData = await this.screenData(e, res, detail)
            let img = await puppeteer.screenshot('FanSkyTeyvat', ScreenData)
            await e.reply(img)
            return true
        }
    }

    async screenData(e, data, detail) {
        let BotInfo = await getVersionInfo()
        const RoleData = await JSON.parse(data["pie_data"]);
        const DamageMap = await RoleData.map((item) => item.damage);
        const total = await DamageMap.reduce((prev, cur) => prev + cur);
        const percent = await DamageMap.map((item) => (item / total).toFixed(2));
        const RoleColor = await JSON.parse(data["pie_color"]);
        const NameChar = await RoleData.map((item) => item.char);
        const Result = {percent, RoleColor, NameChar};
        const Result2 = RoleData.reduce((acc, d, i) => {
            acc[d.char] = {
                name: d.char,
                damage: d.damage,
                color: RoleColor[i]
            };
            return acc;
        }, {});
        let AcgBg = await getHelpBg()
        return {
            version: BotInfo.PluginVersion,
            YunzaiName: BotInfo.BotName,
            YunzaiVersion: BotInfo.BotVersion,
            result: Result2,
            RoleData: RoleData,
            quality: 100,
            AcgBg: AcgBg,
            Bing: Result,
            detail: detail,
            data: data,
            cwd: cwd,
            saveId: e.user_id,
            miaoRes: `${cwd}/plugins/miao-plugin/resources/`,
            tplFile: `${cwd}/plugins/FanSky_Qs/resources/Teyvat/html.html`,
            /** 绝对路径 */
            pluResPath: `${cwd}/plugins//FanSky_Qs/resources/Teyvat/`,
        }
    }

    async TeamDamage(e, uid, roleList) {
        let chars = roleList.split(/[\s,，、。-]+/g) || [];
        // let chars = roleList.split(/ |,|，|、|。|-/g) || [];
        chars = _.compact(chars);
        if (!_.isEmpty(chars)) {
            let err_chars = _.filter(chars, v => !gsCfg.getRole(v));
            if (!_.isEmpty(err_chars)) return {error: `无法识别${err_chars.join(',')}，请检查输入是否有误`};
            chars = _.map(chars, char => gsCfg.getRole(char).name);
        }
        logger.info(logger.cyan(`==>[FanSky_Qs]小助手 uid：${uid}  | 角色列表：`))
        logger.info(logger.cyan(chars))
        e.reply(`正在获取UID:[${uid}][${chars}]队伍伤害，请稍等...`, true, {recallMsg: 15})
        return await getTeam(uid, chars, true, e);
    }

    async UpdataJSON(e) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if (OpenStatus.Teyvat !== 1) return false
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
