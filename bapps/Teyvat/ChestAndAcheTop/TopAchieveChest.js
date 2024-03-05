import fetch from 'node-fetch'
import { axiosRequest, toImgSend, uidGet } from './export.js'
import { getLocalUserData } from '../../../models/getLocalUserData.js'
import _ from 'lodash'

const TYPE = {
  achieve: {
    url: ['https://feixiaoqiu.com/search_achievement_ajax/?draw=1&columns[0][data]=total_index_div()&columns[0][name]=&columns[0][searchable]=true&columns[0][orderable]=false&columns[0][search][value]=&columns[0][search][regex]=false&columns[1][data]=nick_name_div()&columns[1][name]=&columns[1][searchable]=true&columns[1][orderable]=false&columns[1][search][value]=&columns[1][search][regex]=false&columns[2][data]=title_div()&columns[2][name]=&columns[2][searchable]=true&columns[2][orderable]=false&columns[2][search][value]=&columns[2][search][regex]=false&columns[3][data]=grade_div()&columns[3][name]=&columns[3][searchable]=true&columns[3][orderable]=false&columns[3][search][value]=&columns[3][search][regex]=false&columns[4][data]=achievement_number_div()&columns[4][name]=&columns[4][searchable]=true&columns[4][orderable]=false&columns[4][search][value]=&columns[4][search][regex]=false&start=0&length=20&search[value]=&search[regex]=false&', '&_=1774705299791'],
    logName: '成就'
  },
  chest: {
    url: ['https://feixiaoqiu.com/search_box_ajax/?draw=1&columns[0][data]=total_index_div()&columns[0][name]=&columns[0][searchable]=true&columns[0][orderable]=false&columns[0][search][value]=&columns[0][search][regex]=false&columns[1][data]=nick_name_div()&columns[1][name]=&columns[1][searchable]=true&columns[1][orderable]=false&columns[1][search][value]=&columns[1][search][regex]=false&columns[2][data]=title_div()&columns[2][name]=&columns[2][searchable]=true&columns[2][orderable]=false&columns[2][search][value]=&columns[2][search][regex]=false&columns[3][data]=grade_div()&columns[3][name]=&columns[3][searchable]=true&columns[3][orderable]=false&columns[3][search][value]=&columns[3][search][regex]=false&columns[4][data]=box_div()&columns[4][name]=&columns[4][searchable]=true&columns[4][orderable]=false&columns[4][search][value]=&columns[4][search][regex]=false&columns[5][data]=total_box_div()&columns[5][name]=&columns[5][searchable]=true&columns[5][orderable]=false&columns[5][search][value]=&columns[5][search][regex]=false&columns[6][data]=luxurious_div()&columns[6][name]=&columns[6][searchable]=true&columns[6][orderable]=false&columns[6][search][value]=&columns[6][search][regex]=false&columns[7][data]=precious_div()&columns[7][name]=&columns[7][searchable]=true&columns[7][orderable]=false&columns[7][search][value]=&columns[7][search][regex]=false&columns[8][data]=exquisite_div()&columns[8][name]=&columns[8][searchable]=true&columns[8][orderable]=false&columns[8][search][value]=&columns[8][search][regex]=false&columns[9][data]=common_div()&columns[9][name]=&columns[9][searchable]=true&columns[9][orderable]=false&columns[9][search][value]=&columns[9][search][regex]=false&start=0&length=20&search[value]=&search[regex]=false&', '&_=1684712560846'],
    logName: '宝箱'
  }
}

