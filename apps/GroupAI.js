import GroupAI from '../models/OpenAIGroupAI.js'

export class GroupAIIndex extends plugin {
  constructor () {
    super({
      name: '[FanSky]OpenAI群AI',
      dsc: 'OpenAI群AI',
      event: 'message.group',
      priority: 1299,
      rule: [
        {
          reg: '^(?![#\\*])',
          fnc: 'OpenAIGroup',
          log: false
        }
      ]
    })
  }

  async OpenAIGroup () {
    let OpenStatus = JSON.parse(await redis.get('FanSky:FunctionOFF'))
    if (!OpenStatus.GroupOpenAI) return false

    let groupAI = await new GroupAI(this.e).groupAI()
    if (!groupAI) return false
    return true
  }
}
