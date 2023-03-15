import fetch from 'node-fetch'

/**
 * 请求 Enka API
 * @param uid 服务器UID
 * @returns {Promise<{error: *}|{error: string}|{avatarInfoList}|{playerInfo}|{}>}
 */
async function RequestEnka (uid) {
  const enkaMirrors = [
    'https://enka.network',
    'http://profile.microgg.cn'
  ]
  // B 服优先从 MicroGG API 尝试
  if (Number(uid[0]) === 5) {
    enkaMirrors.reverse()
  }
  let resJson = {}
  for (let idx = 0; idx < enkaMirrors.length; idx++) {
    const root = enkaMirrors[idx]
    const apiName = root.includes('microgg') ? 'MicroGG API' : 'Enka API'
    try {
      const res = await fetch(`${root}/api/uid/${uid}`, {
        headers: {
          Accept: 'application/json',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-US;q=0.7',
          'Cache-Control': 'no-cache',
          Cookie: 'locale=zh-CN',
          Referer: 'https://enka.network/',
          'User-Agent': 'GsPanel/0.2'
        },
        follow: 1,
        timeout: 20000
      })
      const errorMsg = {
        400: `玩家 ${uid} UID 格式错误！`,
        404: `玩家 ${uid} 不存在！`,
        424: `${apiName} 正在维护中！`,
        429: `${apiName} 访问过于频繁！`,
        500: `${apiName} 服务器普通故障！`,
        503: `${apiName} 服务器严重错误！`
      }
      const status = String(res.status)
      if (['400', '404'].includes(status)) {
        return { error: errorMsg[status] }
      } else if (status in errorMsg) {
        if (idx === enkaMirrors.length - 1) {
          return { error: errorMsg[status] }
        }
        console.error(errorMsg[status])
        continue
      }
      resJson = await res.json()
      break
    } catch (e) {
      if (idx === enkaMirrors.length - 1) {
        console.error(e)
        return {
          error: `[${e.name}] 暂时无法访问面板数据接口..`
        }
      }
      console.info(`从 ${apiName} 获取面板失败，正在自动切换镜像重试...`)
    }
  }
  if (!resJson.playerInfo) {
    return { error: `玩家 ${uid} 返回信息不全，接口可能正在维护..` }
  }
  if (!resJson.avatarInfoList) {
    return {
      error: `玩家 ${uid} 的角色展柜详细数据已隐藏！`
    }
  }
  if (!resJson.playerInfo.showAvatarInfoList) {
    return { error: `玩家 ${uid} 的角色展柜内还没有角色哦！` }
  }
  console.log(' Enka请求成功 ')
  return resJson
}
export default RequestEnka
