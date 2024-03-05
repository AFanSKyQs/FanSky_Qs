export class UpdatePlugin extends plugin {
  constructor () {
    super({
      name: 'FanSky_Qs插件更新',
      dsc: 'FanSky_Qs插件更新',
      event: 'message',
      priority: 1,
      rule: [
        { reg: '^#(fan|Fansky|Fan|fans)(强制)?更新$' }
      ]
    })
  }

  accept () {
    this.e.msg = this.e.msg.includes('强制') ? '#强制更新FanSky_Qs' : '#更新FanSky_Qs'
  }
}
