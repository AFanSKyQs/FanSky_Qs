import { POS } from '../../../models/Teyvat/index.js'
import _ from 'lodash'
import { getServer, kStr } from '../Index.js'

/**
 * 角色数据转小助手请求格式
 * @param {Object} avatarsData 角色数据
 * @param {String} uid 查询uid
 * @returns 请求格式数据
 */
async function transToTeyvatRequest (avatarsData, uid) {
  console.log('进入了：transTeyvatData')
  let res = { uid, role_data: [] }
  if (uid[0] !== '1' && uid[0] !== '2') {
    res.server = getServer(uid, true)
  }
  for (let avatarData of avatarsData) {
    let name = avatarData.name
    let cons = avatarData.cons
    let weapon = avatarData.weapon
    let baseProp = avatarData.baseProp
    let fightProp = avatarData.fightProp
    let skills = avatarData.skills
    let relics = avatarData.relics
    let relicSet = avatarData.relicSet
    if (name === '雷电将军') {
      const _thunderDmg = fightProp['雷元素伤害加成']
      const _recharge = fightProp['元素充能效率']
      fightProp['雷元素伤害加成'] = Math.max(0, _thunderDmg - (_recharge - 100) * 0.4)
    }
    if (name === '莫娜') {
      const _waterDmg = fightProp['水元素伤害加成']
      const _recharge = fightProp['元素充能效率']
      fightProp['水元素伤害加成'] = Math.max(0, _waterDmg - _recharge * 0.2)
    }
    if (name === '妮露' && cons === 6) {
      const _count = parseFloat(fightProp['生命值'] / 1000)
      const _crit = fightProp['暴击率']
      const _critDmg = fightProp['暴击伤害']
      fightProp['暴击率'] = Math.max(5, _crit - Math.min(30, _count * 0.6))
      fightProp['暴击伤害'] = Math.max(50, _critDmg - Math.min(60, _count * 1.2))
    }
    if (['息灾', '波乱月白经津', '雾切之回光', '猎人之径'].includes(weapon.name)) {
      const weaponAffix = weapon.affix
      for (const elem of ['火', '水', '雷', '风', '冰', '岩', '草']) {
        const _origin = fightProp[`${elem}元素伤害加成`]
        fightProp[`${elem}元素伤害加成`] = Math.max(
          0,
          _origin - 12 - 12 * (weaponAffix - 1) / 4
        )
      }
    }
    let artifacts = []
    for (let a of relics) {
      let tData = {
        artifacts_name: a.name,
        artifacts_type: Object.values(POS)[a.pos - 1],
        level: a.level,
        maintips: kStr(a.main.prop, true),
        mainvalue: (typeof a.main.value === 'number') ? parseInt(a.main.value) : a.main.value
      }
      let tips = {}
      for (let sIdx = 0; sIdx < 4; sIdx++) {
        if (sIdx < a.sub.length) {
          tips['tips' + (sIdx + 1)] = kStr(a.sub[sIdx].prop, true) + '+' + a.sub[sIdx].value
        } else {
          tips['tips' + (sIdx + 1)] = ''
        }
      }
      tData = { ...tData, ...tips }
      artifacts.push(tData)
    }

    res.role_data.push({
      uid,
      role: name,
      role_class: cons,
      level: parseInt(avatarData.level),
      weapon: weapon.name,
      weapon_level: weapon.level,
      weapon_class: `精炼${weapon.affix}阶`,
      hp: parseInt(fightProp['生命值']),
      base_hp: parseInt(baseProp['生命值']),
      attack: parseInt(fightProp['攻击力']),
      base_attack: parseInt(baseProp['攻击力']),
      defend: parseInt(fightProp['防御力']),
      base_defend: parseInt(baseProp['防御力']),
      element: Math.round(fightProp['元素精通']),
      crit: `${_.round(fightProp['暴击率'], 1)}%`,
      crit_dmg: `${_.round(fightProp['暴击伤害'], 1)}%`,
      heal: `${_.round(fightProp['治疗加成'], 1)}%`,
      recharge: `${_.round(fightProp['元素充能效率'], 1)}%`,
      fire_dmg: `${_.round(fightProp['火元素伤害加成'], 1)}%`,
      water_dmg: `${_.round(fightProp['水元素伤害加成'], 1)}%`,
      thunder_dmg: `${_.round(fightProp['雷元素伤害加成'], 1)}%`,
      wind_dmg: `${_.round(fightProp['风元素伤害加成'], 1)}%`,
      ice_dmg: `${_.round(fightProp['冰元素伤害加成'], 1)}%`,
      rock_dmg: `${_.round(fightProp['岩元素伤害加成'], 1)}%`,
      grass_dmg: `${_.round(fightProp['草元素伤害加成'], 1)}%`,
      physical_dmg: `${_.round(fightProp['物理伤害加成'], 1)}%`,
      artifacts: _.map(_.pickBy(relicSet, (v, k) => v >= 2 || k.includes('之人')), (v1, k1) => `${k1}${v1 >= 4 ? 4 : v1 >= 2 ? 2 : 1}`).join('+'),
      ability1: skills.a.level,
      ability2: skills.e.level,
      ability3: skills.q.level,
      artifacts_detail: artifacts
    })
  }
  return res
}
export default transToTeyvatRequest
