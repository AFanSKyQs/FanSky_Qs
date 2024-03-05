export default class MysApi {
  constructor (e, uid, mysInfo) {
    this.e = e
    this.mysInfo = mysInfo
    this.ckInfo = mysInfo.ckInfo
    this.ckUser = mysInfo.ckUser
    this.uid = uid
    e.isSelfCookie = this.isSelfCookie
  }

  get isSelfCookie () {
    return this.uid * 1 === this.ckUid * 1 || this?.mysInfo?.isSelf
  }

  get ckUid () {
    return this.ckInfo.uid
  }

  static async init (e, auth = 'all') {
    let mys = await e.runtime.getMysInfo(auth)
    if (!mys) return false

    let uid = mys.uid
    e._mys = new MysApi(e, uid, mys)
    return e._mys
  }

  static async getAT_UID (e, auth = 'all') {
    // 兼容处理老版本Yunzai
    let uid = e.runtime.uid || e.uid
    if (e.at) {
      // 暂时使用MysApi.init替代
      let mys = await MysApi.init(e, auth)
      if (!mys) return false

      uid = mys.uid || uid
    }
    if (uid) return uid
  }
}
