import axios from "axios";

export async function OpenAIQuota(e, OpenAIKey) {
    if (OpenAIKey.error) {
        await e.reply(OpenAIKey.error)
        return false
    }
    logger.info(logger.cyan(`[OpenAI]查询配额key:`), `${OpenAIKey.OpenAI_Key}`)
    let OpenAIQuota = await axios.get(`https://v1.apigpt.cn/key/?key=${OpenAIKey.OpenAI_Key.trim()}`)
    let CreateTime = new Date(OpenAIQuota.data.effective_at * 1000).toLocaleString()
    let ExpiresTime = new Date(OpenAIQuota.data.expires_at * 1000).toLocaleString()
    let MsgList = []
    MsgList.push(`查询：${OpenAIQuota.data.msg}\n`)
    MsgList.push(`总额 | 已用 | 剩余\n${OpenAIQuota.data.total_granted} | ${OpenAIQuota.data.total_used} | ${OpenAIQuota.data.total_available} $(刀)\n`)
    MsgList.push(`创建：${CreateTime}\n`)
    MsgList.push(`到期：${ExpiresTime}\n`)
    await e.reply(MsgList)
    return true
}