import fs from "fs";
import {getPinYin} from "../../models/MagicCrystal/getPinYin.js";
import {GetEmoji} from "../../models/MagicCrystal/getEmoji.js";

let cwd = process.cwd().replace(/\\/g, "/")
let IdiomPath = `${cwd}/plugins/FanSky_Qs/resources/MagicCrystal/EmojiToIdiom/idiom.json`

async function getIdiomEmoji(Idiom) {

    let IdiomNum = Math.floor(Math.random() * Idiom.length)
    console.log(Idiom[IdiomNum])
    let SendEmoji = ''
    for (let i = 0; i < 4; i++) {
        let Word = Idiom[IdiomNum].word
        let WordPinYin = await getPinYin(Word[i])
        if (!WordPinYin) {
            return {False: "PinYin"}
        } else {
            let WordPinYinEmoji = await GetEmoji(WordPinYin)
            if (!WordPinYinEmoji) {
                return {False: "Emoji"}
            } else {
                SendEmoji += WordPinYinEmoji
            }
        }
    }
    return SendEmoji
}

export async function runGetIdiomEmoji(e) {
    let Idiom = JSON.parse(fs.readFileSync(IdiomPath))
    let SendEmoji = await getIdiomEmoji(Idiom)
    while (SendEmoji.False) {
        Idiom = JSON.parse(fs.readFileSync(IdiomPath))
        SendEmoji = await getIdiomEmoji()
    }
    logger.info(logger.magenta('>>[FanSky_Qs]emoji猜成语: ' + Idiom.word))
    e.reply(`${Idiom.word}:${SendEmoji}`)
    return true
}