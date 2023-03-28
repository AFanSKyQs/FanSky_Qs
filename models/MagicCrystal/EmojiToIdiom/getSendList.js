import {getIdiomEmoji} from "./getIdiomEmoji.js";
import fs from "fs";
let cwd = process.cwd().replace(/\\/g, "/")
let IdiomPath = `${cwd}/plugins/FanSky_Qs/resources/MagicCrystal/EmojiToIdiom/idiom.json`
export async function getSendList(){
    let Idiom = JSON.parse(fs.readFileSync(IdiomPath))
    let SendEmoji = await getIdiomEmoji(Idiom)
    while (SendEmoji.False) {
        Idiom = JSON.parse(fs.readFileSync(IdiomPath))
        SendEmoji = await getIdiomEmoji(Idiom)
    }
    return SendEmoji
}