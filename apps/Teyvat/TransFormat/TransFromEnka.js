/* eslint-disable no-prototype-builtins */
import { ELEM, POS, PROP, SKILL } from '../../../models/Teyvat/index.js'
import { calcRelicMark, getRelicConfig, getRelicRank, kStr, vStr } from '../Index.js'
/**
 * 转换 Enka.Network 角色查询数据为内部格式
 * @param Json 配置文件
 * @param {Object} avatarInfo Enka.Network 角色查询数据，取自 data["avatarInfoList"] 列表
 * @param {Number} ts 数据时间戳
 * @returns 内部格式角色数据，用于本地缓存等
 */
async function transFromEnka (Json, avatarInfo, ts = 0) {
  console.log('进入了：transFromEnka')
  // let Json = await ReturnConfig()
  let HASH_TRANS = Json.HASH_TRANS
  let CHAR_DATA = Json.CHAR_DATA
  const charData = CHAR_DATA[String(avatarInfo.avatarId)]
  // console.log('----------------charData:-----------------')
  // console.log(charData)
  const res = {
    id: avatarInfo.avatarId,
    rarity: (charData.QualityType.includes('QUALITY_ORANGE')) ? 5 : 4,
    name: charData.NameCN,
    slogan: charData.Slogan,
    element: ELEM[charData.Element],
    cons: (avatarInfo.hasOwnProperty('talentIdList')) ? avatarInfo.talentIdList.length : 0,
    fetter: avatarInfo.fetterInfo.expLevel,
    level: parseInt(avatarInfo.propMap['4001'].val),
    icon: (avatarInfo.hasOwnProperty('costumeId')) ? charData.Costumes[avatarInfo.costumeId.toString()].icon : charData.iconName,
    gachaAvatarImg: (avatarInfo.hasOwnProperty('costumeId')) ? charData.Costumes[avatarInfo.costumeId.toString()].art : charData.iconName.replace('UI_AvatarIcon_', 'UI_Gacha_AvatarImg_'),
    baseProp: {
      生命值: avatarInfo.fightPropMap['1'],
      攻击力: avatarInfo.fightPropMap['4'],
      防御力: avatarInfo.fightPropMap['7']
    },
    fightProp: {
      生命值: avatarInfo.fightPropMap['2000'],
      攻击力: avatarInfo.fightPropMap['4'] * (1 + (avatarInfo.fightPropMap['6'] || 0)) + (avatarInfo.fightPropMap['5'] || 0),
      防御力: avatarInfo.fightPropMap['2002'],
      暴击率: avatarInfo.fightPropMap['20'] * 100,
      暴击伤害: avatarInfo.fightPropMap['22'] * 100,
      治疗加成: avatarInfo.fightPropMap['26'] * 100,
      元素精通: avatarInfo.fightPropMap['28'],
      元素充能效率: avatarInfo.fightPropMap['23'] * 100,
      物理伤害加成: avatarInfo.fightPropMap['30'] * 100,
      火元素伤害加成: avatarInfo.fightPropMap['40'] * 100,
      水元素伤害加成: avatarInfo.fightPropMap['42'] * 100,
      风元素伤害加成: avatarInfo.fightPropMap['44'] * 100,
      雷元素伤害加成: avatarInfo.fightPropMap['41'] * 100,
      草元素伤害加成: avatarInfo.fightPropMap['43'] * 100,
      冰元素伤害加成: avatarInfo.fightPropMap['46'] * 100,
      岩元素伤害加成: avatarInfo.fightPropMap['45'] * 100
    },
    skills: {},
    consts: [],
    weapon: {},
    relics: [],
    relicSet: {},
    relicCalc: {},
    damage: {},
    time: ts || parseInt(Date.now() / 1000)
  }
  // 技能数据
  const skills = { a: {}, e: {}, q: {} }
  const extraLevels = Object.fromEntries(
    Object.entries(avatarInfo.proudSkillExtraLevelMap || {}).map(([k, v]) => [k.slice(-1), v])
  )
  // console.log('---------extraLevels---------')
  // console.log(extraLevels)
  for (let idx = 0; idx < charData.SkillOrder.length; idx++) {
    const skillId = charData.SkillOrder[idx]
    // 实际技能等级、显示技能等级
    const level = avatarInfo.skillLevelMap[String(skillId)]
    const currentLvl = level + (extraLevels[Object.keys(SKILL)[idx]] || 0)
    skills[Object.values(SKILL)[idx]] = {
      style: currentLvl > level ? 'extra' : '',
      icon: charData.Skills[String(skillId)],
      level: currentLvl,
      originLvl: level
    }
  }
  res.skills = skills
  // 命座数据
  let consts = []
  for (let cIdx = 0; cIdx < charData.Consts.length; cIdx++) {
    let consImgName = charData.Consts[cIdx]
    consts.push({
      style: cIdx + 1 > res.cons ? 'off' : '',
      icon: consImgName
    })
  }
  res.consts = consts
  // 装备数据
  let [affixWeight, pointMark, maxMark] = await getRelicConfig(Json, charData.NameCN, res.baseProp)
  let [relicsMark, relicsCnt, relicSet] = [0.0, 0, {}]
  for (let equip of avatarInfo.equipList) {
    if (equip.flat.itemType === 'ITEM_WEAPON') {
      let weaponSub = equip.flat.weaponStats[equip.flat.weaponStats.length - 1].appendPropId
      let weaponSubValue = equip.flat.weaponStats[equip.flat.weaponStats.length - 1].statValue
      res.weapon = {
        id: equip.itemId,
        rarity: equip.flat.rankLevel,
        // "name": HASH_TRANS.get(equip["flat"]["nameTextMapHash"], "缺少翻译"),
        name: HASH_TRANS[equip.flat.nameTextMapHash] || '缺少翻译',
        // "affix": Object.values(equip["weapon"].get("affixMap", {"_": 0}))[0] + 1,
        affix: Object.values(equip.weapon.affixMap || { _: 0 })[0] + 1,
        level: equip.weapon.level,
        icon: equip.flat.icon,
        main: equip.flat.weaponStats[0].statValue,
        sub: weaponSub !== 'FIGHT_PROP_BASE_ATTACK'
          ? {
              prop: PROP[weaponSub].replace('百分比', ''),
              value: `${weaponSubValue}${weaponSub.endsWith('ELEMENT_MASTERY') ? '' : '%'}`
            }
          : {}
      }
    } else if (equip.flat.itemType === 'ITEM_RELIQUARY') {
      const mainProp = equip.flat.reliquaryMainstat
      const subProps = equip.flat.reliquarySubstats || []
      const posIdx = Object.keys(POS).indexOf(equip.flat.equipType) + 1
      const relicData = {
        pos: posIdx,
        rarity: equip.flat.rankLevel,
        name: HASH_TRANS[equip.flat.nameTextMapHash] || '缺少翻译',
        setName: HASH_TRANS[equip.flat.setNameTextMapHash] || '缺少翻译',
        level: equip.reliquary.level - 1,
        main: {
          prop: PROP[mainProp.mainPropId],
          value: mainProp.statValue
        },
        sub: subProps.map(s => {
          return {
            prop: PROP[s.appendPropId],
            value: s.statValue
          }
        }),
        calc: {},
        icon: equip.flat.icon,
        _appendPropIdList: equip.reliquary.appendPropIdList || []
      }
      relicData.calc = await calcRelicMark(Json, relicData, res.element, affixWeight, pointMark, maxMark)
      // 分数计算完毕后再将词条名称、数值转为适合 HTML 渲染的格式
      relicData.main.value = vStr(relicData.main.prop, relicData.main.value)
      relicData.main.prop = kStr(relicData.main.prop)
      relicData.sub = relicData.sub.map(s => {
        return { prop: kStr(s.prop), value: vStr(s.prop, s.value) }
      })
      // 额外数据处理
      relicData.calc.total = Math.round(relicData.calc.total * 10) / 10
      delete relicData._appendPropIdList
      relicSet[relicData.setName] = (relicSet[relicData.setName] || 0) + 1
      res.relics.push(relicData)
      // 累积圣遗物套装评分和计数器
      relicsMark += relicData.calc.total
      relicsCnt += 1
    }
  }
  // 圣遗物套装
  res.relicSet = relicSet
  res.relicCalc = {
    rank: relicsCnt ? getRelicRank(relicsMark / relicsCnt) : 'NaN',
    total: Math.round(relicsMark * 10) / 10
  }
  return res
}
export default transFromEnka
