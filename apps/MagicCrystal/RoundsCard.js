import fs from "fs";
import {segment} from "oicq";

let RoundsCardPath = `${process.cwd()}/plugins/FanSky_Qs/resources/MagicCrystal/AllCard/`

export async function RoundsCard(e) {
    if (await redis.exists(`FanSky:MagicCrystal:${e.user_id}:Card`)) {
        let CD = await redis.ttl(`FanSky:MagicCrystal:${e.user_id}:Card`)
        CD = Math.round(CD / 60 * 100) / 100
        e.reply(`请等待${CD}分钟后再来`)
        return false
    }
    await redis.set(`FanSky:MagicCrystal:${e.user_id}:Card`, JSON.stringify({
        User: `${e.user_id}`,
        Time: `${new Date().getTime()}`,
    }))
    await redis.expire(`FanSky:MagicCrystal:${e.user_id}:Card`, 60 * 60 * 4)
    let img = RoundsCardPath + fs.readdirSync(RoundsCardPath)[Math.floor(Math.random() * fs.readdirSync(RoundsCardPath).length)]
    let imgBuffer = fs.readFileSync(img);
    await e.reply(segment.image(imgBuffer), true)
    return true
}