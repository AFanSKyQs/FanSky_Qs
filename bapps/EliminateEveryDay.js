import fs from 'fs'
import cfg from '../../../lib/config/config.js'

let Sign_path = `${process.cwd()}/resources/FanSky/SignIn.json`
let Top_path = `${process.cwd()}/resources/FanSky/SignTop.json`
let Test1_path = `${process.cwd()}/resources/FanSky/Test1.json`
let Test2_path = `${process.cwd()}/resources/FanSky/Test2.json`

export class EliminateEveryDay extends plugin {
  constructor () {
    super({
      name: '重置每日打卡状态',
      dsc: '重置每日打卡状态',
      event: 'message',
      priority: 8,
      rule: [
        {
          reg: /^#?(重置打卡|清除打卡)$/,
          fnc: 'ClearSign'
        }
      ]
    })
    this.task = {
      name: '清除打卡状态',
      cron: '0 0 0 * * *',
      fnc: async () => {
        await this.ClearSignTask()
        await this.ClearTop()
      }
    }
  }

  async isFileExist (isFilePath) {
    return new Promise((resolve, reject) => {
      fs.access(isFilePath, (err) => {
        if (err) {
          resolve(false)
        } else {
          resolve(true)
        }
      })
    })
  }

  async ClearTop () {
    const RunPath = await this.ChangePath(Top_path)
    let isExist = await this.isFileExist(RunPath)

    // let list = cfg.masterQQ;
    if (!isExist) {
      // let SendNum = 0
      console.log('isExist:' + isExist)
      // for (let userId of list) {
      //     if (SendNum >= 2) {
      //         break;
      //     }
      //     if (userId.length > 11) continue
      //     await Bot.pickFriend(userId).sendMsg("SignTop已经重置过啦~。")
      //     await new Promise(resolve => setTimeout(resolve, 5000));
      //     SendNum++
      // }
      return true
    }
    console.log('isExist:' + isExist)
    fs.unlink(RunPath, async (err) => {
      if (err) {
        console.log(err)
        // let SendNum = 0
        // for (let userId of list) {
        //     if (SendNum >= 2) {
        //         break;
        //     }
        //     if (userId.length > 11) continue
        //     await Bot.pickFriend(userId).sendMsg("SignTop重置失败：\n" + err)
        //     await new Promise(resolve => setTimeout(resolve, 5000));
        //     SendNum++
        // }
        return true
      }
      console.log('文件删除成功')
      // let SendNum = 0
      // for (let userId of list) {
      //     if (SendNum >= 2) {
      //             break;
      //         }
      //     if (userId.length > 11) continue
      //     await Bot.pickFriend(userId).sendMsg("不知不觉已经00点啦，新的一天要开心喵~\nSignTop重置成功。")
      //     await new Promise(resolve => setTimeout(resolve, 5000));
      //     SendNum++
      // }
    })
  }

  async ChangePath (changePath) {
    return changePath.replace(/\\/g, '/')
  }

  async ClearSignTask () {
    const RunPath = await this.ChangePath(Sign_path)
    let isExist = await this.isFileExist(RunPath)
    // let list = cfg.masterQQ;
    if (!isExist) {
      console.log('isExist:' + isExist)
      // let SendNum = 0
      // for (let userId of list) {
      //     if (SendNum >= 2) {
      //         break;
      //     }
      //     if (userId.length > 11) continue
      //     await Bot.pickFriend(userId).sendMsg("Sign文件还不存在~。")
      //     await new Promise(resolve => setTimeout(resolve, 5000));
      //     SendNum++
      // }
      return true
    }
    let data = JSON.parse(fs.readFileSync(RunPath))
    let Num = 0
    let SignNum = 0
    for (let user in data) {
      if (data[user].today === true) {
        SignNum++
      }
      data[user].today = false
      Num++
    }
    fs.writeFileSync(RunPath, JSON.stringify(data))
    // let msg = [
    //     `重置打卡状态：${Num}位\n打卡：${SignNum}位。\n当前时间: ` + new Date().toLocaleString()
    // ];
    // let SendNum = 0
    // for (let userId of list) {
    //     if (SendNum >= 2) {
    //         break;
    //     }
    //     if (userId.length > 11) continue
    //     await Bot.pickFriend(userId).sendMsg(msg)
    //     await new Promise(resolve => setTimeout(resolve, 5000));
    //     SendNum++
    // }
  }

  async ClearSign (e) {
    if (!e.isMaster) {
      e.reply('你在干什么baka!~')
      return true
    }
    const RunPath = await this.ChangePath(Sign_path)
    let data = JSON.parse(fs.readFileSync(RunPath))
    let Num = 0
    for (let user in data) {
      data[user].today = false
      Num++
    }
    fs.writeFileSync(RunPath, JSON.stringify(data))
    await this.ClearTop()
    e.reply(`总计${Num}用户，已重置今日打卡状态为false喵~`)
    return true
  }
}
