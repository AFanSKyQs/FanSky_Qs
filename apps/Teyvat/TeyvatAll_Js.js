import {ELEM, GROW_VALUE, MAIN_AFFIXS, POS, PROP, RANK_MAP, SKILL, SUB_AFFIXS} from "../../models/Teyvat/index.js"

let DATA_PATH = `E:/Bot_V3/yunzai/Yunzai-Bot/plugins/FanSky_Qs/config/TeyvatConfig/TeyvatUrlJson.json`   //本地测试路径
// await getAvatarData("117556563", "single"); // uid   单人伤害：single  队伍伤害：team
import ReturnConfig from "./ReadTeyvatJson.js";

async function ReturnJson() {
    console.log("DATA_PATH" + DATA_PATH)
    return await ReturnConfig(DATA_PATH)
}

const headers = {
    referer: 'https://servicewechat.com/wx2ac9dce11213c3a8/192/page-frame.html',
    'user-agent':
        'Mozilla/5.0 (Linux; Android 12; SM-G977N Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/4375 MMWEBSDK/20221011 Mobile Safari/537.36 MMWEBID/4357 MicroMessenger/8.0.30.2244(0x28001E44) WeChat/arm64 Weixin GPVersion/1 NetType/WIFI Language/zh_CN ABI/arm64 MiniProgramEnv/android',
};
await getAvatarData("117556563", "single")

async function getTeyvatData(TBody, type = "single") {
    console.log("进入了：getTeyvatData---type:" + type)
    const apiMap = {
        "single": "https://api.lelaer.com/ys/getDamageResult.php",
        "team": "https://api.lelaer.com/ys/getTeamResult.php",
    };
    try {
        console.log("getTWTData_apiMap:" + apiMap[type]);
        const response = await fetch(apiMap[type], {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...headers, // 假设您已经定义了 `headers` 对象
            },
            body: JSON.stringify(TBody),
        });
        const resJson = await response.json();
        // console.log("-----------resJson---------------")
        // console.log(resJson);
        return resJson;
    } catch (error) {
        console.error("提瓦特小助手接口无法访问或返回错误", error);
        return {};
    }
}

/**队伍伤害消息生成入口
 @param {string} uid 查询用户 UID
 @param {Array<string>} chars 查询角色，为空默认数据中前四个
 @param {boolean} showDetail 查询结果是否展示伤害过程。默认不展示
 @return {string|ArrayBuffer} 查询结果。一般返回图片字节，出错时返回错误信息字符串
 **/
async function getTeam(uid, chars = [], showDetail = false) {
    // 获取面板数据
    const data = await getAvatarData(uid, "全部");
    if (data["error"]) {
        return data["error"];
    }
    let extract;
    if (chars.length) {
        extract = data["avatars"].filter(a => chars.includes(a["name"]));
        if (extract.length !== chars.length) {
            const gotThis = extract.map(a => a["name"]);
            const notFound = chars.filter(c => !gotThis.includes(c)).join("、");
            return `玩家 ${uid} 的最新数据中未发现${notFound}！`;
        }
    } else if (data["avatars"].length >= 4) {
        extract = data["avatars"].slice(0, 4);
        console.log(`UID${uid} 未指定队伍，自动选择面板中前 4 位进行计算：${extract.map(a => a["name"]).join("、")} ...`);
    } else {
        return `玩家 ${uid} 的面板数据甚至不足以组成一支队伍呢！`;
    }
    const extractCopy = JSON.parse(JSON.stringify(extract));
    const TiwateBody = await transTeyvatData(extractCopy, uid);
    const TiwateRaw = await getTeyvatData(TiwateBody, "team");
    if (TiwateRaw["code"] !== 200 || !TiwateRaw["result"]) {
        console.log(`UID${uid} 的 ${extract.length} 位角色队伍伤害计算请求失败！\n>>>> [提瓦特返回] ${JSON.stringify(TiwateRaw)}`);
        return `玩家 ${uid} 队伍伤害计算失败，接口可能发生变动！` || "啊哦，队伍伤害计算小程序状态异常！";
    }
    try {
        let data = await simplTeamDamageRes(TiwateRaw["result"], extract.reduce((acc, a) => ({
            ...acc,
            [a["name"]]: a
        }), {}));
        console.log("-----------------getTeam_data-----------------")
        console.log(data)
    } catch (e) {
        console.log(`[${e.constructor.name}] 队伍伤害数据解析出错`);
        return `[${e.constructor.name}] 队伍伤害数据解析出错咯`;
    }
    // const htmlBase = LOCAL_DIR.resolve().toString();
}

