import fetch from 'node-fetch'
import { HttpsProxyAgent } from 'https-proxy-agent'

export async function OpenAIQuota (e, apiKey) {
  logger.info(logger.magenta(`查询OpenAI_KEY:${apiKey.OpenAI_Key}`))

  const data = await checkOpenAICredit(apiKey.OpenAI_Key.trim())
  let tips = '未知原因，请联系开发者检查这个错误问题'
  if (data.status === 'success') {
    tips = `
      总额度: ${data.total_granted}
      已使用额度: ${parseFloat(data.total_used).toFixed(3)}
      剩余可用额度: ${parseFloat(data.total_available).toFixed(3)}`
    logger.info(logger.magenta(tips))
    e.reply(tips, true)
  } else if (['WuXiao', 'FengJing', 'GuoQi', 'NoVPN'].includes(data.status)) {
    logger.info(logger.magenta(data.Message))
    await SendMsg(e, data.Message)
  } else {
    logger.info(logger.magenta(tips))
    console.log(data)
    e.reply(`${tips}，错误信息看控制台喵！`, true)
  }
  return true
}

async function SendMsg (e, msg) {
  await e.reply(msg, true)
}

async function checkOpenAICredit (apiKey) {
  if (!apiKey.startsWith('sk-')) {
    return {
      status: 'WuXiao',
      Message: '错误的API密钥格式，请检查您的API密钥。'
    }
  }

  try {
    const data = await checkBilling(apiKey)
    if (data.status === 'success') {
      return {
        status: 'success',
        total_granted: data.Edu[0],
        total_used: data.Edu[1],
        total_available: data.Edu[2]
      }
    } else return data
  } catch (error) {
    return { status: 'error' }
  }
}

async function checkBilling (apiKey) {
  let Proxy = JSON.parse(await redis.get('FanSky:OpenAI:Proxy:Default'))
  const proxyString = Proxy.Proxy
  let DefaultProxy = false
  if (proxyString === '127.0.0.1:7890') DefaultProxy = true

  const proxyUrl = `http://${proxyString}`

  // 计算起始日期和结束日期
  const now = new Date()
  let startDate = new Date(now - 90 * 24 * 60 * 60 * 1000)
  const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  // 设置API请求URL和请求头
  let urlUsage = `https://api.openai.com/v1/dashboard/billing/usage?start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}` // 查使用量
  let urlSubscription = 'https://api.openai.com/v1/dashboard/billing/subscription' // 查是否订阅
  let urlBalance = 'https://api.openai.com/dashboard/billing/credit_grants' // 查普通账单

  // 镜像站
  if (DefaultProxy) {
    urlUsage = `https://api.openai-proxy.com/v1/dashboard/billing/usage?start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}` // 查使用量
    urlSubscription = 'https://api.openai-proxy.com/v1/dashboard/billing/subscription' // 查是否订阅
    urlBalance = 'https://api.openai-proxy.com/dashboard/billing/credit_grants' // 查普通账单
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }
  try {
    // 获取API限额
    let param = { headers }
    if (!DefaultProxy) param.agent = new HttpsProxyAgent(proxyUrl)

    let response = await fetch(urlSubscription, param)
    if (!response.data) {
      return {
        status: 'FengJing',
        Message: '您的账户已被封禁，请登录OpenAI进行查看。'
      }
    }
    const subscriptionData = response.data

    // 判断是否过期
    const timestamp_now = Math.floor(Date.now() / 1000)
    const timestamp_expire = subscriptionData.access_until
    if (timestamp_now > timestamp_expire) {
      return {
        status: 'GuoQi',
        Message: '您的账户额度已过期, 请登录OpenAI进行查看。'
      }
    }
    const totalAmount = subscriptionData.hard_limit_usd
    const is_subsrcibed = subscriptionData.has_payment_method

    // 获取已使用量
    let Response = await fetch(urlUsage, param)
    let usageData = Response.data
    let totalUsage = usageData.total_usage / 100
    // 如果用户绑卡，额度每月会刷新
    if (is_subsrcibed) {
      // 获取当前月的第一天日期
      const day = now.getDate() // 本月过去的天数
      startDate = new Date(now - (day - 1) * 24 * 60 * 60 * 1000) // 本月第一天
      let urlUsage
      if (DefaultProxy) {
        urlUsage = `https://api.openai-proxy.com/v1/dashboard/billing/usage?start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}` // 查使用量
      } else {
        urlUsage = `https://api.openai.com/v1/dashboard/billing/usage?start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}` // 查使用量
      }
      let response3 = await fetch(urlUsage, param)
      usageData = response3.data
      totalUsage = usageData.total_usage / 100
    }
    // 计算剩余额度
    const remaining = totalAmount - totalUsage
    // 返回总用量、总额及余额信息
    return { status: 'success', Edu: [totalAmount, totalUsage, remaining] }
  } catch (error) {
    return {
      status: 'NoVPN',
      Console: '【无法访问OpenAI】或【完全不存在的API密钥】',
      Message: '【无法访问OpenAI】或【完全不存在的API密钥】，请挂着代理(如clash)查询或检查密钥喵~。\n代理配置与OpenAI对话的代理同步~'
    }
  }
}

function formatDate (date) {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}
