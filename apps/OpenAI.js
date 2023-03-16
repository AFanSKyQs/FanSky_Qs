/* eslint-disable camelcase */
import plugin from '../../../lib/plugins/plugin.js'
import common from '../../../lib/common/common.js'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import Markdown_it from 'markdown-it'
import axios from 'axios'
import fs from 'fs'
import getCfg from '../models/getCfg.js'
// 每个人的单次对话长度，即存储的记忆轮数，管理员不受限，直到报错
let userCount = [0] // 从一开始艾特开始，回复8次即为9轮，即重置该人的对话
let CountMember = 9
let adminCount = 99 // 管理员不受限制，直到报错
const MarkDownIT = new Markdown_it()
let yunPath = process.cwd()
let _path = `${process.cwd()}/resources/FanSky`
let path = `${process.cwd()}/resources/FanSky/SignIn.json`
let path_SignTop = `${process.cwd()}/resources/FanSky/SignTop.json`
let htmlPath = `${process.cwd()}/plugins/FanSky_Qs/resources/OpenAI/`
let cssPath = `${htmlPath}OpenAI.html`
let Axios = []
let OpenAIList = ['']
let Moudel1List = []
let MoudelStatus = [] // 模型状态
let Moudel1Num = [] // 模型1的轮数
export class OpenAI extends plugin {
  constructor () {
    super({
      name: 'OpenAI_ChatGPT',
      dsc: 'OpenAI_ChatGPT',
      event: 'message',
      // 优先级(数值越小优先度越高)
      priority: 3141,
      // 消息匹配规则
      rule: [
        {
          reg: /^#清空所有|#清空全部|#清除所有|#清除全部$/i,
          fnc: 'DelAll'
        },
        {
          reg: /#对话列表|#聊天列表|#会话列表/,
          fnc: 'Axios_list'
        },
        {
          reg: /.*/i,
          fnc: 'OpenAI'
        }, {
          reg: /#?(对话|语言)?模型列表/,
          fnc: 'OpenAPModel_list'
        }
      ]
    })
  };

  async OpenAI (e) {
    // if (e.message[0].type !== "at") {
    //     return false
    // }
    // if (e.message[1].type !== "text") {
    //     return false
    // }
    if (!e.isGroup && !e.isMaster) {
      return false
    }
    if (/^#/.test(e.msg)) {
      // e.reply("如果是想与AI对话\n请不要在开头输入#\n【这一般是指令】\n\n如果是指令请不要艾特机器人\n【艾特一般是与机器人对话】", true)
      return false
    }
    // console.log('e.atBot:' + e.atBot)
    if (!e.atBot && !e.atme) return false
    if (!e.msg) {
      e.reply('你想对我说什么呢？baka不要空白呀！', true)
      return false
    }
    const Json = await getCfg(yunPath, 'OpenAI')
    const OpenAI_Key = Json.OpenAI_Key
    if (OpenAI_Key === '这里填入你的OpenAI密钥即可' || !OpenAI_Key || OpenAI_Key === '') {
      logger.info(logger.cyan('没有OpenAI密钥喵，可发送#设置模型key sk-xxxxxxx来设置密钥喵~'))
      // e.reply("要与OpenAI聊天吗喵qwq,请先在FanSky_Qs/config/OpenAI中填写你的OpenAI_Key")
      return false
    }
    const BlackList = Json.BlackList // [123, 456] 黑名单列表
    if (BlackList.includes(e.user_id)) {
      e.reply('伱被禁止与我聊天了呜呜（；へ：）~', true)
      console.log('\nAI对话黑名单：' + e.user_id)
      return true
    }
    if (MoudelStatus[e.user_id]) {
      e.reply('AI正在处理柠上一个请求噢~', true)
      return true
    }
    if (Json.Model === 1) {
      await this.OpenAIModel1(e, OpenAI_Key, Json)
    } else if (Json.Model === 2) {
      await this.OpenAIModel2(e, OpenAI_Key, Json.Model_list[1], Json)
    }
    return true
  }

