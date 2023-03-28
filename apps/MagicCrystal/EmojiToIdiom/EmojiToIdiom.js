import {getSendList} from "../../../models/MagicCrystal/EmojiToIdiom/getSendList.js";
import {getEmoji} from "../../../models/getString.js";
import {getWords} from "../../../models/getAwords.js";

export async function runGetIdiomEmoji(e) {
    if (!e.isGroup) return false
    if (await redis.get(`FanSky:MagicCrystal:${e.group_id}:EmojiNextCD`)) {
        let CD = await redis.ttl(`FanSky:MagicCrystal:${e.group_id}:EmojiNextCD`)
        e.reply(`请等待${CD}s后再发起喵~`, true)
        return false
    }
    if (await redis.get(`FanSky:MagicCrystal:${e.group_id}:EmojiCD`)) {
        let CD = await redis.ttl(`FanSky:MagicCrystal:${e.group_id}:EmojiCD`)
        e.reply(`当前正在[表情猜成语]中噢，${CD}后将自动结束~`, true)
        return false
    }
    e.reply('[emoji猜成语]开始啦：60s循环出题\n每个题目优先答出者将获得[魔晶]奖励', true)
    await new Promise(resolve => setTimeout(resolve, 3000));
    let SendEmoji = await getSendList()
    logger.info(logger.magenta('>>[FanSky_Qs]emoji猜成语: ' + SendEmoji.Idiom.word + ':' + SendEmoji.Emoji))
    await redis.set(`FanSky:MagicCrystal:${e.group_id}:EmojiCD`, JSON.stringify({
        Words: `${SendEmoji.Idiom.word}`,
        PinYin: `${SendEmoji.Idiom.pinyin}`,
        Rounds: 1
    }))
    await redis.expire(`FanSky:MagicCrystal:${e.group_id}:EmojiCD`, 60)
    setTimeout(async () => {
        let Answer = JSON.parse(await redis.get(`FanSky:MagicCrystal:${e.group_id}:EmojiCD`))
        if (Answer.Rounds === 1) {
            await e.reply(`[emoji猜成语]结束啦!没有人答出来，逊诶qwq${await getEmoji()}` + `\n${Answer.PinYin}\n${Answer.Words}`)
        } else {
            console.log(Answer)
            await e.reply(`[emoji猜成语]结束啦！进行了${Answer.Rounds}轮，群友的速度达到了${60 / (Answer.Rounds)}秒/题，GPU堪比战术核显！${await getEmoji()}`+`\n${Answer.PinYin}\n${Answer.Words}`)
            await redis.set(`FanSky:MagicCrystal:${e.group_id}:EmojiNextCD`, "EmojiNextCD")
            await redis.expire(`FanSky:MagicCrystal:${e.group_id}:EmojiNextCD`, 15)
        }
        logger.info(logger.magenta(`[FanSky_Qs][emoji猜成语]结束,共:[${Answer.Rounds}]轮`))
    }, 57777)
    e.reply(`---请看题回答4字成语---\n${SendEmoji.Emoji}`)
    return true
}