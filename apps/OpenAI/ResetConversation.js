import {DelGPT3TurboList, ResetGPT3TurboList} from "./ModelGPT3Turbo.js";

export async function DelAllConversation(e) {
    if (!e.isMaster) {
        e.reply('你不可以这样做噢喵~，因为这个是清除所有人的对话记录的，只有主人才可以这样做喵~')
        return true
    } else {
        try {
            await DelGPT3TurboList()
            e.reply('已清空[所有用户]的OpenAI对话记录~\n如果有正在请求中的记录请等待请求完成~')
        } catch (err) {
            e.reply('后台似乎报错了喵~')
            console.log(err)
        }
    }
    return true
}

export async function ResetConversation(e) {
    try {
        await ResetGPT3TurboList(e)
        e.reply('已重置您的对话记录~\n如果有正在请求中的记录请等待请求完成喵~')
    } catch (err) {
        e.reply('后台似乎报错了喵~')
        console.log(err)
    }
    return true
}