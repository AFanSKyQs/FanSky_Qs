import fetch from 'node-fetch'
import _ from 'lodash'
import { Format } from '#miao'
import { Character, Player } from '#miao.models'
import { getServer, simpleTeamDamageRes } from './Index.js'
import puppeteer from '../../../../lib/puppeteer/puppeteer.js'
import { ReturnTeamArr } from '../../config/ReturnSimpleArr/getTeamString.js'
// import { savaHistoryData } from './HistoryTeam.js'

const cwd = process.cwd().replace(/\\/g, '/')
const attrsKeys = {
  def: '防御力',
  defPlus: '防御力',
  hpPlus: '生命值',
  hp: '生命值',
  atkPlus: '攻击力',
  atk: '攻击力',
  recharge: '元素充能效率',
  mastery: '元素精通',
  cpct: '暴击率',
  cdmg: '暴击伤害',
  heal: '治疗加成',
  pyro: '火',
  hydro: '水',
  cryo: '冰',
  electro: '雷',
  anemo: '风',
  geo: '岩',
  phy: '物理',
  dendro: '草'
}

const dmgKeys = {
  fire_dmg: 'pyro',
  water_dmg: 'hydro',
  ice_dmg: 'cryo',
  thunder_dmg: 'electro',
  wind_dmg: 'anemo',
  rock_dmg: 'geo',
  physical_dmg: 'phy',
  grass_dmg: 'dendro'
}

export async function team (e, teamlist, uid, detail) {
  if (teamlist.length === 1) {
    const res = await ReturnTeamArr(teamlist[0])

    if (res && res[0]) teamlist = res
    else if (res.err) {
      await e.reply(res.err)
      return
    } else await e.reply(`暂未发现[${teamlist[0]}]简写\n尝试识别为单人~`, true)
  } else if (teamlist.length === 0) {
    await e.reply('请指定您要计算的队伍喵~', true)
    return true
  } else if (teamlist.length > 4) teamlist = _.take(teamlist, 4)

  let teamarId = []
  let errMsg = ''
  try {
    _.each(teamlist, v => {
      let name = v.split('(')[0].trim()
      let char = Character.get(name)
      if (!char) {
        errMsg = `队伍中存在未能识别的角色：${name}`
        throw new Error()
      }
      teamarId.push(char)
    })
  } catch (error) {
    await e.reply(errMsg)
    return
  }

  let rolesData = {}
  let weaponsData = {}
  let role_data = []
  let NoDataName = []
  let isData = []
  let player = Player.create(uid)
  try {
    _.each(teamarId, async v => {
      const char = v.name
      const profile = player.getProfile(v.id)

      if (['旅行者', '空', '荧', '萤'].includes(char)) {
        errMsg = '[旅行者]暂不支持计算伤害喵！~'
        throw new Error()
      }

      if (!profile || !profile.hasData) {
        NoDataName.push(char)
        return
      }

      isData.push(char)
      const m_roleData = await covProfileRoleData(profile)
      rolesData[char] = m_roleData
      weaponsData[char] = m_roleData.weapon
      role_data.push(await covProfileTeyvatData(profile, uid))
    })
  } catch (error) {
    await e.reply(errMsg)
    return
  }

  if (NoDataName.length) {
    await e.reply(`UID${uid}：缺少${NoDataName.join('|')}\n请先通过【#更新面板】拿到对应角色数据。`, true)
    return true
  }

  await e.reply(`UID${uid}：${isData.join('|')}`)
  logger.info(logger.cyan(`[FanSky_Qs]队伍伤害[请求UID:${uid}]>>>${isData.join('|')}`))

  const TiwateBody = {
    uid,
    role_data,
    server: getServer(uid, true)
  }

  // let CachePath = `${process.cwd()}/plugins/FanSky_Qs/resources/TevatRequestDataCache/MiaoData/${uid}.json`
  // if (!fs.existsSync(CachePath)) {
  //     fs.writeFileSync(CachePath, '{}')
  // }
  // await fs.writeFileSync(CachePath, JSON.stringify(TiwateBody))

  const TiwateRaw = await getTeyvatData(TiwateBody, 'team')
  if (TiwateRaw.code !== 200 || !TiwateRaw.result) {
    logger.error(`>>>[错误信息] ${TiwateRaw.info}`)
    await e.reply('提瓦特小助手接口无法访问或返回错误', true)
    return true
  } else {
    let data = await simpleTeamDamageRes(TiwateRaw.result, rolesData)
    _.each(weaponsData, v => {
      data.avatars[v].weapon.imgPath = v.weaponPath
    })

    let ScreenData = await screenData(e, data, detail)
    // try {
    //     await savaHistoryData(ScreenData)
    // } catch (err) {
    //     logger.info("这个队伍伤害保存失败了：" + err)
    // }
    let img = await puppeteer.screenshot('FanSkyTeyvat', ScreenData)
    await e.reply(img)
    return true
  }
}

