export async function setOpenAIProxy(e) {
    if (!e.isMaster) {
        return false
    }
    let msg = e.original_msg || e.msg
    let Proxy = msg.match(/#(设置|更改)模型代理地址(.*)/)[2]
    await set(Proxy)
    logger.info(logger.magenta('[FanSky_Qs][OpenAI]'), `设置模型代理地址：http://${Proxy}`)
    await e.reply(`[FanSky_Qs]已设置模型代理地址：http://${Proxy}\n小提示：":"需要为英文状态下的冒号，否则可能会报错`)
    return true
}

async function set(Proxy) {
    await redis.set(`FanSky:OpenAI:Proxy:Default`, JSON.stringify({
        Proxy: `http://${Proxy}`,
    }))
}