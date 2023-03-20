import {DelGPT3TurboList, ResetGPT3TurboList} from "./ModelGPT3Turbo.js";
import {DelModelText003, ResetModelText003} from "./ModelTextDavinci003.js";

export async function DelAllConversation(e) {
    if (!e.isMaster) {
        e.reply('你不可以这样做噢喵~，因为这个是清除所有人的对话记录的，只有主人才可以这样做喵~')
        return true
    } else {
        try {
            await DelGPT3TurboList()
            await DelModelText003()
            e.reply('已清空[所有用户]的OpenAI对话记录~')
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
        await ResetModelText003(e)
        e.reply('已重置您的对话记录~')
    } catch (err) {
        e.reply('后台似乎报错了喵~')
        console.log(err)
    }
    return true
}