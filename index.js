import fs from 'fs'
import {StarRunCheckConfig} from "./tools/StarRunCheckConfig.js";

let cwd = process.cwd().replace(/\\/g, '/')
logger.info(logger.magenta(`'-------------QwQ--------------`))
let PluginVersion = JSON.parse(fs.readFileSync(`${cwd}/plugins/FanSky_Qs/package.json`));
logger.info(logger.magenta(`----FanSky_Qs插件【${PluginVersion.version}】初始化中------`))
const files = fs.readdirSync('./plugins/FanSky_Qs/apps').filter(file => file.endsWith('.js'))
await StarRunCheckConfig()
let ret = []
files.forEach((file) => {
    ret.push(import(`./apps/${file}`))
})
ret = await Promise.allSettled(ret)
let apps = {}
let APackageFanError = 0
for (let i in files) {
    let name = files[i].replace('.js', '')
    if (ret[i].status !== 'fulfilled') {
        logger.error(`[FanSky_Qs]载入JS错误：${logger.red(name)}`)
        const ARegexFan = /Cannot find package '([^']+)'/;
        let AFanReaSon = ret[i].reason + ""
        const AMatchFan = AFanReaSon.match(ARegexFan);
        if (AMatchFan) {
            const APackageNameY = AMatchFan[1];
            logger.warn(`请先在${logger.red(`plugins/FanSky_Qs`)}目录运行：${logger.red(`pnpm install`)}安装依赖`)
            APackageFanError++
        } else {
            logger.error(ret[i].reason)
        }
        delete apps[name];
        continue
    }
    apps[name] = ret[i].value[Object.keys(ret[i].value)[0]]
}
Bot.logger.info(`----FanSky_Qs插件载入完成------`)
if (APackageFanError > 0) {
    logger.warn(logger.yellow(`---请按提示安装依赖，否则对应功能会无效喵！------`))
    logger.warn(logger.yellow(`---请按提示安装依赖，否则对应功能会无效喵！------`))
}
export {apps}