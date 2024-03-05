/** 可能的主词条
 * @type {{"3": string[], "4": string[], "5": string[]}}
 */
const MAIN_AFFIXS = {
  3: '攻击力百分比,防御力百分比,生命值百分比,元素精通,元素充能效率'.split(','), // EQUIP_SHOES
  4: '攻击力百分比,防御力百分比,生命值百分比,元素精通,元素伤害加成,物理伤害加成'.split(','), // EQUIP_RING
  5: '攻击力百分比,防御力百分比,生命值百分比,元素精通,治疗加成,暴击率,暴击伤害'.split(',') // EQUIP_DRESS
}
const GROW_VALUE = { // 用于计算词条数
  暴击率: 3.89,
  暴击伤害: 7.77,
  元素精通: 23.31,
  攻击力百分比: 5.83,
  生命值百分比: 5.83,
  防御力百分比: 7.29,
  元素充能效率: 6.48,
  元素伤害加成: 5.825,
  物理伤害加成: 7.288,
  治疗加成: 4.487
}
const SINGLE_VALUE = { // 用于计算词条数
  暴击率: 3.3,
  暴击伤害: 6.6,
  元素精通: 19.75,
  生命值百分比: 4.975,
  攻击力百分比: 4.975,
  防御力百分比: 6.2,
  元素充能效率: 5.5
}
const SUB_AFFIXS = '攻击力,攻击力百分比,防御力,防御力百分比,生命值,生命值百分比,元素精通,元素充能效率,暴击率,暴击伤害'.split(',')
const RANK_MAP = [
  ['D', 10],
  ['C', 16.5],
  ['B', 23.1],
  ['A', 29.7],
  ['S', 36.3],
  ['SS', 42.9],
  ['SSS', 49.5],
  ['ACE', 56.1],
  ['ACE²', 66]
]
const ELEM = {
  Fire: '火',
  Water: '水',
  Wind: '风',
  Electric: '雷',
  Grass: '草',
  Ice: '冰',
  Rock: '岩'
}
const POS = {
  EQUIP_BRACER: '生之花',
  EQUIP_NECKLACE: '死之羽',
  EQUIP_SHOES: '时之沙',
  EQUIP_RING: '空之杯',
  EQUIP_DRESS: '理之冠'
}
const SKILL = { 1: 'a', 2: 'e', 9: 'q' }
const DMG = {
  40: '火',
  41: '雷',
  42: '水',
  43: '草',
  44: '风',
  45: '岩',
  46: '冰'
}
const PROP = {
  FIGHT_PROP_BASE_ATTACK: '基础攻击力',
  FIGHT_PROP_HP: '生命值',
  FIGHT_PROP_ATTACK: '攻击力',
  FIGHT_PROP_DEFENSE: '防御力',
  FIGHT_PROP_HP_PERCENT: '生命值百分比',
  FIGHT_PROP_ATTACK_PERCENT: '攻击力百分比',
  FIGHT_PROP_DEFENSE_PERCENT: '防御力百分比',
  FIGHT_PROP_CRITICAL: '暴击率',
  FIGHT_PROP_CRITICAL_HURT: '暴击伤害',
  FIGHT_PROP_CHARGE_EFFICIENCY: '元素充能效率',
  FIGHT_PROP_HEAL_ADD: '治疗加成',
  FIGHT_PROP_ELEMENT_MASTERY: '元素精通',
  FIGHT_PROP_PHYSICAL_ADD_HURT: '物理伤害加成',
  FIGHT_PROP_FIRE_ADD_HURT: '火元素伤害加成',
  FIGHT_PROP_ELEC_ADD_HURT: '雷元素伤害加成',
  FIGHT_PROP_WATER_ADD_HURT: '水元素伤害加成',
  FIGHT_PROP_GRASS_ADD_HURT: '草元素伤害加成',
  FIGHT_PROP_WIND_ADD_HURT: '风元素伤害加成',
  FIGHT_PROP_ICE_ADD_HURT: '冰元素伤害加成',
  FIGHT_PROP_ROCK_ADD_HURT: '岩元素伤害加成'
}
// 导出所有变量
export { MAIN_AFFIXS, GROW_VALUE, SINGLE_VALUE, SUB_AFFIXS, RANK_MAP, ELEM, POS, SKILL, DMG, PROP }
