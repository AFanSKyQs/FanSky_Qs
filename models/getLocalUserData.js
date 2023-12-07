import fs from "fs";

let cwd = process.cwd().replace(/\\/g, '/')


export async function getLocalUserData(e, uid) {
    let LocalUserData = cwd + '/data/PlayerData/gs/'
    let UidData = `${LocalUserData}${uid}.json`
    if (e.guild_id) {
        logger.info(UidData)
    } else {
        Bot.logger.info(UidData)
    }
    if (!fs.existsSync(UidData)) {
        return null
    }
    return JSON.parse(fs.readFileSync(UidData, 'utf-8'))
}