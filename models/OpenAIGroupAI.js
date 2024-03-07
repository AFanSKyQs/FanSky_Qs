import FanCfg from './getCfg.js'
import { ModelGPT3Turbo } from '../bapps/OpenAI/ModelGPT3Turbo.js'
import fanBase from './fanBase.js'

export default class GroupAI extends fanBase {
  constructor (e) {
    super(e)
    this.model = 'OpenAI'
    this.groupId = this.e.group_id
  }

  async groupAI () {
    if (!this.groupId) return false

    const aiCfg = FanCfg.getFile('cfg', 'OpenAI', 'json')
    let cfgKey = aiCfg.OpenAIGroup
    if (!cfgKey.length || !cfgKey.includes(String(this.groupId))) return false

    const key = `${this.prefix}Status:${this.groupId}`
    if (await redis.get(key)) return false

    if (!this.e.atBot && !this.e.atme) {
      if (Math.random() > 0.3) return false
    }

    const ResMsg = await this.ReturnResMsg()
    if (!ResMsg) return false

    cfgKey = aiCfg.OpenAI_Key
    if (cfgKey === '这里填入你的OpenAI密钥即可' || !cfgKey) return false

    logger.info(ResMsg)
    await redis.setEx(key, 20, JSON.stringify({ Status: 1 }))
    await ModelGPT3Turbo(this.e, cfgKey, aiCfg, '不限', ResMsg, true)
    return true
  }

  async ReturnResMsg () {
    logger.info(logger.magenta(`[FanSky_Qs]群AI:${this.groupId}`))

    const BeginSeq = this.e.seq
    let source = await this.e.group.getChatHistory(BeginSeq, 1).pop()
    if (source) {
      const MsgText = source.message.find(msg => msg.type === 'text')
      if (!MsgText) return false
    }

    const keywords = ['角色面板', '开始获取', '当前面板服务', '开始获取', '#绑定', '退群了', '绑定成功', '来切换uid', '请重新绑定', '米游社查询', '可能会需要一定时间', '更新面板', '角色展柜', '当前uid', '当前绑定']
    let ResMsg = ''
    for (let i = BeginSeq - 40; i <= BeginSeq; i++) {
      source = await this.e.group.getChatHistory(i, 1).pop()
      if (source) {
        try {
          let MsgText = source.message.find(msg => msg.type === 'text')
          const Msg_Bface = source.message.find(msg => msg.type === 'bface')
          const Msg_face = source.message.find(msg => msg.type === 'face')
          if (MsgText && MsgText.text) {
            MsgText = MsgText.text
            if (MsgText.length > 90 || MsgText.startsWith('#') || MsgText.startsWith('*')) continue

            const atMsg = source.message.find(msg => msg.type === 'at')
            const prefix = atMsg ? `@${atMsg.qq} ` : ''

            let containsKeyword = false
            for (const word of keywords) {
              if (MsgText.includes(word)) {
                containsKeyword = true
                break
              }
            }
            if (containsKeyword) continue

            // [emoji] [/emoji]
            ResMsg += `${source.user_id}:${prefix}${MsgText}\n`
          } else if (Msg_Bface && Msg_Bface.text) {
            if (Msg_Bface.text.includes('请使用最新版')) continue
            ResMsg += `${source.user_id}:[表情]${Msg_Bface.text}\n`
          } else if (Msg_face && Msg_face.text) {
            if (Msg_face.text.includes('请使用最新版')) continue
            ResMsg += `${source.user_id}:[表情]${Msg_face.text}\n`
          }
        } catch (err) {
          logger.error(err)
        }
      }
    }
    ResMsg += `${Bot.uin}:`
    return ResMsg
  }
}
