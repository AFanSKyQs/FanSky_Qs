import transFromEnka from './TransFormat/TransFromEnka.js'
import ReturnConfig from './LoadOther/LoadOther.js'
import getRelicConfig from './GetData/getRelicConfig.js'
import calcRelicMark from './Calca/calcRelicMark.js'
import getRelicRank from './GetData/getRelicRank.js'
import transToTeyvatRequest from './TransFormat/TransToTeyvatRequest.js'
import getServer from './GetData/getServer.js'
import simpleTeamDamageRes from './simpleDamage/simpleTeamDamageRes.js'
import simpleDamageRes from './simpleDamage/simpleDamageRes.js'
import getAvatarData from './GetData/getAvatarData.js'
import getTeyvatData from './GetData/getTeyvatData.js'

/** 转换词条数值为字符串形式 */
function vStr (prop, value) {
  if (['生命值', '攻击力', '防御力', '元素精通'].includes(prop)) {
    return String(value)
  } else {
    return String(Math.round(value * 10) / 10) + '%'
  }
}

/**
 * 转换词条名称为简短形式
 * @param {string} prop - 词条名称
 * @param {boolean} reverse - 是否反向转换，默认为false
 * @returns {string} - 转换后的词条名称
 */
function kStr (prop, reverse = false) {
  if (reverse) {
    return prop.replace('充能', '元素充能').replace('伤加成', '元素伤害加成').replace('物理元素', '物理')
  }
  return prop
    .replace('百分比', '')
    .replace('元素充能', '充能')
    .replace('元素伤害', '伤')
    .replace('物理伤害', '物伤')
}

export { transFromEnka, ReturnConfig, vStr, getRelicConfig, kStr, calcRelicMark, getRelicRank, transToTeyvatRequest, getServer, simpleTeamDamageRes, simpleDamageRes, getAvatarData, getTeyvatData }