async function getAvatarData(uid, char = "全部") {
    console.log("进入了：getAvatarData")
    // const cache = LOCAL_DIR.join("cache", `${uid}.json`);
    let cacheData = {},
        nextQueryTime = 0;
    // if (await cache.exists()) {
    //     cacheData = JSON.parse(await cache.readText("utf-8"));
    //     nextQueryTime = cacheData.next;
    // }
    let refreshed = [],
        _tip = "",
        _time = 0;
    if (Date.now() <= nextQueryTime) {
        console.info(`UID${uid} 的角色展柜数据刷新冷却还有 ${Math.floor((nextQueryTime - Date.now()) / 1000)} 秒！`);
    } else {
        console.info(`UID${uid} 的角色展柜数据正在刷新！`);
        // const newData = EnkaJson;
        const newData = await requestDataApi(uid);
        _time = Date.now();
        // if (!cacheData && newData.error) {
        if (newData.error) {
            return newData;
        } else if (!newData.error) {
            console.error("newData.error: " + newData.error);
            _tip = "success";
            // const avatarsCache = cacheData.avatars?.reduce((acc, x) => {
            //     acc[x.id.toString()] = x;
            //     return acc;
            // }, {});
            const now = Date.now(),
                wait4Dmg = {},
                avatars = [];
            for (const newAvatar of newData.avatarInfoList) {
                if ([10000005, 10000007].includes(newAvatar.avatarId)) {
                    console.info("旅行者面板查询暂未支持！");
                    continue;
                }
                const tmp = await transFromEnka(newAvatar, now),
                    nowIdStr = tmp.id.toString();
                let gotDmg = false;
                // if (avatarsCache) {
                //     if (nowIdStr in avatarsCache) {
                //         const {damage: cacheDmg} = avatarsCache[nowIdStr];
                //         const nowStat = Object.fromEntries(Object.entries(tmp).filter(([k]) => !["damage", "time"].includes(k)));
                //         if (cacheDmg && avatarsCache[tmp["id"].toString()] === nowStat) {
                //             console.info(`UID${uid} 的 ${tmp.name} 伤害计算结果无需刷新！`);
                //             tmp.damage = cacheDmg;
                //             gotDmg = true;
                //         } else {
                //             console.info(`UID${uid} 的 ${tmp.name} 数据变化细则：\n${JSON.stringify(avatarsCache[nowIdStr])}\n${JSON.stringify(nowStat)}`);
                //         }
                //     }
                // }
                refreshed.push(tmp.id);
                avatars.push(tmp);
                if (!gotDmg) {
                    wait4Dmg[avatars.length - 1] = tmp;
                }
            }
            if (Object.keys(wait4Dmg).length > 0) {
                console.log("wait4Dmg typeof:" + typeof wait4Dmg)
                const wtf = Object.values(wait4Dmg).map(x => ({...x}));
                // const wtf = wait4Dmg.map(x => ({...x}));
                const teyvatBody = await transTeyvatData(wtf, uid);
                const teyvatRaw = await getTeyvatData(teyvatBody, "team");
                // console.log("teyvatRaw typeof:" + typeof teyvatRaw)
                // console.log("------------teyvatRaw----------------")
                // console.log(teyvatRaw)
                // if (teyvatRaw.code !== 200 || teyvatRaw.result.length !== Object.keys(wait4Dmg).length) {
                if (teyvatRaw.code !== 200) {
                    console.info(`UID${uid} 的 ${Object.keys(wait4Dmg).length} 位角色伤害计算请求失败！\n>>>> [提瓦特返回] ${JSON.stringify(teyvatRaw)}`);
                } else {
                    console.log("---------teyvatRaw.result--------------")
                    console.log(teyvatRaw.result)
                    console.log("---------Object.entries(teyvatRaw.result)--------------")
                    console.log(Object.entries(teyvatRaw.result))
                    for (let [dmgIdx, dmgData] of Object.entries(teyvatRaw.result || [])) {
                        let aIdx = parseInt(Object.keys(wait4Dmg)[dmgIdx]);
                        avatars[aIdx].damage = await simplDamageRes(dmgData);
                    }
                    cacheData.avatars = [
                        ...avatars,
                        // ...Object.values(avatarsCache).filter(aData => !refreshed.includes(aData.id))
                    ];
                    cacheData.next = now + newData.ttl;
                    // console.log("-----------------数据检查cacheData-------------------")
                    // console.log(cacheData)
                    // await fs.promises.writeFile(
                    //     CACHE_FILE_PATH,
                    //     JSON.stringify(cacheData, null, 2),
                    //     {encoding: "utf-8"}
                    // );
                }// 有缓存 & 本次刷新失败，打印错误信息
            }
        } else {
            console.error(newData.error);
        }
        // 获取所需角色数据
        if (char === "全部") {
            if (cacheData && cacheData.avatars) {
                // 为本次更新的角色添加刷新标记
                for (let [aIdx, aData] of Object.entries(cacheData.avatars)) {
                    cacheData.avatars[aIdx].refreshed = refreshed.includes(aData.id);
                }
                // 格式化刷新时间
                const _datetime = new Date(_time * 1000).toLocaleString("zh-cn", {timeZone: "Asia/Shanghai"});
                cacheData.timetips = [_tip, _datetime];
                return cacheData;
            } else {
                console.error(">>>cacheData对象或化身属性未定义或为空\n");
                console.log(cacheData)
            }
        }
        const searchRes = cacheData.avatars.filter(x => x.name === char);
        return searchRes.length > 0 ? searchRes[0] : {
            error: `玩家 ${uid} 游戏内展柜中的 ${cacheData.avatars.length} 位角色中没有 ${char}！`
        };
    }
}

