import { getChestAndAchieve } from '../../../models/getTuImg.js'
import gsCfg from '../../../../genshin/model/gsCfg.js'
import fetch, { AbortError } from 'node-fetch'
import puppeteer from '../../../../../lib/puppeteer/puppeteer.js'
import path from 'path'
import fs from 'node:fs'
import _ from 'lodash'

export async function uidGet (e) {
  // 使用require引入其他文件的方法
  const msg = e.original_msg || e.msg
  if (!msg) return false

  const uidReg = /[1-9]\d{9}/.exec(msg)
  let UID
  if (uidReg) UID = uidReg[0]
  if (!UID) {
    const user = e.user
    UID = user._regUid || user.getUid('gs')
  }
  logger.info('宝箱成就排行请求UID：' + UID)
  return UID
}

export async function toImgSend (e, type, uid, signature, level, name, JsonRes) {
  let userdata = JsonRes.data[0]
  const typeName = { achieve: '成就', chest: '宝箱' }
  const TYPE = _.startCase(type)

  if (e.isGroup) {
    const file = `${process.cwd()}/data/FanSky_Qs/Top/${TYPE}Top.json`
    const dirPath = path.dirname(file)
    fs.mkdirSync(dirPath, { recursive: true })
    if (!fs.existsSync(file)) fs.writeFileSync(file, '{}')

    const Json = JSON.parse(fs.readFileSync(file, 'utf8'))
    if (!Json[e.group_id]) Json[e.group_id] = {}

    userdata.uid = uid
    userdata.nickname = signature
    Json[e.group_id][e.user_id] = userdata
    fs.writeFileSync(file, JSON.stringify(Json))
    await e.reply(`你可以通过【#${typeName[type]}排行榜】查看群内数据了(已更新的)`, true, { recallMsg: 15 })
  }

  let renderData = {
    uid,
    name,
    nickname: signature,
    top: userdata.total_index,
    title: userdata.title,
    score: userdata.grade,
    user_img: `https://q1.qlogo.cn/g?b=qq&nk=${e.user_id}&s=160`,
    AcgBg: await getChestAndAchieve()
  }
  let lable = gsCfg.getdefSet('role', 'index')

  if (type === 'chest') {
    renderData.allchest = userdata.total_box
    renderData.Achest = userdata.luxurious
    renderData.Bchest = userdata.precious
    renderData.Cchest = userdata.exquisite
    renderData.Dchest = userdata.common
    renderData.labelAll = _(lable).filter((v, k) => k.includes('_chest') && !['all_chest', 'magic_chest'].includes(k)).sum()
  } else if (type === 'achieve') {
    renderData.achievement = lable.achievement
    renderData.allAc = userdata.achievement_number
  }

  const CssPath = `${process.cwd()}/plugins/FanSky_Qs/resources/ChestAchieveTop/`
  let toImg = {
    tplFile: `${CssPath}/${type}.html`,
    quality: 100,
    CssPath
  }
  toImg[`${TYPE}Html`] = renderData
  toImg = await puppeteer.screenshot(`${TYPE}Top`, toImg)
  const key = `FanSky:SmallFunctions:${TYPE}Top:${e.user_id}`
  await redis.set(key, 1)
  await redis.expire(key, 80)

  await e.reply(toImg)
  await new Promise(resolve => setTimeout(resolve, 5000))
  return true
}

export async function axiosRequest (uid) {
  let [Name, level, signature] = ['出厂设置', 'NaN..?', 'w太懒了！没有签名喵~']
  const controller = new AbortController()
  const timeout = setTimeout(() => {
    controller.abort()
  }, 10000)

  try {
    let res = await fetch(`http://enka.network/api/uid/${uid}?info`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    })

    if (!res.ok) return
    res = await res.json()

    const player = res.playerInfo
    if (!player) return

    Name = player.nickname
    level = player.level
    if (player.signature) signature = player.signature
  } catch (err) {
    if (err instanceof AbortError) {
      logger.error('请求超时惹')
      Name = '超时惹·'
      level = '超时惹~'
      signature = '超时惹~'
    } else if (err.toString().includes('status code 424')) {
      const ServerError = '该服接口正在维护'
      logger.error(ServerError)
      Name = ServerError
      level = ServerError
      signature = ServerError
      return
    } else {
      logger.error('请求出错惹')
      logger.error(err)
      Name = 'Error惹·'
      level = 'Error惹~'
      signature = 'Error惹~'
    }
  } finally {
    clearTimeout(timeout)
  }
  return { Name, level, signature }
}
