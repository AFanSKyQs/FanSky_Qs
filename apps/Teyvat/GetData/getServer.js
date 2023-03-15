/**
 * uid=>服务器
 * @param {String} uid 查询uid
 * @param {Boolean} teyvat 小助手 默认false
 * @returns
 */
function getServer (uid, teyvat = false) {
  if (uid[0] === '5') {
    return 'cn_qd01'
  } else if (uid[0] === '6') {
    return teyvat ? 'us' : 'os_usa'
  } else if (uid[0] === '7') {
    return teyvat ? 'eur' : 'os_euro'
  } else if (uid[0] === '8') {
    return teyvat ? 'asia' : 'os_asia'
  } else if (uid[0] === '9') {
    return teyvat ? 'hk' : 'os_cht'
  } else {
    return 'cn_gf01'
  }
}
export default getServer
