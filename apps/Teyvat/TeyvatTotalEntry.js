import { getAvatarData, getTeyvatData, ReturnConfig, simpleTeamDamageRes, transToTeyvatRequest } from './Index.js'

// await getSingle('117556563', '魈') //  单人伤害：uid, 角色名
// await getTeam('117556563'); //队伍伤害：uid，角色列表

/** 队伍伤害消息生成入口
 @param {string} uid 查询用户 UID
 @param {Array<string>} chars 查询角色，为空默认数据中前四个
 @param {boolean} showDetail 查询结果是否展示伤害过程。默认不展示
 @param e 事件
 @return {string|ArrayBuffer} 查询结果。一般返回图片字节，出错时返回错误信息字符串
 **/
async function getTeam (uid, chars = [], showDetail = false,e) {
  let Json = await ReturnConfig()
  // 获取面板数据
  const data = await getAvatarData(Json, uid, '全部',e)
  if (data.error) return data.error

  let extract
  if (chars.length) {
    extract = data.avatars.filter(a => chars.includes(a.name))
    if (extract.length !== chars.length) {
      const gotThis = extract.map(a => a.name)
      const notFound = chars.filter(c => !gotThis.includes(c)).join('、')
      return `玩家 ${uid} 的最新数据中未发现${notFound}！`
    }
  } else if (data.avatars.length >= 4) {
    extract = data.avatars.slice(0, 4)
    console.log(`UID${uid} 未指定队伍，自动选择面板中前 4 位进行计算：${extract.map(a => a.name).join('、')} ...`)
  } else {
    return `玩家 ${uid} 的面板数据甚至不足以组成一支队伍呢！`
  }
  const extractCopy = extract
  const TiwateBody = await transToTeyvatRequest(extractCopy, uid)
  const TiwateRaw = await getTeyvatData(TiwateBody, 'team')
  if (TiwateRaw.code !== 200 || !TiwateRaw.result) {
    console.log(`UID${uid} 的 ${extract.length} 位角色队伍伤害计算请求失败！\n>>>> [提瓦特返回] ${JSON.stringify(TiwateRaw)}`)
    await e.reply(`UID ${uid} 的 ${extract.length} 位角色伤害计算请求失败！`)
    return TiwateRaw ? `玩家 ${uid} 队伍伤害计算失败，接口可能发生变动！` : '啊哦，队伍伤害计算小程序状态异常！'
  }
  try {
    let data = await simpleTeamDamageRes(TiwateRaw.result, extract.reduce((acc, a) => ({
      ...acc,
      [a.name]: a
    }), {}))
    return data;
  } catch (e) {
    console.log(`[${e.constructor.name}] 队伍伤害数据解析出错`)
    return `[${e.constructor.name}] 队伍伤害数据解析出错咯`
  }

  // todo: @return html数据
  // const htmlBase = LOCAL_DIR.resolve().toString();
}

/**
 * 原神游戏内角色展柜消息生成入口(无需前台展示)
 * @param {String} uid 查询用户 UID
 * @param {String} char 全部 || 查询角色
 * @param e 事件
 * @returns 查询结果
 */
async function getSingle (uid, char = '全部',e) {
  let Json = await ReturnConfig()
  // 获取面板数据
  let data = await getAvatarData(Json, uid, char,e)
  if (data.error) return data.error
  return char === '全部' ? 'list' : 'panel'
}

export { getTeam, getSingle }
