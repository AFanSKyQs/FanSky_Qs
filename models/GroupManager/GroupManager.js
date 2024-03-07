import fanCfg from '../getCfg.js'
import fanBase from '../fanBase.js'
import { getQQ } from '../unreadable/getQQ.js'
import { RecallBatch } from '../unreadable/Recall.js'
import { RecallGroup } from '../unreadable/RecallGroup.js'
import _ from 'lodash'

export default class GroupManager extends fanBase {
  constructor (e) {
    super(e)
    this.model = 'GroupManager'
    this.config = fanCfg.getFile('./config/config/', 'other')
  }

  async PullBlack () {
    let msg = this.e.msg
    let qq = await getQQ(this.e)
    if (qq) msg = `#${msg.includes('#拉黑') ? '拉' : '解'}黑${qq}`

    const match = /^#(拉黑|解黑|取消拉黑)(QQ|Q群|QQ群|群)?(\d+)/u.exec(msg)
    if (!match) return '未识别到操作指令喵！'

    let [, action, targetType, target] = match
    if (!target) return '未检测到要操作的对象喵！'

    targetType = `${targetType || 'QQ号'}`
    if (isNaN(Number(target))) return `${targetType}[${target}]不是合法的数字喵！`
    target = Number(target)

    const isGroup = targetType.includes('群')
    const type = isGroup ? 'Group' : 'QQ'
    action = _.isEqual(action, '拉黑')
    msg = ''

    if (action) {
      if (this.config[`black${type}`].includes(target)) return `${targetType}[${target}]已经在黑名单中了喵！`
      if (isGroup) {
        if (!this.config.whiteGroup) return
        _.pull(this.config.whiteGroup, target)
        msg += `已将Q群[${target}]从白名单移除喵！\n`
      }
      this.config[`black${type}`].push(target)
      msg += `已将${targetType}拉黑喵！以后不再响应该${targetType}的任何指令喵！`
    } else {
      if (!this.config[`black${type}`].includes(target)) return `${targetType}[${target}]不在黑名单中喵！`
      _.pull(this.config[`black${type}`], target)
      msg = `已将${targetType}[${target}]解黑喵！`
    }

    fanCfg.writeFile(this.config, './config/config/', 'other')
    return msg
  }

  async AddWhiteGroup (e) {
    let msg = this.e.msg
    const match = /^#(加白|加白群|添加白名单|添加白名单群)(Q群|QQ群|群)?(\d+)/u.exec(msg)
    if (!match) return '未识别到操作指令喵！'

    let [, , targetType, target] = match
    if (!target) return '未检测到要加白的群喵！'

    targetType = `${targetType || 'Q群号'}`
    if (isNaN(Number(target))) return `${targetType}[${target}]不是合法的数字喵！`

    target = Number(target)
    if (this.config.whiteGroup.includes(target)) return `${targetType}[${target}]已经在白名单中了喵！`
    this.config.whiteGroup.push(target)
    fanCfg.writeFile(this.config, './config/config/', 'other')
    return `已将群组[${target}]加白喵！`
  }

  async recall (batch = false) {
    if (batch) await RecallBatch(this.e)
    else await RecallGroup(this.e)
  }
}
