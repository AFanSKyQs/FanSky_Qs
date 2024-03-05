/**
 * uid=>服务器
 * @param {String} uid 查询uid
 * @param {Boolean} teyvat 小助手 默认false
 * @returns
 */
function getServer (uid, teyvat = false) {
  let firstNum = Number(uid[0])
  switch (firstNum) {
    case 5:
      return 'cn_qd01'
    case 6:
      return teyvat ? 'us' : 'os_usa'
    case 7:
      return teyvat ? 'eur' : 'os_euro'
    case 8:
      return teyvat ? 'asia' : 'os_asia'
    case 9:
      return teyvat ? 'hk' : 'os_cht'
    default:
      return 'cn_gf01'
  }
}
export default getServer
