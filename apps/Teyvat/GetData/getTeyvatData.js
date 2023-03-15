import fetch from 'node-fetch'
/** 小助手请求头 */
const headers = {
  referer: 'https://servicewechat.com/wx2ac9dce11213c3a8/192/page-frame.html',
  'user-agent':
        'Mozilla/5.0 (Linux; Android 12; SM-G977N Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/4375 MMWEBSDK/20221011 Mobile Safari/537.36 MMWEBID/4357 MicroMessenger/8.0.30.2244(0x28001E44) WeChat/arm64 Weixin GPVersion/1 NetType/WIFI Language/zh_CN ABI/arm64 MiniProgramEnv/android'
}

/**
 * 获取小助手对应功能的数据
 * @param {String} TBody 请求需要的数据
 * @param {String} type 功能对应api 默认为 Single
 * @returns 小助手返回数据
 */
async function getTeyvatData (TBody, type = 'single') {
  console.log('进入了：getTeyvatData---type:' + type)
  const apiMap = {
    single: 'https://api.lelaer.com/ys/getDamageResult.php',
    team: 'https://api.lelaer.com/ys/getTeamResult.php'
  }
  try {
    console.log('getTWTData_apiMap:' + apiMap[type])
    const response = await fetch(apiMap[type], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers // 假设您已经定义了 `headers` 对象
      },
      body: JSON.stringify(TBody),
      timeout: 15000
    })
    const resJson = await response.json()
    return resJson
  } catch (error) {
    console.error('提瓦特小助手接口无法访问或返回错误', error)
    return {}
  }
}

export default getTeyvatData