async function simplDamageRes(damage) {
    console.log("进入了：simplDamageRes")
    const res = {level: damage["zdl_result"] || "NaN", data: [], buff: []};
    for (const key of ["damage_result_arr", "damage_result_arr2"]) {
        console.log("------------damage[key]------------")
        console.log(key)
        for (const dmgDetail of damage[key]) {
            console.log("------------dmgDetail------------")
            const dmgTitle = (key === "damage_result_arr2"
                ? `[${damage["zdl_result2"]}]<br>`
                : "") + dmgDetail["title"];
            let dmgCrit, dmgExp;
            if ("期望" in String(dmgDetail["value"]) || !dmgDetail.expect) {
                dmgCrit = "-";
                dmgExp = String(dmgDetail["value"]).replace("期望", "");
            } else {
                dmgCrit = String(dmgDetail["value"]);
                dmgExp = String(dmgDetail["expect"]).replace("期望", "");
            }
            res["data"].push([dmgTitle, dmgCrit, dmgExp]);
        }
    }
    for (const buff of damage["bonus"]) {
        const intro = buff.intro
            ? buff.intro
            : buff["intro"]
                ? buff["intro"]
                : "";
        const [buffTitle, buffDetail] = intro.split("：");
        if (buffTitle !== "注" && buffTitle !== "备注") {
            res["buff"].push([buffTitle, buffDetail]);
        }
    }
    console.log("-----------数据检查simplDamageRes(damage)-------------")
    console.log(res)
    return res;
}

