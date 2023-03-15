import fs from 'fs'
import { isFileExist } from '../isFileExist.js'
import cfg from '../../../../lib/config/config.js'

export async function ReadOpenAIDefaultConfig () {
  const fileURL = `${process.cwd()}/plugins/FanSky_Qs/config/OpenAI.json`
  const defaultURL = `${process.cwd()}/plugins/FanSky_Qs/config/default_config.json`
  const fileURL_ = fileURL.replace(/\\/g, '/')
  // 检测文件是否存在
  if (!await isFileExist(fileURL_)) {
    fs.copyFileSync(defaultURL, fileURL_)
    logger.info(logger.cyan('首次启动本插件喵~，欢迎使用，已创建OpenAI.json'))
    logger.info(logger.cyan('请在plugins/FanSky_Qs/config/OpenAI.json中填入你的OpenAI密钥即可使用OpenAI功能喵~'))
    let list = cfg.masterQQ
    for (let userId of list) {
      await Bot.pickFriend(userId).sendMsg('[首次启动提示]：如果要使用OpenAI功能请发送\n#设置模型key sk-xxxxxxx\n然后Clash打开开关即可(非内陆节点均可)。')
    }
  }
}
