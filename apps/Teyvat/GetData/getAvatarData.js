import moment from 'moment/moment.js'
import RequestEnka from '../../../models/RequestEnka.js'
import _ from 'lodash'
import {getTeyvatData, simpleDamageRes, transFromEnka, transToTeyvatRequest} from '../Index.js'
/**
 * 仅限本地测试使用
 * 开启需要redis:
 * - 取消注释 6 & 30行
 * - 注释 redis.js => 14 & 80行
 */
// import redisInit from '../../../../lib/config/redis.js' // 仅限本地测试
// await redisInit()

/**
 * 角色数据获取（内部格式）
 * @param Json 配置文件
 * @param {String} uid 查询用户 UID
 * @param {String} char 全部 || 查询角色名
 * @param e 事件
 * @returns 查询结果。出错时返回 ``{"error": "错误信息"}``
 */
async function getAvatarData(Json, uid, char = '全部', e) {
    let cache = await getCache(uid, 'rolesData')
    let cacheData = cache;
    let nextQueryTime = cache?.next || 0
    let refreshed = [];
    let _tip = '';
    let _time = 0

    if (Date.now() <= nextQueryTime) {
        _tip = 'warning'
        _time = nextQueryTime
        logger.mark(`UID ${uid} 的角色展柜数据刷新冷却还有 ${moment(nextQueryTime).diff(moment(), 'seconds')} 秒！`)
        return { error: `UID ${uid} 的角色展柜数据刷新冷却还有 ${moment(nextQueryTime).diff(moment(), 'seconds')} 秒！` };
    } else {
        logger.mark(`UID ${uid} 的角色展柜数据正在刷新！`)
        const newData = await RequestEnka(uid)
        _time = Date.now()
        // 没有缓存 & 本次刷新失败，返回错误信息
        if (_.isEmpty(cacheData) && newData.error) {
            return newData
        } else if (!newData.error) {
            // 本次刷新成功，处理全部角色
            _tip = 'success'
            let avatarsCache = {}
            _.each(cacheData.avatars || [], x => {
                avatarsCache[x.id] = x
            })
            const now = Date.now()
            let wait4Dmg = {};
            let avatars = []
            for (const newKey in newData.avatarInfoList) {
                let newAvatar = newData.avatarInfoList[newKey]
                if ([10000005, 10000007].includes(newAvatar.avatarId)) {
                    logger.error('旅行者面板查询暂未支持！')
                    continue
                }
                let tmp = await transFromEnka(Json, newAvatar, now);
                let gotDmg = false

                if (_.has(avatarsCache, tmp.id)) {
                    // 保留旧地伤害数据
                    _.omit(avatarsCache[tmp.id], 'time')
                    let cacheDmg = _.omit(avatarsCache[tmp.id], 'damage')
                    let nowStat = {}
                    _.each(tmp, (v, k) => {
                        if (!['damage', 'time'].includes(k)) {
                            nowStat[k] = v
                        }
                    })
                    if (cacheDmg && avatarsCache[tmp.id] === nowStat) {
                        logger.mark(`UID${uid} 的 ${tmp.name} 伤害计算结果无需刷新`)
                        tmp.damage = cacheDmg
                        gotDmg = true
                    } else {
                        logger.mark(`UID${uid} 的 ${tmp.name} 数据变化了`)
                        // console.log(avatarsCache[tmp.id])
                        // console.log(nowStat)
                    }
                }
                refreshed.push(tmp.id)
                avatars.push(tmp)
                if (!gotDmg) {
                    wait4Dmg[avatars.length - 1] = tmp
                }
            }

            if (!_.isEmpty(wait4Dmg)) {
                let _names = []
                _.each(wait4Dmg, (a, aI) => {
                    _names[aI] = a.name
                })
                logger.mark(`正在为 UID ${uid} 的 ${_names.join('/')} 重新请求伤害计算接口`)
                const wtf = Object.values(wait4Dmg).map(x => ({...x}))
                const teyvatBody = await transToTeyvatRequest(wtf, uid)
                const teyvatRaw = await getTeyvatData(teyvatBody)
                if (teyvatRaw.code !== 200 || _.size(wait4Dmg) !== teyvatRaw.result.length) {
                    logger.mark(`UID ${uid} 的 ${_.size(wait4Dmg)} 位角色伤害计算请求失败！\n>>>> [提瓦特返回] ${teyvatRaw}`)
                    return { error: `UID ${uid} 的 ${_.size(wait4Dmg)} 位角色伤害计算请求失败！` };
                } else {
                    for (const dmgIdx in teyvatRaw.result) {
                        let aIdx = parseInt(_.keys(wait4Dmg)[dmgIdx])
                        let dmgData = teyvatRaw.result[dmgIdx]
                        // console.log(teyvatRaw.result[dmgIdx])
                        // zdl_tips0:'经鉴定，你的钟离角色伤害评级为:'
                        avatars[aIdx].damage = await simpleDamageRes(dmgData)
                    }
                }
            }

            cacheData.avatars = [...avatars]
            _.each(avatarsCache, aData => {
                if (!refreshed.includes(aData.id)) {
                    cacheData.avatars.push(aData)
                }
            })
            cacheData.next = +moment(now).add(newData.ttl + 20, 's') //  cd 60s
            cache = cacheData
            await redis.set(`FanSky:Teyvet:${uid}:rolesData`, JSON.stringify(cache))
        } else {
            // 有缓存 & 本次刷新失败，打印错误信息
            _tip = 'error'
            logger.error(newData.error)
        }
    }

    // 获取所需角色数据
    if (char === '全部') {
        // 为本次更新的角色添加刷新标记
        _.each(cacheData.avatars, (aData, aIdx) => {
            cacheData.avatars[aIdx].refreshed = refreshed.includes(aData.id)
        })
        // 格式化刷新时间
        let _datetime = moment(_time).format('YYYY-MM-DD HH:mm:ss')
        cacheData.timetips = [_tip, _datetime]
        return cacheData
    }

    let searchRes = _.filter(cacheData.avatars, x => x.name === char)
    return _.isEmpty(searchRes)
        ? {
            error: `UID ${uid} 游戏内展柜中的 ${cacheData.avatars.length} 位角色中没有 ${char}！`
        }
        : searchRes[0]
}

/** 获取缓存数据 */
async function getCache(uid, type) {
    let key = `FanSky:Teyvet:${uid}:${type}`
    if (await redis.exists(key)) {
        return JSON.parse(await redis.get(key))
    } else {
        return {}
    }
}

export default getAvatarData
