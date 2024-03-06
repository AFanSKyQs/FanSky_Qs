import common from '../../../lib/common/common.js'
import _ from 'lodash'

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

    this.key = 'FanSky:FunctionOFF'
  }

  async FanSkySetting () {
    if (!this.e.isMaster) {
      this.e.reply('只有主人才能这样做喵！！喵呜！')
      return true
    }

    let Result = await this.parseUserInput(this.e.msg)
    if (Result.Tools) await this.setRedis(Result.Tools, Result.ToolsStatus)

    const msg = await common.makeForwardMsg(this.e, await this.getRedis(), '[FanSky_Qs]当前设置')
    await this.e.reply(msg)
    return true
  }

  async setRedis (FunctionKey, FunctionStatus) {
    let OpenStatus = JSON.parse(await redis.get(this.key))
    OpenStatus[FunctionKey] = FunctionStatus
    await redis.set(this.key, JSON.stringify(OpenStatus))
  }

  async getRedis (e) {
    let OpenStatus = JSON.parse(await redis.get(this.key))

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
    let ReturnSet = {}
    const match = input.match(/^#(fan|fans|fansky)设置(.*)$/)
    if (!match) {
      ReturnSet.Setting = true
      return ReturnSet
    }

    let args = match[2].trim()

    if (!args) ReturnSet.Setting = true
    else {
      args = args.replace('OpenAI系统', '聊天系统')
      const toolsRegex = new RegExp(`(${_.keys(this.functionKeyMap).join('|')})(开启|关闭)`)
      const toolsMatches = args.match(toolsRegex)

      if (toolsMatches) {
        const functionName = this.functionKeyMap[toolsMatches[1]]
        const functionStatus = toolsMatches[2] === '开启' ? 1 : 0
        const functionObj = { [functionName]: functionStatus }
        ReturnSet = Object.entries(functionObj).reduce((acc, [key, value]) => {
          acc.Tools = key
          acc.ToolsStatus = value
          return acc
        }, {})
      } else {
        ReturnSet.Setting = true
      }
    }
    return ReturnSet
  }
}
