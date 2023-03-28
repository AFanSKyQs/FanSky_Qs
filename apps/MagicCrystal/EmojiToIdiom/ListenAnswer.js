import {getEmoji} from "../../../models/getString.js";
import {sendNextEmoji} from "../../../models/MagicCrystal/EmojiToIdiom/sendNextEmoji.js";

export async function ListenAnswer(e) {
    if (!e.msg) return false
    let Answer = JSON.parse(await redis.get(`FanSky:MagicCrystal:${e.group_id}:EmojiCD`))
    let UserAnswer = e.msg.replace(/\s+/g, "").replace(/\r/g, "").replace(/\n/g, "")
    if (UserAnswer === Answer.Words) {
        let UserName = e.sender.nickname || e.sender.card || e.user_id
        e.reply(`恭喜[${UserName}]答对了!\n${Answer.PinYin}\n${Answer.Words}`)
        await new Promise(resolve => setTimeout(resolve, 3000));
        if (await redis.get(`FanSky:MagicCrystal:${e.group_id}:EmojiCD`)) {
            let CD = await redis.ttl(`FanSky:MagicCrystal:${e.group_id}:EmojiCD`)
            if (CD < 5) {
                return false
            }
            await e.reply(`请听下一题，当轮剩余${CD}s ` + await getEmoji() + "..")
            await sendNextEmoji(e, Answer.Rounds += 1)
            return false
        }
    }
    return false
}