async function screenData (e, data, detail) {
  // let BotInfo = await getVersionInfo()
  const RoleData = await JSON.parse(data.pie_data)
  const DamageMap = RoleData.map((item) => item.damage)
  const total = DamageMap.reduce((prev, cur) => prev + cur)
  const percent = DamageMap.map((item) => (item / total).toFixed(2))
  const RoleColor = await JSON.parse(data.pie_color)
  const NameChar = RoleData.map((item) => item.char)
  const Result = RoleData.reduce((acc, d, i) => {
    acc[d.char] = {
      name: d.char,
      damage: d.damage,
      color: RoleColor[i]
    }
    return acc
  }, {})
  // let AcgBg = await getHelpBg()
  return {
    version: 'test',
    YunzaiName: 'test',
    YunzaiVersion: 'test',
    result: Result,
    RoleData,
    quality: 100,
    AcgBg: '',
    Bing: { percent, RoleColor, NameChar },
    detail,
    data,
    cwd,
    saveId: e.user_id,
    miaoRes: `${cwd}/plugins/miao-plugin/resources/`,
    tplFile: `${cwd}/plugins/FanSky_Qs/resources/Teyvat/html.html`,
    /** 绝对路径 */
    pluResPath: `${cwd}/plugins//FanSky_Qs/resources/Teyvat/`
  }
}

/**
 * 转换小助手格式
 * @param {Object} profile 喵喵面板
 * @param {String|Number} uid uid
 * @returns 小助手格式数据
 */
async function covProfileTeyvatData (profile, uid) {
  let a = profile.attr
  let base = profile.base
  let attr = {}

  _.each(['hp', 'def', 'atk', 'mastery'], v => {
    let fn = (n) => Format.comma(n, v === 'hp' ? 0 : 1)
    attr[v] = fn(a[v])
    attr[`${v}Base`] = fn(base[v])
    attr[`${v}Plus`] = fn(a[v] - base[v])
  })

  _.each(['cpct', 'cdmg', 'recharge', 'dmg'], v => {
    let fn = Format.pct
    let key2 = v
    if (v === 'dmg' && a.phy > a.dmg) key2 = 'phy'

    attr[v] = fn(a[key2])
    attr[`${v}Base`] = fn(base[key2])
    attr[`${v}Plus`] = fn(a[key2] - base[key2])
  })

  let TeyvatData = {
    uid,
    role: profile.char.name,
    role_class: profile.cons,
    level: profile.level,
    weapon: profile.weapon.name,
    weapon_level: profile.weapon.level,
    weapon_class: `精炼${profile.weapon.affix}阶`,
    hp: Format.int(attr.hp?.replace(/,/g, '') ?? ''),
    base_hp: Format.int(attr.hpBase?.replace(/,/g, '') ?? ''),
    attack: Format.int(attr.atk?.replace(/,/g, '') ?? ''),
    base_attack: Format.int(attr.atkBase?.replace(/,/g, '') ?? ''),
    defend: Format.int(attr.def?.replace(/,/g, '') ?? ''),
    base_defend: Format.int(attr.defBase?.replace(/,/g, '') ?? ''),
    element: Format.int(attr.mastery?.replace(/,/g, '') ?? ''),
    crit: attr.cpct,
    crit_dmg: attr.cdmg,
    heal: Format.pct(a.heal),
    recharge: attr.recharge,
    physical_dmg: Format.pct(a.phy),
    ability1: profile.talent.a.level,
    ability2: profile.talent.e.level,
    ability3: profile.talent.q.level
  }

  _.each(dmgKeys, (v, k) => {
    let num = profile.elem === v ? a.dmg : 0
    TeyvatData[k] = Format.pct(num)
  })

  let artisDetail = profile.getArtisMark()
  let str_artifacts = ''
  _.each(artisDetail.sets, (v, k) => {
    let tmp = k + v
    if (str_artifacts) str_artifacts = tmp
    else str_artifacts = `${str_artifacts}+${tmp}`
  })
  TeyvatData.artifacts = str_artifacts

  let artifacts_detail = []
  let artiType = ['生之花', '死之羽', '时之沙', '空之杯', '理之冠']
  let m_artis_i = 0
  _.each(profile.artis.artis, (v, k) => {
    let detail = {
      artifacts_name: v.name,
      level: v.level,
      maintips: attrsKeys[v.main.key],
      mainvalue: artisDetail.artis[k]?.main?.value?.replace(/,/g, '') ?? '',
      artifacts_type: artiType[m_artis_i]
    }
    m_artis_i++

    let m_t_i = 0
    _.each(v.attrs, (av, ak) => {
      m_t_i++
      let a_v = artisDetail.artis[k].attrs[ak]?.value?.replace(/,/g, '') ?? ''
      detail[`tips${m_t_i}`] = `${attrsKeys[av.key]}+${a_v}`
    })
    artifacts_detail.push(detail)
  })
  TeyvatData.artifacts_detail = artifacts_detail
  return TeyvatData
}

