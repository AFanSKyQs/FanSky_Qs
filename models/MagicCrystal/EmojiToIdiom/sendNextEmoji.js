import {getSendList} from "./getSendList.js";

export async function sendNextEmoji(e, Rounds) {
    let SendEmoji = await getSendList()
    logger.info(logger.magenta('>>[FanSky_Qs]emoji猜成语: ' + SendEmoji.Idiom.word + ':' + SendEmoji.Emoji))
    const ttl = await redis.ttl(`FanSky:MagicCrystal:${e.group_id}:EmojiCD`)
    await redis.set(`FanSky:MagicCrystal:${e.group_id}:EmojiCD`, JSON.stringify({
        Words: `${SendEmoji.Idiom.word}`,
        PinYin: `${SendEmoji.Idiom.pinyin}`,
        Rounds: Rounds
    }))
    await redis.expire(`FanSky:MagicCrystal:${e.group_id}:EmojiCD`, ttl)
    e.reply(`第${Rounds}轮：\n${SendEmoji.Emoji}`)
    return false
}