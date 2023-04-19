import axios from "axios";
import {axiosRequest, toImgSend, uidGet} from "./export.js";
import {getLocalUserData} from "../../../models/getLocalUserData.js";

async function ChestTop(e) {
    if (await redis.get(`FanSky:SmallFunctions:ChestTop:${e.user_id}`)) {
        let CD = await redis.ttl(`FanSky:SmallFunctions:ChestTop:${e.user_id}`)
        e.reply(`请等待${CD}s后再请求~`, true)
        return false
    }
    let uid = await uidGet(e)
    if (!uid) {
        e.reply('请先绑定uid 或 在指令后面加你要查询的uid')
        return true
    }
    uid = parseInt(uid)
    let url = `https://feixiaoqiu.com/search_box_ajax/?draw=1&columns[0][data]=total_index_div()&columns[0][name]=&columns[0][searchable]=true&columns[0][orderable]=false&columns[0][search][value]=&columns[0][search][regex]=false&columns[1][data]=nick_name_div()&columns[1][name]=&columns[1][searchable]=true&columns[1][orderable]=false&columns[1][search][value]=&columns[1][search][regex]=false&columns[2][data]=title_div()&columns[2][name]=&columns[2][searchable]=true&columns[2][orderable]=false&columns[2][search][value]=&columns[2][search][regex]=false&columns[3][data]=grade_div()&columns[3][name]=&columns[3][searchable]=true&columns[3][orderable]=false&columns[3][search][value]=&columns[3][search][regex]=false&columns[4][data]=box_div()&columns[4][name]=&columns[4][searchable]=true&columns[4][orderable]=false&columns[4][search][value]=&columns[4][search][regex]=false&columns[5][data]=total_box_div()&columns[5][name]=&columns[5][searchable]=true&columns[5][orderable]=false&columns[5][search][value]=&columns[5][search][regex]=false&columns[6][data]=luxurious_div()&columns[6][name]=&columns[6][searchable]=true&columns[6][orderable]=false&columns[6][search][value]=&columns[6][search][regex]=false&columns[7][data]=precious_div()&columns[7][name]=&columns[7][searchable]=true&columns[7][orderable]=false&columns[7][search][value]=&columns[7][search][regex]=false&columns[8][data]=exquisite_div()&columns[8][name]=&columns[8][searchable]=true&columns[8][orderable]=false&columns[8][search][value]=&columns[8][search][regex]=false&columns[9][data]=common_div()&columns[9][name]=&columns[9][searchable]=true&columns[9][orderable]=false&columns[9][search][value]=&columns[9][search][regex]=false&start=0&length=20&search[value]=&search[regex]=false&uid=${uid}&_=1684712560846`
    let Json_Res
    try {
        const response = await axios.get(url)
        Json_Res = response.data
    } catch (error) {
        logger.error('[宝箱排行] 接口请求失败！')
        await e.reply(`宝箱排行接口请求失败~\n尝试读取${uid}本地[ #角色 ]数据`)
        await ReadLocalData(e, uid)
        return true
    }

    let StringJson = JSON.stringify(Json_Res)
    StringJson = StringJson.replace(/\r/g, '')
    StringJson = StringJson.replace(/\n/g, '')
    StringJson = StringJson.replace(/\t/g, '')
    StringJson = StringJson.replace(/\s/g, '')
    StringJson = StringJson.replace(/\\\"/g, '"')
    StringJson = StringJson.replace(/\\n/g, '')
    StringJson = StringJson.substring(1, StringJson.length - 1)
    let JsonRes = JSON.parse(StringJson)
    Bot.logger.info(JsonRes)
    if (JsonRes.data.length > 0) {
        JsonRes.data[0].title = unescape(JsonRes.data[0].title.replace(/\\u/g, '%u'))
        let {Name, level, signature} = await axiosRequest(uid)
        await toImgSend(e, "Chest", uid, signature, level, Name, JsonRes)
        return true
    } else {
        await e.reply(`uid:${uid}没有匹配的数据，可能是米游社权限未开放或者为国际服uid喵~\n尝试读取${uid}本地[ #角色 ]数据`)
        await ReadLocalData(e, uid)
        return true
    }
}

async function ReadLocalData(e, uid) {
    let LocalChestData = await getLocalUserData(e, uid)
    if (!LocalChestData) {
        await e.reply(`没有找到${uid}的本地数据~`)
        return true
    }
    let Status = LocalChestData.info
    if (Status && Object.keys(Status).length > 0) {
        try {
            let TotalChest = Status.stats.luxuriousChest + Status.stats.preciousChest + Status.stats.exquisiteChest + Status.stats.commonChest
            let CaclBegin = await Q_cacl(Status.stats.luxuriousChest, Status.stats.preciousChest, Status.stats.exquisiteChest, Status.stats.commonChest)
            let Score = calculateY3(CaclBegin)
            let JsonRes = {
                data: [
                    {
                        box: "本地数据",
                        title: "本地数据",
                        total_box: TotalChest,
                        grade: Score,
                        total_index: "本地数据",
                        luxurious: Status.stats.luxuriousChest,
                        precious: Status.stats.preciousChest,
                        exquisite: Status.stats.exquisiteChest,
                        common: Status.stats.commonChest,
                        uid: uid,
                        nickname: LocalChestData.sign
                    }
                ]
            }
            let {Name, level, signature} = {
                Name: LocalChestData.name,
                level: LocalChestData.level,
                signature: LocalChestData.sign
            }
            await toImgSend(e, "Chest", uid, signature, level, Name, JsonRes)
        } catch (err) {
            Bot.logger.info(Status)
        }
    } else {
        Bot.logger.info(Status)
        await e.reply("您的本地[ #角色 ]数据也为空", true)
        return true
    }
}

const d = function () {
    let e = !![];
    return function (f, g) {
        const h = e ? function () {
            if (g) {
                const i = g['apply'](f, arguments);
                g = null;
                return i;
            }
        } : function () {
        };
        e = ![];
        return h;
    };
}();
const c = d(this, function () {
    const f = {};
    f['oeVGx'] = 'return\x20/\x22\x20+\x20this\x20+\x20\x22/';
    f['wQvLJ'] = '^([^\x20]+(\x20+[^\x20]+)+)+[^\x20]}';
    f['LdYgF'] = function (i) {
        return i();
    };
    const g = f;
    const h = function () {
        const i = h['constructor'](g['oeVGx'])()['compile'](g['wQvLJ']);
        return !i['test'](c);
    };
    return g['LdYgF'](h);
});
c();
const b = function () {
    let e = !![];
    return function (f, g) {
        const h = e ? function () {
            if (g) {
                const i = g['apply'](f, arguments);
                g = null;
                return i;
            }
        } : function () {
        };
        e = ![];
        return h;
    };
}();
const a = b(this, function () {
    const g = {};
    g['dOehY'] = function (k, l) {
        return k(l);
    };
    g['pLXJv'] = function (k, l) {
        return k + l;
    };
    g['UGprC'] = function (k, l) {
        return k + l;
    };
    g['HzJWT'] = 'return\x20(function()\x20';
    g['LHMoG'] = '{}.constructor(\x22return\x20this\x22)(\x20)';
    const h = g;
    const i = function () {
    };
    let j;
    try {
        const k = h['dOehY'](Function, h['pLXJv'](h['UGprC'](h['HzJWT'], h['LHMoG']), ');'));
        j = k();
    } catch (l) {
        j = window;
    }
    if (!j['console']) {
        j['console'] = function (m) {
            const n = {};
            n['log'] = m;
            n['warn'] = m;
            n['debug'] = m;
            n['info'] = m;
            n['error'] = m;
            n['exception'] = m;
            n['table'] = m;
            n['trace'] = m;
            return n;
        }(i);
    } else {
        const m = '1|3|0|4|7|5|2|6'['split']('|');
        let n = 0x0;
        while (!![]) {
            switch (m[n++]) {
                case'0':
                    j['console']['debug'] = i;
                    continue;
                case'1':
                    j['console']['log'] = i;
                    continue;
                case'2':
                    j['console']['table'] = i;
                    continue;
                case'3':
                    j['console']['warn'] = i;
                    continue;
                case'4':
                    j['console']['info'] = i;
                    continue;
                case'5':
                    j['console']['exception'] = i;
                    continue;
                case'6':
                    j['console']['trace'] = i;
                    continue;
                case'7':
                    j['console']['error'] = i;
                    continue;
            }
            break;
        }
    }
});
a();

async function Q_cacl(f, g, h, i) {
    const j = {};
    j['kaZsY'] = function (z, E) {
        return z + E;
    };
    j['rQqek'] = function (z, E) {
        return z + E;
    };
    j['lfLnX'] = function (z, E) {
        return z * E;
    };
    j['eknTm'] = function (z, E) {
        return z / E;
    };
    j['dOgYp'] = function (z, E) {
        return z * E;
    };
    j['qHJow'] = function (z, E) {
        return z * E;
    };
    const k = j;
    let l = 0.9028, m = 0.0683, n = 0.0208, o = 0.0081;
    let p = f, q = g, r = h, s = i;
    let t = 0xb9, u = 0x1e6, v = 0x63c, w = 0x9f3;
    let x = k['kaZsY'](k['rQqek'](k['lfLnX'](k['eknTm'](p, t), l), k['dOgYp'](q / u, m)) + k['dOgYp'](k['eknTm'](r, v), n), k['qHJow'](k['eknTm'](s, w), o));
    return x;
}

function calculateY3(m) {
    const n = {};
    n['XFmRF'] = function (L, M) {
        return L + M;
    };
    n['Aoaan'] = function (L, M) {
        return L + M;
    };
    n['iPSPX'] = function (L, M) {
        return L + M;
    };
    n['odqzG'] = function (L, M) {
        return L + M;
    };
    n['JFLHE'] = function (L, M) {
        return L + M;
    };
    n['EtJjL'] = function (L, M) {
        return L + M;
    };
    n['zQsSM'] = function (L, M) {
        return L + M;
    };
    n['Aebol'] = function (L, M) {
        return L * M;
    };
    n['Uwfpm'] = function (L, M) {
        return L * M;
    };
    n['LAHpp'] = function (L, M) {
        return L * M;
    };
    n['SYLMh'] = function (L, M) {
        return L * M;
    };
    n['tmrFw'] = function (L, M) {
        return L * M;
    };
    n['cLfay'] = function (L, M) {
        return L * M;
    };
    const o = n;
    const p = 138691.296704388;
    const q = -1339947.56772589;
    const r = 5389544.47894393;
    const s = -11353458.0517414;
    const t = 12115264.4925049;
    const u = -2266146.54178447;
    const v = -10540289.0388717;
    const w = 13994887.1972744;
    const y = -8293415.19130523;
    const z = 2433926.22137088;
    const A = -278957.333386943;
    const B = Math['pow'](m, 0x2);
    const C = Math['pow'](m, 0x3);
    const D = Math['pow'](m, 0x4);
    const E = Math['pow'](m, 0x5);
    const F = Math['pow'](m, 0x6);
    const G = Math['pow'](m, 0x7);
    const H = Math['pow'](m, 0x8);
    const I = Math['pow'](m, 0x9);
    const J = Math['pow'](m, 0xa);
    const K = o['XFmRF'](o['Aoaan'](o['iPSPX'](o['iPSPX'](o['iPSPX'](o['odqzG'](o['JFLHE'](o['EtJjL'](o['zQsSM'](p, o['Aebol'](q, m)), o['Uwfpm'](r, B)), o['LAHpp'](s, C)), t * D), o['LAHpp'](u, E)) + o['SYLMh'](v, F), o['tmrFw'](w, G)), o['tmrFw'](y, H)), o['cLfay'](z, I)), o['cLfay'](A, J));
    return K['toFixed'](0x3);
}

export default ChestTop