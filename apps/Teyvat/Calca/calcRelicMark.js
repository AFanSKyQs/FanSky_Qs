import { PROP } from '../../../models/Teyvat/index.js'
import { getRelicRank } from '../Index.js'

/**
 * 指定角色圣遗物评分计算
 * @param Json 配置文件
 * @param {Object} data 所需数据
 * @param {Object} data.relicData 圣遗物数据
 * @param {String} data.charElement 角色的中文元素属性
 * @param {Object} data.affixWeight 色的词条评分权重，由 getRelicConfig() 获取
 * @param {Object} data.pointMark 角色的词条数值原始权重，由 getRelicConfig() 获取
 * @param {Object} data.maxMark 角色的各位置圣遗物最高得分，由 getRelicConfig() 获取
 * @returns 圣遗物评分结果
 */
async function calcRelicMark (Json, data) {
  const { relicData, charElement, affixWeight, pointMark, maxMark } = data
  // 主词条得分、主词条收益系数（百分数）
  let calcMain, calcMainPct
  const posIdx = relicData.pos.toString()
  if (posIdx === '1' || posIdx === '2') {
    calcMain = 0.0
    calcMainPct = 100
  } else {
    const mainProp = relicData.main
    // 角色元素属性与伤害属性不同时权重为 0，不影响物理伤害得分
    const charElementRemoved = mainProp.prop.replace(charElement, '')
    const _mainPointMark = pointMark[charElementRemoved] || 0
    const _point = _mainPointMark * mainProp.value
    // 主词条与副词条的得分计算规则一致，但只取 25%
    calcMain = _point * 46.6 / 6 / 100 / 4
    // 主词条收益系数用于沙杯头位置主词条不正常时的圣遗物总分惩罚，最多扣除 50% 总分
    const _punishPct = _point / maxMark[posIdx].main / 2 / 4
    calcMainPct = 100 - 50 * (1 - _punishPct)
  }

  // 副词条得分
  const calcSubs = []
  for (let s of relicData.sub) {
    let _subPointMark = pointMark[s.prop] || 0
    let calcSub = (_subPointMark * s.value * 46.6 / 6 / 100) || 0
    // 副词条 CSS 样式
    let _awKey = ['生命值', '攻击力', '防御力'].includes(s.prop) ? `${s.prop}百分比` : s.prop
    let _subAffixWeight = affixWeight[_awKey] || 0
    let subStyleClass = (_subAffixWeight > 79 ? 'great' : _subAffixWeight ? 'use' : 'unuse') || 'unuse'
    // [词条名, 词条数值, 词条得分]
    calcSubs.push([subStyleClass, calcSub])
  }

  // 总分对齐系数（百分数），按满分 66 对齐各位置圣遗物的总分
  const calcTotalPct = 66 / (maxMark[posIdx].total * 46.6 / 6 / 100) * 100
  // 最终圣遗物总分
  const _total = calcMain + calcSubs.reduce((acc, curr) => acc + curr.goal, 0)
  const calcTotal = _total * calcMainPct * calcTotalPct / 10000
  // 强化歪次数
  let realAppendPropIdList = relicData._appendPropIdList.slice(-(Math.floor(relicData.level / 4)))
  const RELIC_APPEND = Json.RELIC_APPEND
  const nohit = realAppendPropIdList.filter(x => !pointMark[PROP[RELIC_APPEND[x.toString()] || RELIC_APPEND[x.toString()]]]).length
  return {
    rank: getRelicRank(calcTotal),
    total: calcTotal,
    nohit,
    main: Math.round(calcMain * 10) / 10,
    sub: calcSubs.map(subRes => ({ style: subRes[0], goal: Math.round(subRes[1] * 10) / 10 })),
    main_pct: Math.round(calcMainPct * 10) / 10,
    total_pct: Math.round(calcTotalPct * 10) / 10
  }
}
export default calcRelicMark
