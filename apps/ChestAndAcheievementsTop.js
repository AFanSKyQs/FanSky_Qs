/* eslint-disable camelcase */
import plugin from '../../../lib/plugins/plugin.js'
import fetch from 'node-fetch'

export class ChestAndAcheievementsTop extends plugin {
  constructor () {
    super({
      name: '宝箱成就排行',
      dsc: '宝箱成就排行',
      event: 'message',
      priority: 1,
      rule: [
        {
          reg: '^#?(查|look|看)?成就(排行|排名|查询|统计)?(.*)$',
          fnc: 'AchievementTop'
        }, {
          reg: '^#?(查|look|看)?宝箱(排行|排名|查询|统计)?(.*)$',
          fnc: 'ChestTop'
        },
        {
          reg: '^#宝箱(.*)$',
          fnc: 'ChestTop'
        }
      ]
    })
  }

  async AchievementTop (e) {
    let uid = await this.uidGet(e)
    if (!uid) {
      e.reply('请先绑定uid 或 在指令后面加你要查询的uid')
      return true
    }
    uid = parseInt(uid)
    let url = `https://feixiaoqiu.com/search_achievement_ajax/?draw=1&columns[0][data]=total_index_div()&columns[0][name]=&columns[0][searchable]=true&columns[0][orderable]=false&columns[0][search][value]=&columns[0][search][regex]=false&columns[1][data]=nick_name_div()&columns[1][name]=&columns[1][searchable]=true&columns[1][orderable]=false&columns[1][search][value]=&columns[1][search][regex]=false&columns[2][data]=title_div()&columns[2][name]=&columns[2][searchable]=true&columns[2][orderable]=false&columns[2][search][value]=&columns[2][search][regex]=false&columns[3][data]=grade_div()&columns[3][name]=&columns[3][searchable]=true&columns[3][orderable]=false&columns[3][search][value]=&columns[3][search][regex]=false&columns[4][data]=achievement_number_div()&columns[4][name]=&columns[4][searchable]=true&columns[4][orderable]=false&columns[4][search][value]=&columns[4][search][regex]=false&start=0&length=20&search[value]=&search[regex]=false&uid=${uid}&_=1774705299791`
    let res = await fetch(url).catch((err) => logger.error(err))
    if (!res) {
      logger.error('[成就排行] 接口请求失败！')
      return e.reply('成就排行接口请求失败~')
    }
    let Json_Res = await res.json()
    let StringJson = JSON.stringify(Json_Res)
    StringJson = StringJson.replace(/\r/g, '')
    StringJson = StringJson.replace(/\n/g, '')
    StringJson = StringJson.replace(/\t/g, '')
    StringJson = StringJson.replace(/\s/g, '')
    StringJson = StringJson.replace(/\\\"/g, '"')
    StringJson = StringJson.replace(/\\n/g, '')
    StringJson = StringJson.substring(1, StringJson.length - 1)
    let JsonRes = JSON.parse(StringJson)
    console.log(JsonRes)
    if (JsonRes.data.length > 0) {
      JsonRes.data[0].title = unescape(JsonRes.data[0].title.replace(/\\u/g, '%u'))
      let Name = 'NotFound'
      let level = 'NotFound'
      let signature = '这是一条咸鱼吗~'
      await fetch(`https://enka.network/api/uid/${uid}?info`).then(res => res.json()).then(async res => {
        if (res.playerInfo.nickname) {
          Name = res.playerInfo.nickname
          level = res.playerInfo.level
          signature = res.playerInfo.signature
        }
      })
      let Msg = [`UID：${uid}\n`, `个性签名：${signature}\n`, `冒险等级：${level}\n`, `游戏昵称：${Name} \n`, `达成成就:【${JsonRes.data[0].achievement_number}】/892个\n`, `官哔排行：第${JsonRes.data[0].total_index}名\n`, `排名分数：${JsonRes.data[0].grade}`]
      e.reply(Msg)
      return true
    } else {
      e.reply(`uid:${uid}没有匹配的数据，可能是米游社权限未开放或者为国际服uid喵~`)
      return true
    }
  }

  async ChestTop (e) {
    let uid = await this.uidGet(e)
    if (!uid) {
      e.reply('请先绑定uid 或 在指令后面加你要查询的uid')
      return true
    }
    uid = parseInt(uid)
    let url = `https://feixiaoqiu.com/search_box_ajax/?draw=1&columns[0][data]=total_index_div()&columns[0][name]=&columns[0][searchable]=true&columns[0][orderable]=false&columns[0][search][value]=&columns[0][search][regex]=false&columns[1][data]=nick_name_div()&columns[1][name]=&columns[1][searchable]=true&columns[1][orderable]=false&columns[1][search][value]=&columns[1][search][regex]=false&columns[2][data]=title_div()&columns[2][name]=&columns[2][searchable]=true&columns[2][orderable]=false&columns[2][search][value]=&columns[2][search][regex]=false&columns[3][data]=grade_div()&columns[3][name]=&columns[3][searchable]=true&columns[3][orderable]=false&columns[3][search][value]=&columns[3][search][regex]=false&columns[4][data]=box_div()&columns[4][name]=&columns[4][searchable]=true&columns[4][orderable]=false&columns[4][search][value]=&columns[4][search][regex]=false&columns[5][data]=total_box_div()&columns[5][name]=&columns[5][searchable]=true&columns[5][orderable]=false&columns[5][search][value]=&columns[5][search][regex]=false&columns[6][data]=luxurious_div()&columns[6][name]=&columns[6][searchable]=true&columns[6][orderable]=false&columns[6][search][value]=&columns[6][search][regex]=false&columns[7][data]=precious_div()&columns[7][name]=&columns[7][searchable]=true&columns[7][orderable]=false&columns[7][search][value]=&columns[7][search][regex]=false&columns[8][data]=exquisite_div()&columns[8][name]=&columns[8][searchable]=true&columns[8][orderable]=false&columns[8][search][value]=&columns[8][search][regex]=false&columns[9][data]=common_div()&columns[9][name]=&columns[9][searchable]=true&columns[9][orderable]=false&columns[9][search][value]=&columns[9][search][regex]=false&start=0&length=20&search[value]=&search[regex]=false&uid=${uid}&_=1684712560846`
    let res = await fetch(url).catch((err) => logger.error(err))
    if (!res) {
      logger.error('[宝箱排行] 接口请求失败！')
      return e.reply('宝箱排行接口请求失败~')
    }
    let Json_Res = await res.json()
    let StringJson = JSON.stringify(Json_Res)
    StringJson = StringJson.replace(/\r/g, '')
    StringJson = StringJson.replace(/\n/g, '')
    StringJson = StringJson.replace(/\t/g, '')
    StringJson = StringJson.replace(/\s/g, '')
    StringJson = StringJson.replace(/\\\"/g, '"')
    StringJson = StringJson.replace(/\\n/g, '')
    StringJson = StringJson.substring(1, StringJson.length - 1)
    let JsonRes = JSON.parse(StringJson)
    console.log(JsonRes)
    if (JsonRes.data.length > 0) {
      JsonRes.data[0].title = unescape(JsonRes.data[0].title.replace(/\\u/g, '%u'))
      let Name = 'NotFound'
      let level = 'NotFound'
      let signature = '这是一条咸鱼吗~'
      await fetch(`https://enka.network/api/uid/${uid}?info`).then(res => res.json()).then(async res => {
        if (res.playerInfo.nickname) {
          Name = res.playerInfo.nickname
          level = res.playerInfo.level
          signature = res.playerInfo.signature
        }
      })

      let Msg = [`UID：${uid}\n`, `个性签名：${signature}\n`, `冒险等级：${level}\n`, `游戏昵称：${Name} \n`, `宝箱总计:【${JsonRes.data[0].total_box}】个\n`, `官哔排行：第${JsonRes.data[0].total_index}名\n`, `排名分数：${JsonRes.data[0].grade}\n`, `华丽/珍贵/精致/普通：\n${JsonRes.data[0].luxurious}/${JsonRes.data[0].precious}/${JsonRes.data[0].exquisite}/${JsonRes.data[0].common}`]
      e.reply(Msg)
      return true
    } else {
      e.reply(`uid:${uid}没有匹配的数据，可能是米游社权限未开放或者为国际服uid喵~`)
      return true
    }
  }

  async uidGet (e) {
    // 使用require引入其他文件的方法
    let msg = e.original_msg || e.msg
    if (!msg) {
      return false
    }
    let uidRet = /[0-9]{9}/.exec(msg)
    let UID
    if (uidRet) {
      UID = uidRet[0]
      console.log('输入的uid为：' + UID)
      // msg = msg.replace(uidRet[0], '')
    }
    let NoteUser = e.user
    let NoteUid = NoteUser._regUid
    return UID || NoteUid
  }
}
