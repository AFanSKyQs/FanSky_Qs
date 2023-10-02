/* eslint-disable camelcase */
import _ from 'lodash'
import gsCfg from '../../../../genshin/model/gsCfg.js'
import fs from 'node:fs'

const cwd = process.cwd().replace(/\\/g,'/');
let roleData = {}
/**
 * 转换队伍伤害计算请求数据为精简格式
 * @param {Object} raw 队伍伤害计算请求数据，由 getTeyvatData(*, "team")["result"] 获取
 * @param {Object} rolesData 角色数据，键为角色中文名，值为内部格式
 * @returns {Object} 精简格式伤害数据。出错时返回 {"error": "错误信息"}
 */
async function simpleTeamDamageRes (raw, rolesData) {
  let [tm, total] = raw.zdl_tips0.replace(/你的队伍|，DPS为:/g, '').split('秒内造成总伤害')
  let pieData = []; let pieColor = []
  _.each(raw.chart_data, v => {
    let name_split = v.name.split('\n')
    pieData.push({
      char: name_split[0],
      damage: parseFloat(name_split[1].replace('W', ''))
    })
    pieColor.push(v.label.color)
  })
  pieData = _.sortBy(pieData, 'damage').reverse()
  // 寻找伤害最高的角色元素属性，跳过绽放等伤害来源
  let elem = _.map(_.filter(pieData, i => rolesData[i.char]), v => rolesData[v.char].element)[0]

  let avatars = {}
  _.each(raw.role_list, role => {
    let panelData = rolesData[role.role]

    let relicSet = _.pickBy(panelData.relicSet, i => i >= 2);
    let relics = _.map(_.filter(panelData.relics, r => _.keys(relicSet).includes(r.setName)), v => _.nth(v.icon.split('_'), -2))
    relics = _.countBy(relics, v => v)
    let sets = {}
    _.each(relics, (r, k) => {
      sets[k] = r < 4 ? 2 : 4
    })

    let skills = []
    _.each(panelData.skills, skill => {
      skills.push({
        icon: getTalentPath(role.role, skill.icon),
        style: skill.style,
        level: skill.level
      })
    })

    let weaponPath = getWeapon(panelData.weapon.icon) || '';
    avatars[role.role] = {
      rarity: role.role_star,
      icon: panelData.icon,
      name: role.role,
      face: getFace(role.role),
      elem: panelData.element,
      cons: role.role_class,
      level: role.role_level.replace('Lv', ''),
      weapon: {
        icon: panelData.weapon.icon,
        level: panelData.weapon.level,
        rarity: panelData.weapon.rarity,
        affix: panelData.weapon.affix,
        imgPath: weaponPath
      },
      relicSet: relicSet,
      sets,
      cp: _.round(panelData.fightProp['暴击率'], 1),
      cd: _.round(panelData.fightProp['暴击伤害'], 1),
      key_prop: role.key_ability,
      key_value: role.key_value,
      skills
    }
  })

  _.each(raw.recharge_info, rechargeData => {
    let [name, tmp] = rechargeData.recharge.split('共获取同色球')
    let [same, diff] = tmp.split('个，异色球')
    if (diff.split('个，无色球').length === 2) {
      // 暂未排版无色球
      diff = diff.split('个，无色球')[0]
    }
    avatars[name].recharge = {
      pct: rechargeData.rate,
      same: _.round(parseFloat(same), 1),
      diff: _.round(parseFloat(diff.replace('个', '')), 1)
    }
  })

  let damages = []
  for (let step of raw.advice) {
    if (!step.content) {
      logger.error(`奇怪的伤害：${step}`)
      continue
    }
    let [t, s] = step.content.split(' ')
    let a = s.split('，')[0]; let d = []
    if (s.split('，').length === 1) {
      d = ['-', '-', '-']
    } else {
      let dmgs = s.split('，')[1]
      if (dmgs.split(',').length === 1) {
        d = ['-', '-', _.last(dmgs.split(',')[0].split('：'))]
      } else {
        d = []
        _.each(dmgs.split(','), dd => {
          d.push(_.last(dd.split(':')))
        })
      }
    }
    damages.push([t.replace('s', ''), _.toUpper(a), ...d])
  }

  let buffs = []
  for (let buff of raw.buff) {
    if (!buff.content) {
      logger.error(`奇怪的伤害：${step}`)
      continue
    }
    let [t, tmp] = buff.content.split(' ')
    let b = tmp.split('-')[0]; let bd = _.tail(tmp.split('-')).join('-')
    buffs.push([t.replace('s', ''), _.toUpper(b), _.toUpper(bd)])
  }
  
  return {
    uid: raw.uid,
    elem,
    rank: raw.zdl_tips2,
    dps: raw.zdl_result,
    tm,
    total,
    pie_data: JSON.stringify(pieData),
    pie_color: JSON.stringify(pieColor),
    pie_data2: pieData,
    pie_color2: pieColor,
    avatars,
    actions: raw.combo_intro.split(','),
    damages,
    buffs
  }
}

function getWeapon (icon) {
  const weaponCfg = gsCfg.getdefSet('weapon', 'data');
  let name = _.findKey(weaponCfg['Icon'], v => v === icon);
  if (!name) {
    return false;
  }

  return `${roleData.weapon}/${name}`;
}

function getFace (role) {
  let miaoPath = `${cwd}/plugins/miao-plugin/resources/meta/character/${role}/imgs/`;
  return fs.existsSync(`${miaoPath}face-q.webp`) ? miaoPath += 'face-q.webp' : miaoPath += 'face.webp';
}

function getTalentPath (role, icon) {
  // 每个角色只读一遍
  if (_.isEmpty(roleData) || roleData.name != role) {
    roleData = readJson(role)
  }

  let weapon = roleData.weapon
  let talentCons = roleData.talentCons

  let type = icon.split('_')[1]
  let talentpath = `meta/character/${role}/icons`

  switch (type) {
    case 'A':
      return `common/item/atk-${weapon}.webp`
    case 'S':
      if (fs.existsSync(`${talentpath}/talent-e.webp`)) return `${talentpath}/talent-e.webp`
      return `${talentpath}/${talentCons.e === 3 ? 'cons-3' : 'cons-5'}.webp`
    case 'E':
      if (fs.existsSync(`${talentpath}/talent-q.webp`)) return `${talentpath}/talent-q.webp`
      return `${talentpath}/${talentCons.q === 5 ? 'cons-5' : 'cons-3'}.webp`
  }
  return '未知'
}

function readJson (name) {
  let data = {}
  let file = `${cwd}/plugins/miao-plugin/resources/meta/character/${name}/data.json`
  if (fs.existsSync(file)) {
    // 获取本地数据 进行数据合并
    data = JSON.parse(fs.readFileSync(file, 'utf8'))
  }
  return data
}

export default simpleTeamDamageRes
