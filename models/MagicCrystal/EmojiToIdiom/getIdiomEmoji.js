import {getPinYin} from "./getPinYin.js";
import {GetEmoji} from "./getEmoji.js";

export async function getIdiomEmoji(Idiom) {
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
                SendEmoji += (WordPinYinEmoji + " ")
            }
        }
    }
    return {Emoji: SendEmoji, Idiom: Idiom[IdiomNum]}
}