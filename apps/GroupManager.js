import GroupManager from '../models/GroupManager/GroupManager.js'

export class groupManager extends plugin {
  constructor () {
    super({
      name: 'FanSkyGroupManager',
      dsc: 'FanSky群管模块',
      event: 'message',
      priority: 3141,
      rule: [
        {
          reg: /^#(清|清理|清除|清空)(屏|屏幕|记录|历史)(.*)/u,
          fnc: 'Recall'
        }, {
          reg: /^#(批量撤回|大量撤回)(.*)/u,
          fnc: 'Recall'
        }, {
          reg: /^#(拉黑|解黑|取消拉黑)(QQ|Q群|QQ群|群)?(.*)/u,
          fnc: 'PullBlack'
        }, {
          reg: /^#(加白|加白群|添加白名单|添加白名单群)(Q群|QQ群|群)?(.*)/u,
          fnc: 'AddWhiteGroup'
        }
      ]
    })
  }

  async AddWhiteGroup () {
    if (!this.e.isMaster) {
      this.e.reply('你干嘛！喵!> x <')
      return false
    }
    if (await this.checkFunc()) return false

    const msg = await new GroupManager(this.e).AddWhiteGroup()
    await this.e.reply(msg)
    return true
  }

  async PullBlack () {
    if (!this.e.isMaster) {
      this.e.reply('你干嘛！喵!> x <')
      return false
    }
    if (await this.checkFunc()) return false

    const msg = await new GroupManager(this.e).PullBlack()
    await this.e.reply(msg)
    return true
  }

  async Recall () {
    if (!this.e.isGroup) {
      this.e.reply('这是群聊功能喵~')
      return false
    }
    if (await this.checkFunc()) return false

    const batch = /^#(批量撤回|大量撤回)(.*)/u.test(this.e.msg)
    return await new GroupManager(this.e).recall(batch)
  }

  async checkFunc () {
    let OpenStatus = JSON.parse(await redis.get('FanSky:FunctionOFF'))
    if (!OpenStatus.GroupManager) return false
  }
}