async function transTeyvatData(avatarsData, uid) {
    console.log("进入了：transTeyvatData")
    let res = {"uid": uid, "role_data": []};
    if (uid[0] !== "1" && uid[0] !== "2") {
        res["server"] = getServer(uid, true);
    }
    for (let avatarData of avatarsData) {
        let name = avatarData["name"];
        let cons = avatarData["cons"];
        let weapon = avatarData["weapon"];
        let baseProp = avatarData["baseProp"];
        let fightProp = avatarData["fightProp"];
        let skills = avatarData["skills"];
        let relics = avatarData["relics"];
        let relicSet = avatarData["relicSet"];
        if (name === "雷电将军") {
            const _thunderDmg = fightProp["雷元素伤害加成"];
            const _recharge = fightProp["元素充能效率"];
            fightProp["雷元素伤害加成"] = Math.max(0, _thunderDmg - (_recharge - 100) * 0.4);
        }
        if (name === "莫娜") {
            const _waterDmg = fightProp["水元素伤害加成"];
            const _recharge = fightProp["元素充能效率"];
            fightProp["水元素伤害加成"] = Math.max(0, _waterDmg - _recharge * 0.2);
        }
        if (name === "妮露" && cons === 6) {
            const _count = parseFloat(fightProp["生命值"] / 1000);
            const _crit = fightProp["暴击率"];
            const _critDmg = fightProp["暴击伤害"];
            fightProp["暴击率"] = Math.max(5, _crit - Math.min(30, _count * 0.6));
            fightProp["暴击伤害"] = Math.max(50, _critDmg - Math.min(60, _count * 1.2));
        }
        if (["息灾", "波乱月白经津", "雾切之回光", "猎人之径"].includes(weapon["name"])) {
            const weaponAffix = weapon["affix"];
            for (const elem of ["火", "水", "雷", "风", "冰", "岩", "草"]) {
                const _origin = fightProp[`${elem}元素伤害加成`];
                fightProp[`${elem}元素伤害加成`] = Math.max(
                    0,
                    _origin - 12 - 12 * (weaponAffix - 1) / 4
                );
            }
        }
        let artifacts = [];
        for (let a of relics) {
            let tData = {
                "artifacts_name": a["name"],
                "artifacts_type": Object.values(POS)[a["pos"] - 1],
                "level": a["level"],
                "maintips": kStr(a["main"]["prop"], true),
                "mainvalue": (typeof a["main"]["value"] === "number") ? parseInt(a["main"]["value"]) : a["main"]["value"]
            };
            let tips = {};
            for (let sIdx = 0; sIdx < 4; sIdx++) {
                if (sIdx < a["sub"].length) {
                    tips["tips" + (sIdx + 1)] = kStr(a["sub"][sIdx]["prop"], true) + "+" + a["sub"][sIdx]["value"];
                } else {
                    tips["tips" + (sIdx + 1)] = "";
                }
            }
            tData = {...tData, ...tips};
            artifacts.push(tData);
        }
        // let roleData = {name, cons, weapon, baseProp, fightProp, skills, relics: artifacts, relicSet};
        // res["role_data"].push(roleData);
        console.log("relicSet:", relicSet);
        res["role_data"].push({
            "uid": uid,
            "role": name,
            "role_class": cons,
            "level": parseInt(avatarData["level"]),
            "weapon": weapon["name"],
            "weapon_level": weapon["level"],
            "weapon_class": `精炼${weapon['affix']}阶`,
            "hp": parseInt(fightProp["生命值"]),
            "base_hp": parseInt(baseProp["生命值"]),
            "attack": parseInt(fightProp["攻击力"]),
            "base_attack": parseInt(baseProp["攻击力"]),
            "defend": parseInt(fightProp["防御力"]),
            "base_defend": parseInt(baseProp["防御力"]),
            "element": Math.round(fightProp["元素精通"]),
            "crit": `${Math.round(fightProp['暴击率'] * 10) / 10}%`,
            "crit_dmg": `${Math.round(fightProp['暴击伤害'] * 10) / 10}%`,
            "heal": `${Math.round(fightProp['治疗加成'] * 10) / 10}%`,
            "recharge": `${Math.round(fightProp['元素充能效率'] * 10) / 10}%`,
            "fire_dmg": `${Math.round(fightProp['火元素伤害加成'] * 10) / 10}%`,
            "water_dmg": `${Math.round(fightProp['水元素伤害加成'] * 10) / 10}%`,
            "thunder_dmg": `${Math.round(fightProp['雷元素伤害加成'] * 10) / 10}%`,
            "wind_dmg": `${Math.round(fightProp['风元素伤害加成'] * 10) / 10}%`,
            "ice_dmg": `${Math.round(fightProp['冰元素伤害加成'] * 10) / 10}%`,
            "rock_dmg": `${Math.round(fightProp['岩元素伤害加成'] * 10) / 10}%`,
            "grass_dmg": `${Math.round(fightProp['草元素伤害加成'] * 10) / 10}%`,
            "physical_dmg": `${Math.round(fightProp['物理伤害加成'] * 10) / 10}%`,
            "artifacts": Object.entries(relicSet)
                .filter(([k, v]) => v >= 2 || (typeof k === 'string' && k.length >= 2))
                .map(([k, v]) => `${k}${v >= 4 ? 4 : v >= 2 ? 2 : 1}`).join("+"),
            "ability1": skills["a"]["level"],
            "ability2": skills["e"]["level"],
            "ability3": skills["q"]["level"],
            "artifacts_detail": artifacts
        });

    }
    return res;
}

// 请求enka的api
async function requestDataApi(uid) {
    console.log("进入了：requestDataApi")
    const enkaMirrors = [
        "https://enka.network",
        "http://profile.microgg.cn",
    ];
    // B 服优先从 MicroGG API 尝试
    if (Number(uid[0]) === 5) {
        enkaMirrors.reverse();
    }
    let resJson = {};
    for (let idx = 0; idx < enkaMirrors.length; idx++) {
        const root = enkaMirrors[idx];
        const apiName = root.includes("microgg") ? "MicroGG API" : "Enka API";
        try {
            const res = await fetch(`${root}/api/uid/${uid}`, {
                headers: {
                    Accept: "application/json",
                    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,en-US;q=0.7",
                    "Cache-Control": "no-cache",
                    Cookie: "locale=zh-CN",
                    Referer: "https://enka.network/",
                    "User-Agent": "GsPanel/0.2",
                },
                follow: 1,
                timeout: 20000,
            });
            const errorMsg = {
                400: `玩家 ${uid} UID 格式错误！`,
                404: `玩家 ${uid} 不存在！`,
                424: `${apiName} 正在维护中！`,
                429: `${apiName} 访问过于频繁！`,
                500: `${apiName} 服务器普通故障！`,
                503: `${apiName} 服务器严重错误！`,
            };
            const status = String(res.status);
            if (["400", "404"].includes(status)) {
                return {error: errorMsg[status]};
            } else if (status in errorMsg) {
                if (idx === enkaMirrors.length - 1) {
                    return {error: errorMsg[status]};
                }
                console.error(errorMsg[status]);
                continue;
            }
            resJson = await res.json();
            break;
        } catch (e) {
            if (idx === enkaMirrors.length - 1) {
                console.error(e);
                return {
                    error: `[${e.name}] 暂时无法访问面板数据接口..`,
                };
            }
            console.info(
                `从 ${apiName} 获取面板失败，正在自动切换镜像重试...`
            );
        }
    }
    if (!resJson.playerInfo) {
        return {error: `玩家 ${uid} 返回信息不全，接口可能正在维护..`};
    }
    if (!resJson.avatarInfoList) {
        return {
            error: `玩家 ${uid} 的角色展柜详细数据已隐藏！`,
        };
    }
    if (!resJson.playerInfo.showAvatarInfoList) {
        return {error: `玩家 ${uid} 的角色展柜内还没有角色哦！`};
    }
    return resJson;
}

