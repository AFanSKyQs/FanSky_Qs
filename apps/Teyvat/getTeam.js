import fetch from 'node-fetch'
import lodash from 'lodash'
import {Format} from '../../../miao-plugin/components/index.js'
import {Character, Player} from '../../../miao-plugin/models/index.js'
//import { getTargetUid } from '../miao-plugin/apps/profile/ProfileCommon'
import {getServer, simpleTeamDamageRes} from './Index.js'
import puppeteer from '../../../../lib/puppeteer/puppeteer.js'
import fs from "fs";
import {ReturnTeamArr} from "../../config/ReturnSimpleArr/getTeamString.js";

const _path = process.cwd()
let cwd = process.cwd().replace(/\\/g, '/')
const userPath = `${_path}/data/`
/** 小助手请求头 */
const headers = {
    referer: 'https://servicewechat.com/wx2ac9dce11213c3a8/192/page-frame.html',
    'user-agent':
        'Mozilla/5.0 (Linux; Android 12; SM-G977N Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/4375 MMWEBSDK/20221011 Mobile Safari/537.36 MMWEBID/4357 MicroMessenger/8.0.30.2244(0x28001E44) WeChat/arm64 Weixin GPVersion/1 NetType/WIFI Language/zh_CN ABI/arm64 MiniProgramEnv/android'
}
let attrsKeys =
    {
        "def": "防御力",
        "defPlus": "防御力",
        "hpPlus": "生命值",
        "hp": "生命值",
        "atkPlus": "攻击力",
        "atk": "攻击力",
        "recharge": "元素充能效率",
        "mastery": "元素精通",
        "cpct": "暴击率",
        "cdmg": "暴击伤害",
        "heal": "治疗加成",
        "pyro": "火",
        "hydro": "水",
        "cryo": "冰",
        "electro": "雷",
        "anemo": "风",
        "geo": "岩",
        "phy": "物理",
        "dendro": "草",
    }
let dmgKeys =
    {
        "fire_dmg": "pyro",
        "water_dmg": "hydro",
        "ice_dmg": "cryo",
        "thunder_dmg": "electro",
        "wind_dmg": "anemo",
        "rock_dmg": "geo",
        "physical_dmg": "phy",
        "grass_dmg": "dendro",
    }

export async function team(e, teamlist, uid, detail) {
    if (teamlist.length === 1) {
        const res = await ReturnTeamArr(teamlist[0]);
        if (res && res.length > 0) {
            teamlist = res;
        }else{
            await e.reply(`识别到您输入为简写\n暂时没有收录[${teamlist[0]}]`, true);
            return true
        }
    }else if(teamlist.length === 0){
        await e.reply("请指定您要计算的队伍喵~", true);
        return true
    }else if(teamlist.length > 4){
        teamlist = teamlist.slice(0,4)
    }

    let teamarId = [];
    for (var i = 0; i < teamlist.length; i++) {
        let char_p_l = Character.get(teamlist[i].split('(')[0].trim())
        let char_p_t = lodash.clone(char_p_l);
        if (!char_p_t) {
            await e.reply(`队伍中存在未能识别的角色：\n${teamlist[i].split('(')[0].trim()}`);
            return true
        }
        teamarId[i] = char_p_t;
    }

    let TiwateBody = {}
    let rolesData = {}
    let weaponsData = {}
    TiwateBody['uid'] = uid;
    let role_data = []
    let NoData = 0
    let NoDataName = "|"
    let isData = "|"
    for (var i = 0; i < teamarId.length; i++) {
        let char_p = teamarId[i]
        let player = Player.create(uid)
        let profile = player.getProfile(char_p.id)

        if (char_p.name === "旅行者" || char_p.name === "空" || char_p.name === "荧" || char_p.name === "萤") {
            await e.reply(`[旅行者]暂不支持计算伤害喵！~`);
            return true
        }

        if (!profile || !profile.hasData) {
            NoDataName += char_p.name + "|"
            NoData++
            continue
        }

        isData += char_p.name + "|"
        let m_roleData = await covProfileroleData(profile)
        weaponsData[char_p.name] = m_roleData.weapon
        rolesData[char_p.name] = m_roleData;
        let m_TeyvatData = await covProfileTeyvatData(profile, uid);
        role_data.push(m_TeyvatData);
    }
    if (NoData > 0) {
        await e.reply(`UID:${uid}缺少${NoDataName}\n请先通过【#更新面板】拿到对应角色数据。`, true);
        return true
    }
    await e.reply(`UID:${uid}${isData}`);
    logger.info(logger.cyan(`[FanSky_Qs]队伍伤害[请求UID:${uid}]>>>${isData}`))
    TiwateBody['role_data'] = role_data;
    TiwateBody.server = getServer(uid, true)

    // let CachePath = `${process.cwd()}/plugins/FanSky_Qs/resources/TevatRequestDataCache/MiaoData/${uid}.json`
    // if (!fs.existsSync(CachePath)) {
    //     fs.writeFileSync(CachePath, '{}')
    // }
    // await fs.writeFileSync(CachePath, JSON.stringify(TiwateBody))

    const TiwateRaw = await getTeyvatData(TiwateBody, 'team')
    if (TiwateRaw.code !== 200 || !TiwateRaw.result) {
        logger.error(`>>>[错误信息] ${TiwateRaw.info}`)
        await e.reply(`提瓦特小助手接口无法访问或返回错误`, true);
        return true
    } else {
        let data = await simpleTeamDamageRes(TiwateRaw.result, rolesData)
        for (const key in weaponsData) {
            logger.info(key)
            data['avatars'][key].weapon.imgPath = weaponsData[key].weaponPath
        }
        let ScreenData = await screenData(e, data, detail)
        let img = await puppeteer.screenshot('FanSkyTeyvat', ScreenData)
        await e.reply(img)
        return true
    }
}

