import common from '../../../lib/common/common.js'
import _ from 'lodash'

const key = 'FanSky:FunctionOFF'
let OpenStatus = JSON.parse(await redis.get(key))

export class FanSkySetting extends plugin {
  constructor () {
    super({
      name: 'FanSky设置',
      dsc: 'FanSky设置',
      event: 'message',
      priority: 9,
      rule: [
        {
          reg: '^#(fan|fans|fansky)设置',
          fnc: 'FanSkySetting'
        }
      ]
    })

    this.functionKeyMap = {
      群管系统: 'GroupManager',
      原神系统: 'Teyvat',
      魔晶系统: 'MagicCrystal',
      聊天系统: 'OpenAI',
      娱乐系统: 'SmallFunction',
      艾特对话: 'AtTalk',
      点赞功能: 'thuMUpON',
      github推送: 'GitHubPush',
      发病功能: 'Crazy',
      模型接口4: 'OpenAI4',
      群聊AI: 'GroupOpenAI'
    }
  }

  async FanSkySetting () {
    if (!this.e.isMaster) {
      this.e.reply('只有主人才能这样做喵！！喵呜！')
      return
    }

    let msg = this.e.msg.match(/^#(fan|fans|fansky)设置(.*)$/)[2].trim() || ''
    if (msg) {
      let res = await this.parseUserInput(msg)
      if (res.Tools) await this.setRedis(res)
    }

    msg = await common.makeForwardMsg(this.e, this.setList(), '[FanSky_Qs]当前设置')
    await this.e.reply(msg)
    return true
  }

  async setRedis (res) {
    OpenStatus[res.Tools] = res.ToolsStatus
    await redis.set(this.key, JSON.stringify(OpenStatus))
  }

  setList () {
    const setList = []
    _.each(this.functionKeyMap, (v, k) => {
      if (k === '艾特对话') setList.push('\n【其他小设置】：')
      else if (k === '模型接口4') setList.push('\n【OpenAI】：')
      setList.push(`${k}：${OpenStatus[v] ? '开启' : '关闭'}`)
    })

    return [
      '指令：#fan设置+系统名+开启/关闭\n如：#fan设置群管系统开启',
      setList.join('\n')
    ]
  }

  async parseUserInput (input) {
    input = input.replace('OpenAI系统', '聊天系统')

    let toolsMatches = new RegExp(`(${_.keys(this.functionKeyMap).join('|')})(开启|关闭)`)
    toolsMatches = input.match(toolsMatches)

    return toolsMatches
      ? {
          Tools: this.functionKeyMap[toolsMatches[1]],
          ToolsStatus: toolsMatches[2] === '开启' ? 1 : 0
        }
      : {}
  }
}