async function transFromEnka(avatarInfo, ts = 0) {
    console.log("进入了：transFromEnka")
    let Json = await ReturnJson()
    let HASH_TRANS = Json["HASH_TRANS"]
    let CHAR_DATA = Json["CHAR_DATA"]
    const charData = CHAR_DATA[String(avatarInfo["avatarId"])];
    console.log("----------------charData:-----------------")
    console.log(charData)
    const res = {
        "id": avatarInfo["avatarId"],
        "rarity": (charData["QualityType"].includes("QUALITY_ORANGE")) ? 5 : 4,
        "name": charData["NameCN"],
        "slogan": charData["Slogan"],
        "element": ELEM[charData["Element"]],
        "cons": (avatarInfo.hasOwnProperty("talentIdList")) ? avatarInfo["talentIdList"].length : 0,
        "fetter": avatarInfo["fetterInfo"]["expLevel"],
        "level": parseInt(avatarInfo["propMap"]["4001"]["val"]),
        "icon": (avatarInfo.hasOwnProperty("costumeId")) ? charData["Costumes"][avatarInfo["costumeId"].toString()]["icon"] : charData["iconName"],
        "gachaAvatarImg": (avatarInfo.hasOwnProperty("costumeId")) ? charData["Costumes"][avatarInfo["costumeId"].toString()]["art"] : charData["iconName"].replace("UI_AvatarIcon_", "UI_Gacha_AvatarImg_"),
        "baseProp": {
            "生命值": avatarInfo["fightPropMap"]["1"],
            "攻击力": avatarInfo["fightPropMap"]["4"],
            "防御力": avatarInfo["fightPropMap"]["7"],
        },
        "fightProp": {
            "生命值": avatarInfo["fightPropMap"]["2000"],
            "攻击力": avatarInfo["fightPropMap"]["4"] * (1 + (avatarInfo["fightPropMap"]["6"] || 0)) + (avatarInfo["fightPropMap"]["5"] || 0),
            "防御力": avatarInfo["fightPropMap"]["2002"],
            "暴击率": avatarInfo["fightPropMap"]["20"] * 100,
            "暴击伤害": avatarInfo["fightPropMap"]["22"] * 100,
            "治疗加成": avatarInfo["fightPropMap"]["26"] * 100,
            "元素精通": avatarInfo["fightPropMap"]["28"],
            "元素充能效率": avatarInfo["fightPropMap"]["23"] * 100,
            "物理伤害加成": avatarInfo["fightPropMap"]["30"] * 100,
            "火元素伤害加成": avatarInfo["fightPropMap"]["40"] * 100,
            "水元素伤害加成": avatarInfo["fightPropMap"]["42"] * 100,
            "风元素伤害加成": avatarInfo["fightPropMap"]["44"] * 100,
            "雷元素伤害加成": avatarInfo["fightPropMap"]["41"] * 100,
            "草元素伤害加成": avatarInfo["fightPropMap"]["43"] * 100,
            "冰元素伤害加成": avatarInfo["fightPropMap"]["46"] * 100,
            "岩元素伤害加成": avatarInfo["fightPropMap"]["45"] * 100,
        },
        "skills": {},
        "consts": [],
        "weapon": {},
        "relics": [],
        "relicSet": {},
        "relicCalc": {},
        "damage": {},
        "time": ts || parseInt(Date.now() / 1000),
    };
    // 技能数据
    const skills = {"a": {}, "e": {}, "q": {}};
    // const extraLevels = Object.fromEntries(
    //     Object.entries(avatarInfo.get("proudSkillExtraLevelMap", {})).map(([k, v]) => [k.slice(-1), v])
    // );
    const extraLevels = Object.fromEntries(
        Object.entries(avatarInfo["proudSkillExtraLevelMap"] || {}).map(([k, v]) => [k.slice(-1), v])
    );
    console.log("---------extraLevels---------")
    console.log(extraLevels)
    for (let idx = 0; idx < charData["SkillOrder"].length; idx++) {
        const skillId = charData["SkillOrder"][idx];
        // 实际技能等级、显示技能等级
        const level = avatarInfo["skillLevelMap"][String(skillId)];
        const currentLvl = level + (extraLevels[Object.keys(SKILL)[idx]] || 0);
        skills[Object.values(SKILL)[idx]] = {
            "style": currentLvl > level ? "extra" : "",
            "icon": charData["Skills"][String(skillId)],
            "level": currentLvl,
            "originLvl": level,
        };
    }
    res["skills"] = skills;
    // 命座数据
    let consts = [];
    for (let cIdx = 0; cIdx < charData["Consts"].length; cIdx++) {
        let consImgName = charData["Consts"][cIdx];
        consts.push({
            "style": cIdx + 1 > res["cons"] ? "off" : "",
            "icon": consImgName,
        });
    }
    res["consts"] = consts;
    // 装备数据
    let [affixWeight, pointMark, maxMark] = await getRelicConfig(charData["NameCN"], res["baseProp"]);
    let [relicsMark, relicsCnt, relicSet] = [0.0, 0, {}];
    for (let equip of avatarInfo["equipList"]) {
        if (equip["flat"]["itemType"] === "ITEM_WEAPON") {
            let weaponSub = equip["flat"]["weaponStats"][equip["flat"]["weaponStats"].length - 1]["appendPropId"];
            let weaponSubValue = equip["flat"]["weaponStats"][equip["flat"]["weaponStats"].length - 1]["statValue"];
            res["weapon"] = {
                "id": equip["itemId"],
                "rarity": equip["flat"]["rankLevel"],
                // "name": HASH_TRANS.get(equip["flat"]["nameTextMapHash"], "缺少翻译"),
                "name": HASH_TRANS[equip["flat"]["nameTextMapHash"]] || "缺少翻译",
                // "affix": Object.values(equip["weapon"].get("affixMap", {"_": 0}))[0] + 1,
                "affix": Object.values(equip["weapon"]["affixMap"] || {"_": 0})[0] + 1,
                "level": equip["weapon"]["level"],
                "icon": equip["flat"]["icon"],
                "main": equip["flat"]["weaponStats"][0]["statValue"],
                "sub": weaponSub !== "FIGHT_PROP_BASE_ATTACK" ? {
                    "prop": PROP[weaponSub].replace("百分比", ""),
                    "value": `${weaponSubValue}${weaponSub.endsWith("ELEMENT_MASTERY") ? "" : "%"}`,
                } : {},
            };
        } else if (equip["flat"]["itemType"] === "ITEM_RELIQUARY") {
            const mainProp = equip["flat"]["reliquaryMainstat"];
            const subProps = equip["flat"]["reliquarySubstats"] || [];
            const posIdx = Object.keys(POS).indexOf(equip["flat"]["equipType"]) + 1;
            const relicData = {
                "pos": posIdx,
                "rarity": equip["flat"]["rankLevel"],
                "name": HASH_TRANS[equip["flat"]["nameTextMapHash"]] || "缺少翻译",
                "setName": HASH_TRANS[equip["flat"]["setNameTextMapHash"]] || "缺少翻译",
                "level": equip["reliquary"]["level"] - 1,
                "main": {
                    "prop": PROP[mainProp["mainPropId"]],
                    "value": mainProp["statValue"]
                },
                "sub": subProps.map(s => {
                    return {
                        "prop": PROP[s["appendPropId"]],
                        "value": s["statValue"]
                    };
                }),
                "calc": {},
                "icon": equip["flat"]["icon"],
                "_appendPropIdList": equip["reliquary"]["appendPropIdList"] || []
            };
            relicData["calc"] = await calcRelicMark(relicData, res["element"], affixWeight, pointMark, maxMark);
            // 分数计算完毕后再将词条名称、数值转为适合 HTML 渲染的格式
            relicData["main"]["value"] = vStr(relicData["main"]["prop"], relicData["main"]["value"]);
            relicData["main"]["prop"] = kStr(relicData["main"]["prop"]);
            relicData["sub"] = relicData["sub"].map(s => {
                return {"prop": kStr(s["prop"]), "value": vStr(s["prop"], s["value"])};
            });
            // 额外数据处理
            relicData["calc"]["total"] = Math.round(relicData["calc"]["total"] * 10) / 10;
            delete relicData["_appendPropIdList"];
            relicSet[relicData["setName"]] = (relicSet[relicData["setName"]] || 0) + 1;
            res["relics"].push(relicData);
            // 累积圣遗物套装评分和计数器
            relicsMark += relicData["calc"]["total"];
            relicsCnt += 1;
        }
    }
    // 圣遗物套装
    res["relicSet"] = relicSet;
    res["relicCalc"] = {
        "rank": relicsCnt ? getRelicRank(relicsMark / relicsCnt) : "NaN",
        "total": Math.round(relicsMark * 10) / 10,
    };
    return res;
}

