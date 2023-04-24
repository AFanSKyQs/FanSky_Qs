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

export async function savaHistoryData(JsonData) {
    let jsonArray = [];
    let uid = JsonData.data.uid
    let Change = {}
    Change.uid = JsonData.data.uid
    Change.elem = JsonData.data.elem
    Change.rank = JsonData.data.rank
    Change.dps = JsonData.data.dps
    Change.tm = JsonData.data.tm
    Change.total = Number(JsonData.data.total.match(/\d+\.\d+/)[0])
    Change.RoleData = JsonData.RoleData
    Change.avatars = JsonData.data.avatars
    let TempJson = await redis.get(`FanSky:Teyvat:HistoryTeam:DPS:${uid}`);
    if (!TempJson) {
        jsonArray.push(Change)
    } else {
        jsonArray = JSON.parse(TempJson)
        jsonArray.push(Change)
        jsonArray.sort((a, b) => b.dps - a.dps);
        if (jsonArray.length >= 10) {
            jsonArray = jsonArray.slice(0, 10)
        }
    }
    await redis.set(`FanSky:Teyvat:HistoryTeam:DPS:${uid}`, JSON.stringify(jsonArray));
}