  async OpenAIModel1 (e, OpenAI_Key, Json) {
    let msg = e.msg
    Bot.logger.info('处理插件：FanSky_Qs-OpenAI模型1:' + `\n群：${e.group_id}\n` + 'QQ:' + `${e.user_id}\n` + `消息：${msg}`)
    let GetResult = '不限'
    if (Json.SignMode === '开启') {
      GetResult = await this.SingIn(e)
      console.log('GetResult:' + GetResult)
      if (!GetResult || GetResult === true || GetResult === 'true') {
        return true
      }
    }
    MoudelStatus[e.user_id] = true
    let Persona = Json.Persona// 人设
    let DataList = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: Persona }
      ]
    }
    if (!Moudel1List[e.user_id]) {
      DataList.messages.push({ role: 'user', content: msg })
      Moudel1List[e.user_id] = DataList
      Moudel1Num[e.user_id] = 1
    } else {
      // 先对比一下本次预设的人设是否与上次一致，如果不一致则重置重新开始
      if (Moudel1List[e.user_id].messages[0].content !== Persona) {
        e.reply('AI检测到人设已经改变，已重置记忆，生成中...', true, { recallMsg: 10 })
        DataList.messages.push({ role: 'user', content: msg })
        Moudel1List[e.user_id] = DataList
        Moudel1Num[e.user_id] = 1
      } else {
        Moudel1List[e.user_id].messages.push({ role: 'user', content: msg })
        Moudel1Num[e.user_id]++
      }
    }
    console.log(Moudel1List[e.user_id])
    try {
      axios({
        method: 'post',
        url: 'https://api.openai.com/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + OpenAI_Key
        },
        data: JSON.stringify(Moudel1List[e.user_id]),
        proxy: {
          protocol: 'http',
          host: '127.0.0.1',
          port: 7890
        }
      }).then(async function (response) {
        console.log(response.data.choices[0])
        let result = response.data.choices[0].message.content
        let SendResult = `【魔晶：${GetResult} | 重置：${10 - Moudel1Num[e.user_id]} | ${response.data.choices[0].message.content.length}字】\n` + result
        e.reply(SendResult, true)
        Moudel1List[e.user_id].messages.push({ role: 'assistant', content: result })
        delete MoudelStatus[e.user_id]
        if (Moudel1Num[e.user_id] >= 10 && !e.isMaster) {
          delete Moudel1List[e.user_id]
          delete Moudel1Num[e.user_id]
        }
        if (Json.ModelMode === 1) {
          delete Moudel1List[e.user_id]
          delete Moudel1Num[e.user_id]
        }
      }).catch(function (error) {
        delete Moudel1List[e.user_id]
        delete MoudelStatus[e.user_id]
        e.reply('Clash设置未生效或其他问题喵~')
        console.log(error)
      })
    } catch (err) {
      e.reply('运行有问题~,请联系开发人员(3141865879)')
      console.log(err)
    }
  }

  async OpenAPModel_list (e) {
    let Model_list = (await getCfg(yunPath, 'OpenAI')).Model_list
    let Model_list_str = ''
    for (let i = 0; i < Model_list.length; i++) {
      Model_list_str += `${i + 1}、${Model_list[i]}\n`
    }
    e.reply(`模型列表：\n${Model_list_str}\n\n请发送[更换语言模型+数字]来切换模型\n如：更换语言模型1`)
    return true
  }

  async DelAll (e) {
    if (!e.isMaster) {
      return true
    } else {
      OpenAIList = ['']
      userCount = [0]
      Axios = []
      e.reply('已清空所有')
      return true
    }
  }

  async Axios_list (e) {
    if (!e.isMaster) {
      return true
    } else {
      if (!OpenAIList.length) {
        e.reply('对话列表为空')
        return true
      }
      await ScreenAndSend(e, OpenAIList[0])
    }
  }

  async SingIn (e) {
    if (!fs.existsSync(_path)) {
      console.log('已创建FanSky文件夹')
      fs.mkdirSync(_path)
    }
    if (!fs.existsSync(path)) {
      fs.writeFileSync(path, '{}')
      console.log('已创建SignIn.json文件')
    }
    if (!fs.existsSync(path_SignTop)) {
      fs.writeFileSync(path_SignTop, '{}')
      console.log('已创建SignTop.json文件')
    }
    let SignDay = JSON.parse(fs.readFileSync(path))
    if (!SignDay[e.user_id]) {
      e.reply('没有您的打卡记录\n请发送[打卡/冒泡]来打卡\n获取魔晶以进行对话')
      return true
    }
    if (SignDay[e.user_id].rough < 8 && !e.isMaster) {
      e.reply(`您的[魔晶]：${SignDay[e.user_id].rough}\n少于8，已无法进行对话\n攒攒魔晶吧喵~`)
      return true
    }
    if (!e.isMaster) {
      SignDay[e.user_id].rough -= 8
    }
    fs.writeFileSync(path, JSON.stringify(SignDay))
    return SignDay[e.user_id].rough
  }

  async OpenAIModel2 (e, OpenAI_Key, Model, Json) {
    let msg = e.msg
    Bot.logger.info('处理插件：FanSky_Qs-OpenAI模型2:' + `\n群：${e.group_id}\n` + 'QQ:' + `${e.user_id}\n` + `消息：${msg}`)
    let GetResult = '不限'
    if (Json.SignMode === '开启') {
      GetResult = await this.SingIn(e)
      console.log('GetResult:' + GetResult)
      if (!GetResult || GetResult === true || GetResult === 'true') {
        return true
      }
    }
    MoudelStatus[e.user_id] = true
    if (!Axios[e.user_id]) {
      Axios[e.user_id] = ['']
      OpenAIList[0] = OpenAIList[0] + `【${OpenAIList.length}】:${e.user_id}\n`
    }
    if (!userCount[e.user_id] || userCount[e.user_id][0] === 0) {
      userCount[e.user_id] = 0
      if (e.isMaster) {
        userCount[e.user_id] = adminCount
      } else {
        userCount[e.user_id] = CountMember
      }
      Axios[e.user_id] = ['']
    }
    Axios[e.user_id][0] = Axios[e.user_id][0] + `\nHuman:${msg}`
    console.log('Axios:' + Axios[e.user_id][0])
    const OpenAI = {
      model: `${Model}`,
      prompt: Axios[e.user_id][0],
      max_tokens: 2048,
      temperature: 0.3,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
      stop: [' Human:', ' AI:']
    }
    try {
      userCount[e.user_id] = userCount[e.user_id] - 1
      await this.MsgOpenAIModel2(e, OpenAI, GetResult, OpenAI_Key, Json)
    } catch (err) {
      delete MoudelStatus[e.user_id]
      e.reply('AI出错了！请联系开发人员（3141865879）\n' + err, true)
      await common.sleep(3000)
      await Bot.pickFriend(3141865879).sendMsg(`错误信息：${err}\n群组：${e.group_id}\n` + '用户:' + `${e.user_id}`)
      console.log(err)
      return true
    }
  }

  async MsgOpenAIModel2 (e, PostDate, GetResult, OpenAI_KEY, Json) {
    try {
      axios({
        method: 'post',
        url: 'https://api.openai.com/v1/completions',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Encoding': 'gzip,deflate',
          'Content-Length': 1024,
          'Transfer-Encoding': 'chunked',
          Authorization: 'Bearer ' + OpenAI_KEY
        },
        data: JSON.stringify(PostDate),
        proxy: {
          protocol: 'http',
          host: '127.0.0.1',
          port: 7890
        }
      }).then(async function (response) {
        let ReciveMsg = response.data.choices[0].text
        let Axios_Temp = ReciveMsg
          .replace(/机器人：/, '').trim()
          .replace(/\n/, '').trim()
          .replace(/答：/, '').trim()
          .replace(/AI:/, '').trim()
          .replace(/Bot:/, '').trim()
          .replace(/robot:/, '').trim()
          .replace(/Robot:/, '').trim()
          .replace(/Computer:/, '').trim()
          .replace(/computer:/, '').trim()
        if (Axios_Temp.startsWith('，') || Axios_Temp.startsWith('？') || Axios_Temp.startsWith('?') || Axios_Temp.startsWith(',') || Axios_Temp.startsWith('。')) {
          Axios_Temp = Axios_Temp.slice(1)
        }
        if (Axios_Temp.startsWith('吗？') || Axios_Temp.startsWith('吗?')) {
          Axios_Temp = Axios_Temp.slice(2)
        }
        Axios[e.user_id][0] = Axios[e.user_id][0] + '\nAI:' + Axios_Temp
        if (!Axios_Temp.startsWith('【')) {
          Axios_Temp = `【距对话重置：${userCount[e.user_id]}】\n【消耗8魔晶 | 剩余：${GetResult}】` + Axios_Temp
        }
        if (userCount[e.user_id] === 0) {
          if (e.isMaster) {
            userCount[e.user_id] = adminCount
          } else {
            userCount[e.user_id] = CountMember
          }
          Axios[e.user_id] = ['']
          e.reply('对话已重置，将开始新的记忆。')
        }
        if (Json.ModelMode === 1) {
          Axios[e.user_id] = ['']
        }
        let TextToImg = (await getCfg(yunPath, 'OpenAI')).Text_img
        if (Axios_Temp.length > TextToImg) {
          await ScreenAndSend(e, Axios_Temp)
        } else {
          e.reply(Axios_Temp, true)
        }
        delete MoudelStatus[e.user_id]
      }).catch(function (error) {
        delete MoudelStatus[e.user_id]
        console.log(error)
        Axios[e.user_id] = ['']
        e.reply('超过记忆上限，已重置对话', true)
        console.log('超过对话上限！')
      })
    } catch (err) {
      delete MoudelStatus[e.user_id]
      e.reply('AI出错了！请联系开发人员（3141865879）\n' + err, true)
      await common.sleep(3000)
      await Bot.pickFriend(3141865879).sendMsg(`错误信息：${err}\n群组：${e.group_id}\n` + '用户:' + `${e.user_id}`)
      console.log(err)
      return true
    }
    return true
  }
}

async function ScreenAndSend (e, message) {
  if (message) {
    console.log('OpenAI:' + message)
    let OpenAI = message.replace(/ /g, '&nbsp;').replace(/\n/g, '<br>')
    let img = await puppeteer.screenshot('OpenAI', { tplFile: cssPath, htmlDir: htmlPath, OpenAI }) // 截图
    e.reply(img)
    return true
  } else {
    e.reply('消息为空，已退出')
    return true
  }
}