export async function TopAchieveChest (e, type) {
  let diff = TYPE[type]
  let key = `FanSky:SmallFunctions:${_.startCase(type)}Top:${e.user_id}`
  if (await redis.get(key)) {
    await e.reply(`请等待${await redis.ttl(key)}s后再请求~`, true)
    return false
  }

  let uid = await uidGet(e)
  if (!uid) {
    e.reply('请先绑定uid 或 在指令后面加你要查询的uid')
    return true
  }
  uid = Number(uid)
  let Json_Res
  try {
    const response = await fetch(diff.url.join(`uid=${uid}`))
    Json_Res = response.data
  } catch (error) {
    logger.error(`[${diff.logName}排行] 接口请求失败！`)
    await e.reply(`${diff.logName}排行接口请求失败~\n尝试读取${uid}本地[ #角色 ]数据`)
    await ReadLocalData(e, uid)
    return true
  }

  let StringJson = JSON.stringify(Json_Res)
  StringJson = StringJson.replace(/\r|\n|\t\s|\\n/g, '').replace(/\\\"/g, '"')
  StringJson = StringJson.substring(1, StringJson.length - 1)

  let JsonRes = JSON.parse(StringJson)
  if (JsonRes.data.length) {
    let data = JsonRes.data[0]
    data.title = unescape(data.title.replace(/\\u/g, '%u'))
    let { Name, level, signature } = await axiosRequest(uid)
    if (type === 'achieve') {
      let LocalChestData = await getLocalUserData(e, uid)
      if (LocalChestData) {
        if (data.achievement_number < LocalChestData.info.stats.achievement) {
          data.total_index = data.total_index + `(${data.achievement_number})`
          data.achievement_number = LocalChestData.info.stats.achievement
        }
      }
    }

    JsonRes.data[0] = data
    await toImgSend(e, type, uid, signature, level, Name, JsonRes)
    return true
  } else {
    await e.reply(`uid:${uid}没有匹配的数据，可能是米游社权限未开放或者为国际服uid喵~\n尝试读取${uid}本地[ #角色 ]数据`)
    await ReadLocalData(e, uid, type)
    return true
  }
}

async function ReadLocalData (e, uid, type) {
  let LocalChestData = await getLocalUserData(e, uid)
  if (!LocalChestData) {
    await e.reply(`没有找到${uid}的本地数据~`)
    return true
  }

  let { name, level, sign, info } = LocalChestData
  if (info && Object.keys(info).length) {
    try {
      let data = {
        title: '本地数据',
        total_index: '本地数据',
        uid
      }
      if (type === 'achieve') {
        data.achievement_number = info.stats.achievement
        data.nick_name = info.stats.name
        data.hide_name = 0
        data.grade = '本地数据'
        data.nickname = info.stats.sign
      } else if (type === 'chest') {
        const chests = {
          luxurious: info.stats.luxuriousChest,
          precious: info.stats.preciousChest,
          exquisite: info.stats.exquisiteChest,
          common: info.stats.commonChest
        }
        const chestsNum = Object.values(chests)
        data = {
          ...data,
          ...chests,
          box: '本地数据',
          total_box: _.sum(chestsNum),
          grade: calculateY3(chestsNum),
          nickname: sign
        }
      }

      let JsonRes = { data: [data] }
      await toImgSend(e, type, uid, sign, level, name, JsonRes)
      return true
    } catch (err) {
      await e.reply('您的本地数据类型异常,请查看控制台数据联系开发人员', true)
      if (e.guild_id) logger.info(info)
      else Bot.logger.info(info)
      return true
    }
  } else {
    if (e.guild_id) logger.info(info)
    else Bot.logger.info(info)
    await e.reply('您的本地[ #角色 ]数据也为空', true)
    return true
  }
}

function calculateY3 (chests) {
  const weight = [0.9028, 0.0683, 0.0208, 0.0081]
  const all = [185, 486, 1596, 2547]
  const x = _.sum(chests.map((v, k) => v / all[k] * weight[k]))
  const mixData = [138691.296704388, -1339947.56772589, 5389544.47894393, -11353458.0517414, 12115264.4925049, -2266146.54178447, -10540289.0388717, 13994887.1972744, -8293415.19130523, 2433926.22137088, -278957.333386943]
  const Y = mixData.map((v, k) => {
    let calc = v
    if (k === 1) calc = v * x
    else if (k > 1) calc = v * Math.pow(x, k)
    return calc
  })

  return _.sum(Y).toFixed(3)
}
