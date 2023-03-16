import { GROW_VALUE, MAIN_AFFIXS, SUB_AFFIXS } from '../../../models/Teyvat/index.js'
import { ReturnConfig } from '../Index.js'

/**
 *  指定角色圣遗物计算配置获取，包括词条评分权重、词条数值原始权重、各位置圣遗物总分理论最高分和主词条理论最高得分
 * @param Json 配置文件
 * @param {String} char 角色名
 * @param {Object} base 角色的基础数值，可由 Enka 返回获得，格式为 {"生命值": 1, "攻击力": 1, "防御力": 1}
 * @returns 词条评分权重、词条数值原始权重、各位置圣遗物最高得分
 */
async function getRelicConfig (Json, char, base = {}) {
  let CALC_RULES = Json.CALC_RULES
  const affixWeight = CALC_RULES[char] ?? { 攻击力百分比: 75, 暴击率: 100, 暴击伤害: 100 }
  const sortedAffixWeight = Object.fromEntries(
    Object.entries(affixWeight).sort((a, b) => {
      return (
        b[1] - a[1] ||
                (a[0].includes('暴击') ? -1 : 1) ||
                (a[0].includes('加成') ? -1 : 1) ||
                (a[0].includes('元素') ? -1 : 1)
      )
    })
  )
  const pointMark = {}
  for (const [k, v] of Object.entries(sortedAffixWeight)) {
    pointMark[k] = v / GROW_VALUE[k]
  }
  if (pointMark['攻击力百分比']) {
    pointMark['攻击力'] =
            (pointMark['攻击力百分比'] / (base['攻击力'] ?? 1020)) * 100
  }
  if (pointMark['防御力百分比']) {
    pointMark['防御力'] =
            (pointMark['防御力百分比'] / (base['防御力'] ?? 300)) * 100
  }
  if (pointMark['生命值百分比']) {
    pointMark['生命值'] =
            (pointMark['生命值百分比'] / (base['生命值'] ?? 400)) * 100
  }
  const maxMark = {
    1: { main: 0, total: 0 },
    2: { main: 0, total: 0 },
    3: { main: 0, total: 0 },
    4: { main: 0, total: 0 },
    5: { main: 0, total: 0 }
  }
  for (let posIdx = 1; posIdx < 6; posIdx++) {
    // 主词条最高得分
    let mainAffix
    if (posIdx <= 2) {
      // 花和羽不计算主词条得分
      mainAffix = (posIdx === 1) ? '生命值' : '攻击力'
      maxMark[posIdx.toString()].main = 0
      maxMark[posIdx.toString()].total = 0
    } else {
      // 沙杯头计算该位置评分权重最高的词条得分
      const avalMainAffix = Object.fromEntries(Object.entries(affixWeight).filter(([k, v]) => MAIN_AFFIXS[posIdx.toString()].includes(k)))
      mainAffix = Object.keys(avalMainAffix)[0]
      maxMark[posIdx.toString()].main = affixWeight[mainAffix]
      maxMark[posIdx.toString()].total = affixWeight[mainAffix] * 2
    }
    // 副词条最高得分
    let maxSubAffixs = {}
    for (let k in affixWeight) {
      if (SUB_AFFIXS.includes(k) && k !== mainAffix && affixWeight[k]) {
        maxSubAffixs[k] = affixWeight[k]
      }
    }
    let subAffixList = Object.keys(maxSubAffixs).slice(0, 4)
    let totalScore = subAffixList.reduce((acc, k, kIdx) => {
      return acc + affixWeight[k] * (kIdx === 0 ? 1 : 6)
    }, 0)
    maxMark[posIdx.toString()].total += totalScore
    // 副词条最高得分
    // const maxSubAffixs = Object.fromEntries(Object.entries(affixWeight).filter(([k, v]) => SUB_AFFIXS.includes(k) && k !== mainAffix && affixWeight[k]));
    // maxMark[posIdx.toString()]["total"] += [...maxSubAffixs.entries()].slice(0, 4).reduce((sum, [k, v], kIdx) => sum + affixWeight[k] * (kIdx ? 6 : 1), 0);
  }
  return [affixWeight, pointMark, maxMark]
}

export default getRelicConfig
