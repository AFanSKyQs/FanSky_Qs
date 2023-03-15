import {ELEM, GROW_VALUE, MAIN_AFFIXS, POS, PROP, RANK_MAP, SKILL, SUB_AFFIXS} from "../../models/Teyvat/index.js"
import ReturnConfig from "./ReadTeyvatJson.js";
import _ from 'lodash';
import fetch from 'node-fetch';
import moment from 'moment';
// import redisInit from '../../../../lib/config/redis.js';    //  仅限本地测试使用


/** 小助手请求头 */
const headers = {
    referer: 'https://servicewechat.com/wx2ac9dce11213c3a8/192/page-frame.html',
    'user-agent':
        'Mozilla/5.0 (Linux; Android 12; SM-G977N Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/4375 MMWEBSDK/20221011 Mobile Safari/537.36 MMWEBID/4357 MicroMessenger/8.0.30.2244(0x28001E44) WeChat/arm64 Weixin GPVersion/1 NetType/WIFI Language/zh_CN ABI/arm64 MiniProgramEnv/android',
};

// 本地测试路径
let DATA_PATH = `E:/Bot_V3/yunzai/Yunzai-Bot/plugins/FanSky_Qs/config/TeyvatConfig/TeyvatUrlJson.json`;

async function ReturnJson() {
    console.log("DATA_PATH" + DATA_PATH)
    return await ReturnConfig(DATA_PATH)
}

/** 
 * 仅限本地测试使用
 * 开启需要redis:
 * - 取消注释 6 & 30行
 * - 注释 redis.js => 14 & 80行 
 */
// await redisInit();
await getSingle("117556563", "魈");  //  单人伤害：uid, 角色名
// await getTeam('117556563'); //队伍伤害：uid，角色列表

