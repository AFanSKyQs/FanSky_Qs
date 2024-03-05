import { RANK_MAP } from '../../../models/Teyvat/index.js'

/**
 * 圣遗物评级获取
 * 在角色等级较低（基础数值较低）时评级可能显示为 "ERR"
 * 注：角色等级较低时不为 "ERR" 的评分也有可能出错
 */
function getRelicRank (score) {
  const rank = RANK_MAP.find(r => score <= r[1])
  return rank ? rank[0] : score <= 66 ? 'ERR' : null
}

export default getRelicRank
