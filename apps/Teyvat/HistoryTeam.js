export async function HistoryTeam(e) {
    await e.reply("正在开发中，请耐心等待~")
    return false

    let msg = e.msg || e.original_msg || e.raw_message || "#历史队伍伤害"
    const regexTeam = /^#历史队伍伤害(DPS|Dps|dps|总伤害|总伤)?(\d+)?(.*)$/;
    const matchTeam = msg.match(regexTeam);
    let uid = matchTeam[2] ? matchTeam[2] : await GetAtUid(e) || await GetNowUid(e)
    let UserHistory = JSON.parse(await redis.get(`FanSky:Teyvat:HistoryTeam:DPS:${uid}`))
}

async function GetNowUid(e) {
    let NoteUser = e.user
    return NoteUser._regUid
}

async function GetAtUid(e) {
    let UserQQ
    try {
        UserQQ = e.at
    } catch (err) {
        for (const X of e.message) {
            if (X.type === "at") {
                UserQQ = X.qq
            }
        }
    }
    UserQQ = Number(UserQQ)
    let UID = await redis.get(`Yz:genshin:mys:qq-uid:${UserQQ}`)
    if (UID) {
        return UID
    } else {
        return null
    }
}

async function  extractNumber(str) {
    if (!str) return 0

    let number = ''
    for (let i = 0; i < str.length; i++) {
        if ((str[i] >= '0' && str[i] <= '9') || str[i] === '.') {
            number += str[i]
        }
    }
    return parseFloat(number) || 0
}


export async function savaHistoryData(JsonData) {
    let jsonArray = [];
    let uid = JsonData.data.uid
    let historyEntry = {
        uid: uid,
        elem: JsonData.data.elem,
        rank: JsonData.data.rank,
        dps: JsonData.data.dps,
        tm: JsonData.data.tm,
        total: await extractNumber(JsonData.data.total),
        RoleData: JsonData.RoleData,
        avatars: JsonData.data.avatars
    };
    let TempJson = await redis.get(`FanSky:Teyvat:HistoryTeam:DPS:${uid}`);
    if (!TempJson) {
        jsonArray.push(historyEntry)
    } else {
        jsonArray = JSON.parse(TempJson)
        let avatarsKeys = Object.keys(JsonData.data.avatars);
        let isExist = false;
        for (let i = 0; i < jsonArray.length; i++) {
            let tempKeys = Object.keys(jsonArray[i].avatars);
            if (tempKeys.length === avatarsKeys.length && tempKeys.every(key => avatarsKeys.includes(key))) {
                isExist = true;
                if (jsonArray[i].dps < historyEntry.dps) {
                    jsonArray[i] = historyEntry;
                }
                break;
            }
        }
        if (!isExist) {
            jsonArray.push(historyEntry)
        }
        jsonArray.sort((a, b) => b.dps - a.dps);
        if (jsonArray.length >= 10) {
            jsonArray = jsonArray.slice(0, 10)
        }
    }
    await redis.set(`FanSky:Teyvat:HistoryTeam:DPS:${uid}`, JSON.stringify(jsonArray));
}