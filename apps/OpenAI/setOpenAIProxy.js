export async function setOpenAIProxy(e, type) {
    if (!e.isMaster) {
        return false
    }
    let msg = e.original_msg || e.msg
    let Proxy
    if (type === "fan") {
        Proxy = msg.match(/#(设置|更改)fan代理(.*)/)[2]
    } else {
        Proxy = msg.match(/#(设置|更改)模型代理地址(.*)/)[2]
    }
    await set(Proxy, type)
    logger.info(logger.magenta('[FanSky_Qs][OpenAI]'), `设置模型代理地址：http://${Proxy}`)
    await e.reply(`[FanSky_Qs]已设置模型代理地址：http://${Proxy}\n小提示：":"需要为英文状态下的冒号，否则可能会报错`)
    return true
}

async function set(Proxy, type) {
    if (type === "fan") {
        await redis.set(`FanSky:OpenAI:AFanSKyQsProxy`, JSON.stringify({
            Proxy: `${Proxy}`,
        }))
    } else {
        await redis.set(`FanSky:OpenAI:Proxy:Default`, JSON.stringify({
            Proxy: `${Proxy}`,
        }))
    }
}