async function screenData(e, data, detail) {
    //let BotInfo = await getVersionInfo()
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
    //let AcgBg = await getHelpBg()
    return {
        version: 'test',
        YunzaiName: 'test',
        YunzaiVersion: 'test',
        result: Result2,
        RoleData: RoleData,
        quality: 100,
        AcgBg: '',
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

async function covProfileTeyvatData(profile, uid) {
    let char = profile.char
    let a = profile.attr
    let base = profile.base
    let attr = {}
    lodash.forEach(['hp', 'def', 'atk', 'mastery'], (key) => {
        let fn = (n) => Format.comma(n, key === 'hp' ? 0 : 1)
        attr[key] = fn(a[key])
        attr[`${key}Base`] = fn(base[key])
        attr[`${key}Plus`] = fn(a[key] - base[key])
    })
    lodash.forEach(['cpct', 'cdmg', 'recharge', 'dmg'], (key) => {
        let fn = Format.pct
        let key2 = key
        if (key === 'dmg' && a.phy > a.dmg) {
            key2 = 'phy'
        }
        attr[key] = fn(a[key2])
        attr[`${key}Base`] = fn(base[key2])
        attr[`${key}Plus`] = fn(a[key2] - base[key2])
    })
    let TeyvatData = {}
    TeyvatData["uid"] = uid;
    TeyvatData["role"] = profile.char.name;
    TeyvatData["role_class"] = profile.cons;
    TeyvatData["level"] = profile.level;
    TeyvatData["weapon"] = profile.weapon.name;
    TeyvatData["weapon_level"] = profile.weapon.level;
    TeyvatData["weapon_class"] = '精炼' + profile.weapon.affix + '阶';

    TeyvatData["hp"] = Format.int(attr.hp?.replace(/,/g, "") ?? "");
    TeyvatData["base_hp"] = Format.int(attr.hpBase?.replace(/,/g, "") ?? "");
    TeyvatData["attack"] = Format.int(attr.atk?.replace(/,/g, "") ?? "");
    TeyvatData["base_attack"] = Format.int(attr.atkBase?.replace(/,/g, "") ?? "");
    TeyvatData["defend"] = Format.int(attr.def?.replace(/,/g, "") ?? "");
    TeyvatData["base_defend"] = Format.int(attr.defBase?.replace(/,/g, "") ?? "");
    TeyvatData["element"] = Format.int(attr.mastery?.replace(/,/g, "") ?? "");

    TeyvatData["crit"] = attr.cpct;
    TeyvatData["crit_dmg"] = attr.cdmg;
    TeyvatData["heal"] = Format.pct(a.heal);
    TeyvatData["recharge"] = attr.recharge;
    for (const key in dmgKeys) {
        if (profile.elem === dmgKeys[key]) {
            TeyvatData[key] = Format.pct(a.dmg);
        } else {
            TeyvatData[key] = Format.pct(0);
        }
    }

    TeyvatData["physical_dmg"] = Format.pct(a.phy);

    TeyvatData["ability1"] = profile.talent.a.level;
    TeyvatData["ability2"] = profile.talent.e.level;
    TeyvatData["ability3"] = profile.talent.q.level;
    let artisDetail = profile.getArtisMark()
    let str_artifacts = ''
    for (const key in artisDetail.sets) {
        if (str_artifacts === '') {
            str_artifacts = key + artisDetail.sets[key];
        } else {
            str_artifacts = str_artifacts + '+' + key + artisDetail.sets[key];
        }
    }
    TeyvatData["artifacts"] = str_artifacts;
    let artifacts_detail = []
    let m_artis_i = 0
    for (const key in profile.artis.artis) {
        let m_artifacts_detail = {}
        m_artifacts_detail["artifacts_name"] = profile.artis.artis[key].name
        m_artifacts_detail["artifacts_type"] = ''
        m_artis_i = m_artis_i + 1;
        if (m_artis_i === 1) {
            m_artifacts_detail["artifacts_type"] = '生之花'
        }
        if (m_artis_i === 2) {
            m_artifacts_detail["artifacts_type"] = '死之羽'
        }
        if (m_artis_i === 3) {
            m_artifacts_detail["artifacts_type"] = '时之沙'
        }
        if (m_artis_i === 4) {
            m_artifacts_detail["artifacts_type"] = '空之杯'
        }
        if (m_artis_i === 5) {
            m_artifacts_detail["artifacts_type"] = '理之冠'
        }
        m_artifacts_detail["level"] = profile.artis.artis[key].level
        m_artifacts_detail["maintips"] = attrsKeys[profile.artis.artis[key].main.key]
        m_artifacts_detail["mainvalue"] = artisDetail.artis[key]?.main?.value?.replace(/,/g, "") ?? "";
        let m_t_i = 0
        for (const key_att in profile.artis.artis[key].attrs) {
            m_t_i = m_t_i + 1
            let a_n = profile.artis.artis[key].attrs[key_att].key
            let a_v = artisDetail.artis[key].attrs[key_att]?.value?.replace(/,/g, "") ?? "";
            m_artifacts_detail["tips" + m_t_i] = attrsKeys[a_n] + "+" + a_v
        }
        artifacts_detail.push(m_artifacts_detail);
    }
    TeyvatData["artifacts_detail"] = artifacts_detail;
    return TeyvatData;
}

async function covProfileroleData(profile) {
    let roleData = {}
    roleData['id'] = profile.char.id
    //let char_p_l = Character.get(profile.char.name)
    //roleData['rarity'] = profile.char.id
    roleData['name'] = profile.char.name
    roleData['element'] = attrsKeys[profile.elem]
    roleData['fetter'] = profile.char.fetter
    roleData['cons'] = profile.cons
    roleData['level'] = profile.level
    let weapon = {}
    weapon["name"] = profile.weapon.name;
    weapon["rarity"] = profile.weapon.star;
    weapon["affix"] = profile.weapon.affix;
    weapon["level"] = profile.weapon.level;
    weapon["icon"] = profile.weapon.img;
    weapon["weaponPath"] = profile.weapon.type + '/' + profile.weapon.name;

    roleData['weapon'] = weapon
    let fightProp = {}
    fightProp["暴击率"] = profile.attr.cpct
    fightProp["暴击伤害"] = profile.attr.cdmg
    fightProp["生命值"] = profile.attr.hp
    fightProp["攻击力"] = profile.attr.atk
    fightProp["防御力"] = profile.attr.def
    fightProp["元素精通"] = profile.attr.mastery
    fightProp["治疗加成"] = profile.attr.heal
    fightProp["元素充能效率"] = profile.attr.recharge
    roleData['fightProp'] = fightProp

    let skill_a = {}
    skill_a['style'] = ''
    skill_a['icon'] = 'Skill_A_' + profile.char.name
    skill_a['level'] = profile.talent.a.level
    skill_a['originLvl'] = profile.talent.a.original
    if (profile.talent.a.level > profile.talent.a.original) {
        skill_a['style'] = 'extra'
    }

    let skill_e = {}
    skill_e['style'] = ''
    skill_e['icon'] = 'Skill_S_' + profile.char.name
    skill_e['level'] = profile.talent.e.level
    skill_e['originLvl'] = profile.talent.e.original
    if (profile.talent.e.level > profile.talent.e.original) {
        skill_e['style'] = 'extra'
    }

    let skill_q = {}
    skill_q['style'] = ''
    skill_q['icon'] = 'Skill_E_' + profile.char.name
    skill_q['level'] = profile.talent.q.level
    skill_q['originLvl'] = profile.talent.q.original
    if (profile.talent.q.level > profile.talent.q.original) {
        skill_q['style'] = 'extra'
    }

    let skills = {}
    skills['a'] = skill_a;
    skills['e'] = skill_e;
    skills['q'] = skill_q;
    roleData['skills'] = skills
    let artisDetail = profile.getArtisMark()
    roleData['relicSet'] = artisDetail.sets
    return roleData;
}

/**
 * 获取小助手对应功能的数据
 * @param {String} TBody 请求需要的数据
 * @param {String} type 功能对应api 默认为 Single
 * @returns 小助手返回数据
 */
async function getTeyvatData(TBody, type = 'single') {
    const apiMap = {
        single: 'https://api.lelaer.com/ys/getDamageResult.php',
        team: 'https://api.lelaer.com/ys/getTeamResult.php'
    }
    try {
        const response = await fetch(apiMap[type], {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers // 假设您已经定义了 `headers` 对象
            },
            body: JSON.stringify(TBody),
            timeout: 15000
        })
        const jsonResponse = await response.json()
        // logger.info(jsonResponse)
        // logger.info(jsonResponse.result)
        return jsonResponse
    } catch (error) {
        logger.info(error)
        return {
            info: "提瓦特小助手接口无法访问或返回错误"
        }
    }
}