async function calcRelicMark(relicData, charElement, affixWeight, pointMark, maxMark) {
    console.log("进入了：calcRelicMark")
    const posIdx = relicData["pos"].toString();
    const relicLevel = relicData["level"];
    const mainProp = relicData["main"];
    const subProps = relicData["sub"];
    let Json = await ReturnJson();
    let RELIC_APPEND = Json["RELIC_APPEND"]

    // 主词条得分、主词条收益系数（百分数）
    let calcMain, calcMainPct;
    if (posIdx === "1" || posIdx === "2") {
        calcMain = 0.0;
        calcMainPct = 100;
    } else {
        // 角色元素属性与伤害属性不同时权重为 0，不影响物理伤害得分
        const charElementRemoved = mainProp["prop"].replace(charElement, "");
        const _mainPointMark = pointMark[charElementRemoved] || 0;
        const _point = _mainPointMark * mainProp["value"];
        // 主词条与副词条的得分计算规则一致，但只取 25%
        calcMain = _point * 46.6 / 6 / 100 / 4;
        // 主词条收益系数用于沙杯头位置主词条不正常时的圣遗物总分惩罚，最多扣除 50% 总分
        const _punishPct = _point / maxMark[posIdx]["main"] / 2 / 4;
        calcMainPct = 100 - 50 * (1 - _punishPct);
    }

    // 副词条得分
    const calcSubs = [];
    // for (const s of subProps) {
    //     const _subPointMark = pointMark[s["prop"]] || 0;
    //     const calcSub = _subPointMark * s["value"] * 46.6 / 6 / 100;
    //     // 副词条 CSS 样式
    //     const _awKey = s["prop"] === "生命值" || s["prop"] === "攻击力" || s["prop"] === "防御力" ? `${s['prop']}百分比` : s["prop"];
    //     const _subAffixWeight = affixWeight[_awKey] || 0;
    //     const subStyleClass = calcSub ? (_subAffixWeight > 79 ? "great" : "use") : "unuse";
    //     // [词条名, 词条数值, 词条得分]
    //     calcSubs.push({"style": subStyleClass, "goal": round(calcSub, 1)});
    // }
    for (let s of subProps) {
        let _subPointMark = pointMark[s.prop] || 0;
        let calcSub = (_subPointMark * s.value * 46.6 / 6 / 100) || 0;
        // 副词条 CSS 样式
        let _awKey = s.prop === "生命值" || s.prop === "攻击力" || s.prop === "防御力" ? `${s.prop}百分比` : s.prop;
        let _subAffixWeight = affixWeight[_awKey] || 0;
        let subStyleClass = (_subAffixWeight > 79 ? "great" : _subAffixWeight ? "use" : "unuse") || "unuse";
        // [词条名, 词条数值, 词条得分]
        calcSubs.push([subStyleClass, calcSub]);
    }

    // 总分对齐系数（百分数），按满分 66 对齐各位置圣遗物的总分
    const calcTotalPct = 66 / (maxMark[posIdx]["total"] * 46.6 / 6 / 100) * 100;
    // 最终圣遗物总分
    const _total = calcMain + calcSubs.reduce((acc, curr) => acc + curr["goal"], 0);
    const calcTotal = _total * calcMainPct * calcTotalPct / 10000;
// 强化歪次数
    let realAppendPropIdList = relicData['_appendPropIdList'].slice(-(Math.floor(relicLevel / 4)));
    let notHit = realAppendPropIdList.filter(x => !pointMark[PROP[RELIC_APPEND[x.toString()] || RELIC_APPEND[x.toString()]]]).length;
    return {
        "rank": getRelicRank(calcTotal),
        "total": calcTotal,
        "nohit": notHit,
        "main": Math.round(calcMain * 10) / 10,
        "sub": calcSubs.map(subRes => ({"style": subRes[0], "goal": Math.round(subRes[1] * 10) / 10})),
        "main_pct": Math.round(calcMainPct * 10) / 10,
        "total_pct": Math.round(calcTotalPct * 10) / 10,
    };
}

