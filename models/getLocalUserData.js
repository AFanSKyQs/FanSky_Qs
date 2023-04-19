import fs from "fs";

let cwd=process.cwd().replace(/\\/g, '/')


export async function getLocalUserData(e, uid) {
    let LocalUserData = cwd+'/data/UserData/'
    let UidData = `${LocalUserData}${uid}.json`
    Bot.logger.info(UidData)
    if (!fs.existsSync(UidData)) {
        return null
    }
    return JSON.parse(fs.readFileSync(UidData, 'utf-8'))
}