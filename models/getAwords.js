import fetch from "node-fetch";

export async function getWords() {
    let url = 'https://v1.hitokoto.cn/'
    let res = await fetch(url).catch((err) => logger.error(err))
    if (!res) {
        logger.error('[一言] 接口请求失败')
        return "喵喵喵~"
    }
    res = await res.json()
    logger.info(`[接口结果] 一言：${res.hitokoto}`)
    /** 最后回复消息 */
    return res.hitokoto
}