function getRelicRank(score) {
    console.log("进入了：getRelicRank")
    const rank = RANK_MAP.find(r => score <= r[1]);
    return rank ? rank[0] : score <= 66 ? "ERR" : null;
}

async function getRelicConfig(char, base = {}) {
    console.log("进入了：getRelicConfig")
    let Json = await ReturnJson()
    let CALC_RULES = Json["CALC_RULES"]
    const affixWeight = CALC_RULES[char] ?? {"攻击力百分比": 75, "暴击率": 100, "暴击伤害": 100};
    const sortedAffixWeight = Object.fromEntries(
        Object.entries(affixWeight).sort((a, b) => {
            return (
                b[1] - a[1] ||
                (a[0].includes("暴击") ? -1 : 1) ||
                (a[0].includes("加成") ? -1 : 1) ||
                (a[0].includes("元素") ? -1 : 1)
            );
        })
    );
    const pointMark = {};
    for (const [k, v] of Object.entries(sortedAffixWeight)) {
        pointMark[k] = v / GROW_VALUE[k];
    }
    if (pointMark["攻击力百分比"]) {
        pointMark["攻击力"] =
            (pointMark["攻击力百分比"] / (base["攻击力"] ?? 1020)) * 100;
    }
    if (pointMark["防御力百分比"]) {
        pointMark["防御力"] =
            (pointMark["防御力百分比"] / (base["防御力"] ?? 300)) * 100;
    }
    if (pointMark["生命值百分比"]) {
        pointMark["生命值"] =
            (pointMark["生命值百分比"] / (base["生命值"] ?? 400)) * 100;
    }
    const maxMark = {
        "1": {main: 0, total: 0},
        "2": {main: 0, total: 0},
        "3": {main: 0, total: 0},
        "4": {main: 0, total: 0},
        "5": {main: 0, total: 0},
    };
    for (let posIdx = 1; posIdx < 6; posIdx++) {
        // 主词条最高得分
        let mainAffix;
        if (posIdx <= 2) {
            // 花和羽不计算主词条得分
            mainAffix = (posIdx === 1) ? "生命值" : "攻击力";
            maxMark[posIdx.toString()]["main"] = 0;
            maxMark[posIdx.toString()]["total"] = 0;
        } else {
            // 沙杯头计算该位置评分权重最高的词条得分
            const avalMainAffix = Object.fromEntries(Object.entries(affixWeight).filter(([k, v]) => MAIN_AFFIXS[posIdx.toString()].includes(k)));
            mainAffix = Object.keys(avalMainAffix)[0];
            maxMark[posIdx.toString()]["main"] = affixWeight[mainAffix];
            maxMark[posIdx.toString()]["total"] = affixWeight[mainAffix] * 2;
        }
        // 副词条最高得分
        let maxSubAffixs = {};
        for (let k in affixWeight) {
            if (SUB_AFFIXS.includes(k) && k !== mainAffix && affixWeight[k]) {
                maxSubAffixs[k] = affixWeight[k];
            }
        }
        let subAffixList = Object.keys(maxSubAffixs).slice(0, 4);
        let totalScore = subAffixList.reduce((acc, k, kIdx) => {
            return acc + affixWeight[k] * (kIdx === 0 ? 1 : 6);
        }, 0);
        maxMark[posIdx.toString()]["total"] += totalScore;
        // 副词条最高得分
        // const maxSubAffixs = Object.fromEntries(Object.entries(affixWeight).filter(([k, v]) => SUB_AFFIXS.includes(k) && k !== mainAffix && affixWeight[k]));
        // maxMark[posIdx.toString()]["total"] += [...maxSubAffixs.entries()].slice(0, 4).reduce((sum, [k, v], kIdx) => sum + affixWeight[k] * (kIdx ? 6 : 1), 0);
    }
    return [affixWeight, pointMark, maxMark];
}


