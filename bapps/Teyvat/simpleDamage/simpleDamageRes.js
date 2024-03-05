import _ from 'lodash'

/**
 * 转换角色伤害计算请求数据为精简格式
 * @param {Object} damage 角色伤害计算请求数据，由 getTeyvatData()["result"][int] 获取
 * @returns 精简格式伤害数据，出错时返回 {}
 */
async function simpleDamageRes (damage) {
  const res = { level: damage.zdl_result || 'NaN', data: [], buff: [] }
  for (const key of ['damage_result_arr', 'damage_result_arr2']) {
    // console.log(`------------damage[${key}]------------`)
    _.each(damage[key], dmgDetail => {
      let dmgTitle = key === 'damage_result_arr2' ? `[${damage.zdl_result2}]<br>` : dmgDetail.title
      let dmgCrit = ''; let dmgExp = ''
      if (_.includes(dmgDetail.value, '期望') || !dmgDetail.expect) {
        dmgCrit = '-'
        dmgExp = _.replace(dmgDetail.value, '期望', '')
      } else {
        dmgCrit = dmgDetail.value
        dmgExp = _.replace(dmgDetail.expect, '期望', '')
      }
      res.data.push([dmgTitle, dmgCrit, dmgExp])
    })
  }
  _.each(damage.bonus, buff => {
    let intro = _.isString(buff) ? damage.bonus[buff].intro : buff.intro
    let [buffTitle, buffDetail] = intro.split('：')
    if (!['注', '备注'].includes(buffTitle)) {
      res.buff.push([buffTitle, buffDetail])
    }
  })
  // zdl_tips0:'经鉴定，你的 钟离 角色伤害评级为:'
  // 取出 zdl_tips0 中的角色名
  let charName = damage.zdl_tips0.match(/你的(.+?)角色/)[1]
  // console.log(`-----------数据检查simplDamageRes| ${charName} |-------------`)
  // console.log(res)
  return res
}
export default simpleDamageRes
