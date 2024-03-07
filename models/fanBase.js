const cwd = process.cwd().replace(/\\/g, '/')

export default class fanBase {
  constructor (e = {}) {
    this.e = e
    this.userId = e?.user_id
    this.model = 'FanSky'
    this.plugPath = `${cwd}/plugins/FanSky_Qs/`
  }

  get prefix () {
    return `FanSky:${this.model}:`
  }
}