/**
 * 转换面板数据
 * @param {Object} profile 面板数据
 * @returns 中转格式
 */
async function covProfileRoleData (profile) {
  let { char, weapon, attr } = profile
  return {
    id: char.id,
    name: char.elemName,
    fetter: char.fetter,
    cons: profile.cons,
    level: profile.level,
    weapon: {
      name: weapon.name,
      rarity: weapon.star,
      affix: weapon.affix,
      level: weapon.level,
      icon: weapon.img,
      weaponPath: `${weapon.type}/${weapon.name}`
    },
    fightProp: {
      暴击率: attr.cpct,
      暴击伤害: attr.cdmg,
      生命值: attr.hp,
      攻击力: attr.atk,
      防御力: attr.def,
      元素精通: attr.mastery,
      治疗加成: attr.heal,
      元素充能效率: attr.recharge
    },
    skills: skillDatail(char.name, profile.talent),
    relicSet: profile.getArtisMark().sets
  }
}

/**
 * 获取小助手对应功能的数据
 * @param {String} TBody 请求需要的数据
 * @param {String} type 功能对应api 默认为 Single
 * @returns 小助手返回数据
 */
async function getTeyvatData (TBody, type = 'single') {
  const apiMap = {
    single: 'https://api.lelaer.com/ys/getDamageResult.php',
    team: 'https://api.lelaer.com/ys/getTeamResult.php'
  }
  /** 小助手请求头 */
  const headers = {
    'Content-Type': 'application/json',
    referer: 'https://servicewechat.com/wx2ac9dce11213c3a8/192/page-frame.html',
    'user-agent': 'Mozilla/5.0 (Linux; Android 12; SM-G977N Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/4375 MMWEBSDK/20221011 Mobile Safari/537.36 MMWEBID/4357 MicroMessenger/8.0.30.2244(0x28001E44) WeChat/arm64 Weixin GPVersion/1 NetType/WIFI Language/zh_CN ABI/arm64 MiniProgramEnv/android'
  }

  try {
    let res = await fetch(apiMap[type], {
      method: 'POST',
      headers,
      body: JSON.stringify(TBody),
      timeout: 15000
    })
    res = await res.json()
    return res
  } catch (error) {
    logger.error(error)
    return { info: '提瓦特小助手接口无法访问或返回错误' }
  }
}

function skillDatail (name, talent) {
  let skills = { a: 'A', e: 'S', q: 'E' }
  _.each(skills, (v, k) => {
    skills[k] = {
      icon: `Skill_${v}_${name}`,
      level: talent[k].level,
      originLvl: talent[k].original,
      style: talent[k].level > talent[k].original ? 'extra' : ''
    }
  })
  return skills
}