/**
 * 获取小助手对应功能的数据
 * @param {String} TBody 请求需要的数据
 * @param {String} type 功能对应api 默认为 Single
 * @returns 小助手返回数据
 */
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
async function getTeam (uid, chars = [], showDetail = false) {
    // 获取面板数据
    const data = await getAvatarData(uid, "全部");
    if (data.error) return data.error;

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
    const extractCopy = extract;
    const TiwateBody = await transTeyvatData(extractCopy, uid);
    const TiwateRaw = await getTeyvatData(TiwateBody, "team");
    if (TiwateRaw["code"] !== 200 || !TiwateRaw["result"]) {
        console.log(`UID${uid} 的 ${extract.length} 位角色队伍伤害计算请求失败！\n>>>> [提瓦特返回] ${JSON.stringify(TiwateRaw)}`);
        return TiwateRaw ? `玩家 ${uid} 队伍伤害计算失败，接口可能发生变动！` : "啊哦，队伍伤害计算小程序状态异常！";
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

    // todo: @return html数据
    // const htmlBase = LOCAL_DIR.resolve().toString();
    return;
}

/**
 * 原神游戏内角色展柜消息生成入口(无需前台展示)
 * @param {String} uid 查询用户 UID
 * @param {String} char 全部 || 查询角色
 * @returns 查询结果
 */
async function getSingle (uid, char = '全部') {
    // 获取面板数据
    let data = await getAvatarData(uid, char);
    if (data.error) return data.error;

    let mode = char == '全部' ? 'list' : 'panel';
    return mode;
}

/**
 * 角色数据获取（内部格式）
 * @param {String} uid 查询用户 UID
 * @param {String} char 全部 || 查询角色名
 * @returns 查询结果。出错时返回 ``{"error": "错误信息"}``
 */
async function getAvatarData (uid, char = "全部") {
    console.log("进入了：getAvatarData");
    const cache = await getCache(uid);
    let cacheData = cache?.rolesData || {}, nextQueryTime = cache?.rolesData?.next || 0;
    let refreshed = [], _tip = "", _time = 0;

    if (Date.now() <= nextQueryTime) {
        _tip = 'warning';
        _time = nextQueryTime;
        console.info(`UID ${uid} 的角色展柜数据刷新冷却还有 ${moment(nextQueryTime).diff(moment(), 'seconds')} 秒！`);
    } else {
        console.info(`UID ${uid} 的角色展柜数据正在刷新！`);
        const newData = await requestDataApi(uid);
        _time = Date.now();
        // 没有缓存 & 本次刷新失败，返回错误信息
        if (_.isEmpty(cacheData) && newData.error) {
            return newData;
        } else if (!newData.error) {
        // 本次刷新成功，处理全部角色
            _tip = 'success';
            let avatarsCache = {};
            _.each(cacheData.avatars || [], x => {
                avatarsCache[x.id] = x;
            });
            const now = Date.now();
            let wait4Dmg = {}, avatars = [];
            for (const newKey in newData.avatarInfoList) {
                let newAvatar = newData.avatarInfoList[newKey];
                if ([10000005, 10000007].includes(newAvatar.avatarId)) {
                    console.info("旅行者面板查询暂未支持！");
                    continue;
                }
                let tmp = await transFromEnka(newAvatar, now), gotDmg = false;
                
                if (_.has(avatarsCache, tmp.id)) {
                    // 保留旧的伤害数据
                    _.omit(avatarsCache[tmp.id], 'time');
                    let cacheDmg = _.omit(avatarsCache[tmp.id], 'damage');
                    let nowStat = {};
                    _.each(tmp, (v, k) => {
                        if (!['damage', 'time'].includes(k)) {
                            nowStat[k] = v;
                        }
                    });
                    if (cacheDmg && avatarsCache[tmp.id] == nowStat) {
                        console.log(`UID${uid} 的 ${tmp.name} 伤害计算结果无需刷新`);
                        tmp.damage = cacheDmg;
                        gotDmg = true;
                    } else {
                        console.log(`UID${uid} 的 ${tmp.name} 数据变化细则：\n${avatarsCache[tmp.id]}\n${nowStat}`);
                    }
                }
                refreshed.push(tmp.id);
                avatars.push(tmp);
                if (!gotDmg) {
                    wait4Dmg[avatars.length - 1] = tmp;
                }
            }

            if (!_.isEmpty(wait4Dmg)) {
                console.log("wait4Dmg typeof:" + typeof wait4Dmg)
                let _names = [];
                _.each(wait4Dmg, (a, aI) => {
                    _names[aI] = a.name;
                });
                console.log(`正在为 UID ${uid} 的 ${_names.join('/')} 重新请求伤害计算接口`);
                const wtf = Object.values(wait4Dmg).map(x => ({...x})); 
                const teyvatBody = await transTeyvatData(wtf, uid);
                const teyvatRaw = await getTeyvatData(teyvatBody);
                if (teyvatRaw.code != 200 || _.size(wait4Dmg) != teyvatRaw.result.length) {
                    console.log(`UID ${uid} 的 ${_.size(wait4Dmg)} 位角色伤害计算请求失败！\n>>>> [提瓦特返回] ${teyvatRaw}`);
                } else {
                    for (const dmgIdx in teyvatRaw.result) {
                        let aIdx = parseInt(_.keys(wait4Dmg)[dmgIdx]);
                        let dmgData = teyvatRaw.result[dmgIdx];
                        avatars[aIdx].damage = await simplDamageRes(dmgData);
                    }
                } 
            }

            cacheData.avatars = [...avatars];
            _.each(avatarsCache, aData => {
                if (!refreshed.includes(aData.id)) {
                    cacheData.avatars.push(aData);
                }
            });
            cacheData.next = +moment(now).add(newData.ttl, 's');  //  cd 60s
            cache['rolesData'] = cacheData;
            await redis.set(`FanSky:Teyvet:${uid}`, JSON.stringify(cache)); 
        } else {
            // 有缓存 & 本次刷新失败，打印错误信息
            _tip = 'error';
            console.log(newData.error);
        }
    }

    // 获取所需角色数据
    if (char == '全部') {
        // 为本次更新的角色添加刷新标记
        _.each(cacheData.avatars, (aData, aIdx) => {
            cacheData.avatars[aIdx].refreshed = refreshed.includes(aData.id);
        });
        // 格式化刷新时间
        let _datetime = moment(_time).format('YYYY-MM-DD HH:mm:ss');
        cacheData.timetips = [_tip, _datetime];
        return cacheData;
    }

    let searchRes = _.filter(cacheData.avatars, x => x.name == char);
    return _.isEmpty(searchRes) ? {
        'error': `UID ${uid} 游戏内展柜中的 ${cacheData.avatars.length} 位角色中没有 ${char}！`
    } : searchRes[0];
}

/**
 * 转换角色伤害计算请求数据为精简格式
 * @param {Object} damage 角色伤害计算请求数据，由 getTeyvatData()["result"][int] 获取
 * @returns 精简格式伤害数据，出错时返回 {}
 */
async function simplDamageRes(damage) {
    console.log("进入了：simplDamageRes")
    const res = {level: damage["zdl_result"] || "NaN", data: [], buff: []};
    for (const key of ["damage_result_arr", "damage_result_arr2"]) {
        console.log(`------------damage[${key}]------------`)
        _.each(damage[key], dmgDetail => {
            let dmgTitle = key=='damage_result_arr2'? `[${damage.zdl_result2}]<br>` : dmgDetail.title;
            let dmgCrit = '', dmgExp = '';
            if (_.includes(dmgDetail.value, '期望') || !dmgDetail.expect) {
                dmgCrit = '-';
                dmgExp = _.replace(dmgDetail.value, '期望', '');
            } else {
                dmgCrit = dmgDetail.value;
                dmgExp = _.replace(dmgDetail.expect, '期望', '');
            }
            res.data.push([dmgTitle, dmgCrit, dmgExp]);
        });
    }
    _.each(damage.bonus, buff => {
        let intro = _.isString(buff) ? damage.bonus[buff].intro : buff.intro;
        let [buffTitle, buffDetail] = intro.split("：");
        if (!["注", "备注"].includes(buffTitle)) {
            res.buff.push([buffTitle, buffDetail]);
        }
    });
    console.log("-----------数据检查simplDamageRes(damage)-------------")
    console.log(res)
    return res;
}

/**
 * 转换队伍伤害计算请求数据为精简格式
 * @param {Object} raw 队伍伤害计算请求数据，由 getTeyvatData(*, "team")["result"] 获取
 * @param {Object} rolesData 角色数据，键为角色中文名，值为内部格式
 * @returns {Object} 精简格式伤害数据。出错时返回 {"error": "错误信息"}
 */
async function simplTeamDamageRes (raw, rolesData) {
    console.log('进入simplTeamDamageRes');
    let [tm, total] = raw['zdl_tips0'].replace(/你的队伍|，DPS为:/g,'').split("秒内造成总伤害");
    let pieData = [], pieColor = [];
    _.each(raw.chart_data, v => {
        let name_split = v.name.split('\n')
        pieData.push({
            'char': name_split[0],
            'damage': parseFloat(name_split[1].replace('W', ''))
        });
        pieColor.push(v.label.color);
    })
    pieData = _.sortBy(pieData, 'damage').reverse();
    // 寻找伤害最高的角色元素属性，跳过绽放等伤害来源
    let elem = _.map(_.filter(pieData, i => rolesData[i.char]), v => rolesData[v.char].element)[0];

    let avatars = {};
    _.each(raw.role_list, role => {
        let panelData = rolesData[role.role];

        let relicSet = _.pickBy(panelData.relicSet, i=> i>=2);
        let relics = _.map(_.filter(panelData.relics, r => _.keys(relicSet).includes(r.setName)), v => _.nth(v.icon.split('_'), -2));
        relics = _.countBy(relics, v => v);
        let sets = {};
        _.each(relics, (r, k) => {
            sets[k] = r < 4 ? 2 : 4;
        });
        
        let skills = [];
        _.each(panelData.skills, skill => {
            skills.push({
                "icon": skill.icon,
                "style": skill.style,
                "level": skill.level,
            });
        });

        avatars[role.role] = {
            "rarity": role.role_star,
            "icon": panelData.icon,
            "name": role.role,
            "elem": panelData.element,
            "cons": role.role_class,
            "level": role.role_level.replace('Lv', ''),
            "weapon": {
                "icon": panelData.weapon.icon,
                "level": panelData.weapon.level,
                "rarity": panelData.weapon.rarity,
                "affix": panelData.weapon.affix,
            },
            "sets": sets,
            "cp": _.round(panelData.fightProp["暴击率"], 1),
            "cd": _.round(panelData.fightProp["暴击伤害"], 1),
            "key_prop": role.key_ability,
            "key_value": role.key_value,
            "skills": skills,
        }
    });
    
    _.each(raw.recharge_info, rechargeData => {
        let [name, tmp] = rechargeData.recharge.split('共获取同色球');
        let [same, diff] = tmp.split("个，异色球");
        if (diff.split("个，无色球").length === 2) {
            // 暂未排版无色球
            diff = diff.split("个，无色球")[0];
        }
        avatars[name].recharge = {
            "pct": rechargeData.rate,
            "same": _.round(parseFloat(same), 1),
            "diff": _.round(parseFloat(diff.replace("个", "")), 1),
        };
    });

    let damages = [];
    for (let step of raw.advice) {
        if (!step.content) {
            logger.error(`奇怪的伤害：${step}`);
            continue;
        }
        let [t, s] = step.content.split(' ');
        let a = s.split('，')[0], d = []
        if (s.split('，').length === 1) {
            d = ['-', '-', '-'];
        } else {
            let dmgs = s.split('，')[1];
            if (dmgs.split(',').length === 1) {
                d = ['-', '-', _.last(dmgs.split(',')[0].split('：'))];
            } else {
                d = []; 
                _.each(dmgs.split(','), dd => {
                    d.push(_.last(dd.split(':')));
                });     
            }
        }
        damages.push([t.replace('s', ''), _.toUpper(a), ...d]);
    }

    let buffs = [];
    for (let buff of raw.buff) {
        if (!buff.content) {
            logger.error(`奇怪的伤害：${step}`);
            continue;
        }
        let [t, tmp] = buff.content.split(' ');
        let b = tmp.split("-")[0], bd = _.tail(tmp.split('-')).join('-');
        buffs.push([t.replace('s', ''), _.toUpper(b), _.toUpper(bd)]);
    }

    return {
        "uid": raw.uid,
        "elem": elem,
        "rank": raw.zdl_tips2,
        "dps": raw.zdl_result,
        "tm": tm,
        "total": total,
        "pie_data": JSON.stringify(pieData),
        "pie_color": JSON.stringify(pieColor),
        "avatars": avatars,
        "actions": raw.combo_intro.split(","),
        "damages": damages,
        "buffs": buffs,
    }
}

/**
 * 角色数据转小助手请求格式
 * @param {Object} avatarsData 角色数据
 * @param {String} uid 查询uid
 * @returns 请求格式数据
 */
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
            "crit": `${_.round(fightProp['暴击率'], 1)}%`,
            "crit_dmg": `${_.round(fightProp['暴击伤害'], 1)}%`,
            "heal": `${_.round(fightProp['治疗加成'], 1)}%`,
            "recharge": `${_.round(fightProp['元素充能效率'], 1)}%`,
            "fire_dmg": `${_.round(fightProp['火元素伤害加成'], 1)}%`,
            "water_dmg": `${_.round(fightProp['水元素伤害加成'], 1)}%`,
            "thunder_dmg": `${_.round(fightProp['雷元素伤害加成'], 1)}%`,
            "wind_dmg": `${_.round(fightProp['风元素伤害加成'], 1)}%`,
            "ice_dmg": `${_.round(fightProp['冰元素伤害加成'], 1)}%`,
            "rock_dmg": `${_.round(fightProp['岩元素伤害加成'], 1)}%`,
            "grass_dmg": `${_.round(fightProp['草元素伤害加成'], 1)}%`,
            "physical_dmg": `${_.round(fightProp['物理伤害加成'], 1)}%`,
            "artifacts": _.map(_.pickBy(relicSet, (v, k) => v>=2 || k.includes('之人')), (v1, k1) => `${k1}${v1>=4 ? 4 : v1>=2 ? 2 : 1 }`).join('+'),
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

/**
 * 转换 Enka.Network 角色查询数据为内部格式
 * @param {Object} avatarInfo Enka.Network 角色查询数据，取自 data["avatarInfoList"] 列表
 * @param {Number} ts 数据时间戳
 * @returns 内部格式角色数据，用于本地缓存等
 */
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


/**
 * 指定角色圣遗物评分计算
 * @param {Object} relicData 圣遗物数据
 * @param {String} charElement 角色的中文元素属性
 * @param {Object} affixWeight 色的词条评分权重，由 getRelicConfig() 获取
 * @param {Object} pointMark 角色的词条数值原始权重，由 getRelicConfig() 获取
 * @param {Object} maxMark 角色的各位置圣遗物最高得分，由 getRelicConfig() 获取
 * @returns 圣遗物评分结果
 */
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

/** 
 * 圣遗物评级获取
 * 在角色等级较低（基础数值较低）时评级可能显示为 "ERR"
 * 注：角色等级较低时不为 "ERR" 的评分也有可能出错
 */
function getRelicRank(score) {
    console.log("进入了：getRelicRank")
    const rank = RANK_MAP.find(r => score <= r[1]);
    return rank ? rank[0] : score <= 66 ? "ERR" : null;
}

/**
 *  指定角色圣遗物计算配置获取，包括词条评分权重、词条数值原始权重、各位置圣遗物总分理论最高分和主词条理论最高得分 
 * @param {String} char 角色名
 * @param {Object} base 角色的基础数值，可由 Enka 返回获得，格式为 {"生命值": 1, "攻击力": 1, "防御力": 1}
 * @returns 词条评分权重、词条数值原始权重、各位置圣遗物最高得分
 */
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

/** 转换词条数值为字符串形式 */
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

/**
 * uid=>服务器
 * @param {String} uid 查询uid
 * @param {Boolean} teyvat 小助手 默认false
 * @returns 
 */
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

/** 获取缓存数据 */
async function getCache (uid) {
    let key = `FanSky:Teyvet:${uid}`;
    if (await redis.exists(key)) {
        return JSON.parse(await redis.get(key));
    } else {
        return {};
    }
}