function vStr(prop, value) {
    if (["生命值", "攻击力", "防御力", "元素精通"].includes(prop)) {
        return String(value);
    } else {
        return String(Math.round(value * 10) / 10) + "%";
    }
}

/**
 * 转换词条名称为简短形式
 * @param {string} prop - 词条名称
 * @param {boolean} reverse - 是否反向转换，默认为false
 * @returns {string} - 转换后的词条名称
 */
function kStr(prop, reverse = false) {
    if (reverse) {
        return prop.replace("充能", "元素充能").replace("伤加成", "元素伤害加成").replace("物理元素", "物理");
    }
    return prop
        .replace("百分比", "")
        .replace("元素充能", "充能")
        .replace("元素伤害", "伤")
        .replace("物理伤害", "物伤");
}

function getServer(uid, teyvat = false) {
    if (uid[0] === "5") {
        return "cn_qd01";
    } else if (uid[0] === "6") {
        return teyvat ? "us" : "os_usa";
    } else if (uid[0] === "7") {
        return teyvat ? "eur" : "os_euro";
    } else if (uid[0] === "8") {
        return teyvat ? "asia" : "os_asia";
    } else if (uid[0] === "9") {
        return teyvat ? "hk" : "os_cht";
    } else {
        return "cn_gf01";
    }
}
