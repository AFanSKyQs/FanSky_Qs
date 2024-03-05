let urls_one = "http://api.andeer.top/API/word_pic1.php"

export async function thuMUp(e) {
    if (e.isGroup) {
        if (e.guild_id) {
            await e.reply(`当前在频道，没有点赞噢喵~\n送你一个小星星叭☆~`)
            return true
        }
        await Bot.pickFriend(e.user_id).thumbUp(20);
        let MsgListTwo = [segment.at(e.user_id), "给你点赞了喵~\n没点上加我好友发【打卡】~", '\n', segment.image(urls_one)]
        await e.reply(MsgListTwo)
        return true
    }
    await Bot.sendLike(e.user_id, 20)
    await e.reply("赞了噢喵~,可以..可以回我一下嘛o(*////▽////*)q~,没点上请加我好友再发【打卡】~")
    return true
}

