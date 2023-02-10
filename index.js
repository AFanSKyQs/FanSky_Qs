import fs from 'node:fs'

// // 等待2s
// await new Promise((resolve) => setTimeout(resolve, 2000))
Bot.logger.info('---------^_^---------')
Bot.logger.info(`FanSky_Qs插件初始化~`)

const files = fs.readdirSync('./plugins/FanSky_Qs/apps').filter(file => file.endsWith('.js'))
let ret = []
files.forEach((file) => {
  ret.push(import(`./apps/${file}`))
})
ret = await Promise.allSettled(ret)
let apps = {}
for (let i in files) {
  let name = files[i].replace('.js', '')

  if (ret[i].status !== 'fulfilled') {
    logger.error(`载入插件错误：${logger.red(name)}`)
    logger.error(ret[i].reason)
    continue
  }
  apps[name] = ret[i].value[Object.keys(ret[i].value)[0]]
}
export { apps }
